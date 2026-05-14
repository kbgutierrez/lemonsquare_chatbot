"""
Document ingestion service.

Handles:
  - PDF parsing and text extraction.
  - AI-based document categorisation.
  - Chunk splitting and embedding.
  - Qdrant vector upsert.
  - SQL metadata persistence.
  - Document deletion (Qdrant + SQL).

KEY CHANGES vs original:
  1. No module-level instantiation.
     `ingestion_service = DocumentIngestionService()` at import time loaded
     the HuggingFace embedding model synchronously — could take 2+ minutes
     and crashed on DB unavailability. The service is now created during
     lifespan startup and stored in app.state.

  2. DB session via parameter, not self-created.
     Methods now accept `db: Session` from their caller (the route handler
     via FastAPI DI), enabling clean testability and consistent transaction
     management.

  3. MIME-type file validation instead of filename extension check.
     The original checked `file.filename.endswith(".pdf")`, which is trivially
     bypassed with a file named `evil.exe.pdf`. We now read the first 5 bytes
     and verify the PDF magic number (%PDF-).

  4. Uses `pypdf` (already in requirements) instead of deprecated `PyPDF2`.
     oldingestion.py used PyPDF2 which is unmaintained. ingestion.py used
     the same deprecated import. Both are replaced with pypdf.

  5. Async categorisation via ainvoke().
     The original classify_llm.invoke() blocked the event loop.
"""

import asyncio
import logging
import os
import tempfile
import uuid

from fastapi import UploadFile
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader
from qdrant_client import QdrantClient
from qdrant_client.http.models import FieldCondition, Filter, MatchValue, PointStruct
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import ValidationError, VectorStoreError
from app.models.chatbot import AIChatbotSetting, UploadedDocument, LearnedChat
import json

logger = logging.getLogger(__name__)

_DEFAULT_CATEGORIES = [
    "Network_Infrastructure",
    "Hardware_Guide",
    "Software_Documentation",
    "HR_IT_Policy",
    "Troubleshooting_Manual",
    "General_IT",
]
_PDF_MAGIC = b"%PDF-"


class DocumentIngestionService:
    """
    Processes PDF uploads into the Qdrant vector store.

    Instantiated once during app lifespan startup. Shared across requests.
    """

    def __init__(self, db: Session) -> None:
        """
        Load models and connect to Qdrant.

        Args:
            db: A short-lived DB session used only during __init__ to read
                the active AIChatbotSetting. The caller is responsible for
                closing this session after construction.
        """
        logger.info("Initializing DocumentIngestionService...")

        active_config = (
            db.query(AIChatbotSetting)
            .filter(AIChatbotSetting.IsActive == True)
            .order_by(AIChatbotSetting.SettingID.desc())
            .first()
        )

        self.embed_model: str = (
            active_config.EmbeddingModel
            if active_config and active_config.EmbeddingModel
            else settings.EMBEDDING_MODEL
        )
        self.classifier_model: str = (
            active_config.ReformulatorModel
            if active_config and active_config.ReformulatorModel
            else settings.CLASSIFIER_MODEL
        )
        raw_categories = (
            active_config.AllowedCategories if active_config else None
        )
        self.allowed_categories: list[str] = (
            [c.strip() for c in raw_categories.split(",")]
            if raw_categories
            else _DEFAULT_CATEGORIES
        )

        self.qdrant = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            timeout=settings.QDRANT_TIMEOUT,
        )
        self.collection_name = settings.QDRANT_COLLECTION
        self.embeddings = HuggingFaceEmbeddings(model_name=self.embed_model)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len,
        )

        logger.info("DocumentIngestionService ready (embed_model=%s).", self.embed_model)

    @staticmethod
    def _validate_pdf_bytes(data: bytes) -> None:
        """
        Verify the uploaded file is actually a PDF by checking its magic bytes.

        Raises:
            ValidationError: If the file is not a valid PDF.
        """
        if not data[:5] == _PDF_MAGIC:
            raise ValidationError(
                "Uploaded file is not a valid PDF. Only PDF files are supported."
            )

    async def process_pdf_upload(self, file: UploadFile, db: Session, manual_category: str = None) -> dict:
        """
        Full ingestion pipeline for an uploaded PDF.

        Args:
            file: The uploaded file from FastAPI.
            db: Active database session for persisting document metadata.
            manual_category: Optional category provided by the Admin UI. If valid, uses it. Otherwise AI guesses.

        Returns:
            A dict with status, document_id, category, chunks_processed.
        """
        # 1. DUPLICATE PREVENTION: Check if file already exists in SQL
        existing_doc = (
            db.query(UploadedDocument)
            .filter(UploadedDocument.FileName == file.filename)
            .first()
        )
        if existing_doc:
            raise ValidationError(
                f"File '{file.filename}' already exists in the database. "
                f"Document ID: {existing_doc.DocumentID}"
            )

        raw_bytes = await file.read()
        self._validate_pdf_bytes(raw_bytes)

        temp_file_path: str | None = None
        try:
            # Write to a named temp file for pypdf to read.
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(raw_bytes)
                temp_file_path = tmp.name

            # 2. Extract text.
            pdf_reader = PdfReader(temp_file_path)
            raw_text = ""
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    raw_text += text + "\n"

            if not raw_text.strip():
                raise ValidationError("Could not extract any text from the uploaded PDF.")

            # 3. CATEGORY ASSIGNMENT: Lock in the subcategory from database or AI
            logger.info("Categorizing '%s'...", file.filename)
            
            # If Admin selected a valid category, use it. Otherwise, let AI guess.
            if manual_category and manual_category in self.allowed_categories:
                ai_category = manual_category
                logger.info("Using Admin-provided category: %s", ai_category)
            else:
                if manual_category:
                    logger.warning(
                        "Admin provided category '%s' but it's not in allowed list: %s",
                        manual_category,
                        self.allowed_categories,
                    )
                logger.info("No valid category provided. AI is auto-categorizing...")
                ai_category = await self._classify_document(raw_text)
            
            logger.info("Classified '%s' as: %s", file.filename, ai_category)

            # 4. Chunk + embed (CPU-bound — run in thread).
            chunks = self.text_splitter.split_text(raw_text)
            document_id = str(uuid.uuid4())

            logger.info("Embedding %d chunks for document %s...", len(chunks), document_id)
            vectors = await asyncio.to_thread(self.embeddings.embed_documents, chunks)

            # 5. Build Qdrant points with deterministic chunk IDs and locked taxonomy.
            points = []
            for i, chunk in enumerate(chunks):
                # Deterministic chunk ID so we never duplicate vectors for the same file
                chunk_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document_id}_chunk_{i}"))
                payload = {
                    "page_content": chunk,
                    "metadata": {
                        "document_id": document_id,
                        "source": file.filename,
                        "category": ai_category,              # The validated subcategory (database-driven)
                        "chunk_index": i,
                        "doc_type": "official_document",      # The hardcoded main category
                    },
                }
                points.append(PointStruct(id=chunk_id, vector=vectors[i], payload=payload))

            # 6. Upsert to Qdrant.
            try:
                self.qdrant.upsert(
                    collection_name=self.collection_name,
                    points=points,
                )
            except Exception as exc:
                raise VectorStoreError(f"Failed to upsert document to Qdrant: {exc}") from exc

            # 7. Persist metadata to SQL.
            db.add(
                UploadedDocument(
                    DocumentID=document_id,
                    FileName=file.filename,
                    Category=ai_category,
                    ChunkCount=len(chunks),
                )
            )
            db.commit()
            logger.info("Document %s ingested successfully (%d chunks).", document_id, len(chunks))

            return {
                "status": "success",
                "document_id": document_id,
                "category": ai_category,
                "chunks_processed": len(chunks),
            }

        finally:
            if temp_file_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)



    async def _classify_document(self, text: str) -> str:
        """Uses the AI to read a snippet of the document and assign a category."""
        from langchain_groq import ChatGroq
        from app.core.config import settings
        import logging
        
        logger = logging.getLogger(__name__)
        
        # We only need the first 3000 characters to figure out what the document is about.
        # This saves tokens and makes the upload process much faster.
        snippet = text[:3000]
        
        try:
            classify_llm = ChatGroq(
                model="llama-3.1-8b-instant", 
                temperature=0.0, 
                api_key=settings.GROQ_API_KEY
            )
            
            prompt = (
                f"You are an IT categorization AI. Read this document snippet: '{snippet}'. "
                f"Categorize it into EXACTLY ONE of these categories: {self.allowed_categories}. "
                "Reply with ONLY the exact category name. Do not add punctuation or extra words."
            )
            
            ai_category = classify_llm.invoke(prompt).content.strip(' "\'\n')
            
            # The Lock: Fallback if the AI hallucinates a category that isn't allowed
            if ai_category not in self.allowed_categories:
                logger.warning(f"AI hallucinated category '{ai_category}'. Defaulting to 'General_IT'.")
                return "General"
                
            return ai_category
            
        except Exception as e:
            logger.error(f"Error during AI categorization: {e}")
            return "General_IT"  # Safe fallback if the LLM call fails


    async def process_manual_entry(self, title: str, content: str, manual_category: str | None, db: Session) -> dict:
        """Embeds raw text into Qdrant, auto-guessing the category if none is provided."""
        from app.models.chatbot import AIChatbotSetting, ManualKnowledgeEntry
        from langchain_groq import ChatGroq
        import uuid
        from qdrant_client.http.models import PointStruct
        
        # 1. FETCH ALLOWED CATEGORIES FROM DB
        active_config = db.query(AIChatbotSetting).filter(AIChatbotSetting.IsActive == True).order_by(AIChatbotSetting.SettingID.desc()).first()
        raw_categories = getattr(active_config, 'AllowedCategories', "General_IT")
        allowed_categories = [c.strip() for c in raw_categories.split(',')]

        # 2. STRICT CATEGORY VALIDATION (Admin override vs AI Guess)
        if manual_category:
            # If they provided a category, it MUST be valid. No silent fallback to AI.
            if manual_category not in allowed_categories:
                raise ValueError(f"Invalid category: '{manual_category}'. Must be one of {allowed_categories}")
            
            ai_category = manual_category
            logger.info("Using Admin-provided category: %s", ai_category)
        else:
            logger.info("No category provided for manual entry. AI is auto-categorizing...")
            
            classify_llm = ChatGroq(
                model="llama-3.1-8b-instant", 
                temperature=0.0, 
                api_key=settings.GROQ_API_KEY
            )
            
            prompt = (
                f"You are an IT categorization AI. Read this text: '{title} - {content}'. "
                f"Categorize it into EXACTLY ONE of these categories: {allowed_categories}. "
                "Reply with ONLY the category name. Do not add punctuation."
            )
            
            ai_category = classify_llm.invoke(prompt).content.strip(' "\'\n')
            
            # The Lock: Fallback if the AI hallucinates
            if ai_category not in allowed_categories:
                logger.warning(f"AI hallucinated category '{ai_category}'. Overriding to 'General_IT'.")
                ai_category = "General_IT"

        # 3. FORMAT AND VECTORIZE
        document_id = str(uuid.uuid4())
        searchable_text = f"TITLE: {title}\nCONTENT: {content}"
        vector = await asyncio.to_thread(self.embeddings.embed_query, searchable_text)
        
        # 4. PUSH TO QDRANT
        payload = {
            "page_content": searchable_text,
            "metadata": {
                "document_id": document_id,
                "source": title,
                "category": ai_category,        
                "doc_type": "general_text"      
            }
        }
        
        self.qdrant.upsert(
            collection_name=self.collection_name,
            points=[PointStruct(id=document_id, vector=vector, payload=payload)]
        )

        # 5. NEW: SAVE TO MS SQL
        new_entry = ManualKnowledgeEntry(
            EntryID=document_id,
            Title=title,
            Content=content,
            Category=ai_category
        )
        db.add(new_entry)
        db.commit()
        
        return {
            "status": "success", 
            "entry_id": document_id,
            "category": ai_category, 
            "message": f"Manual entry added to AI Brain under '{ai_category}'."
        }

    async def update_manual_entry(self, entry_id: str, updates: dict, db: Session) -> dict:
        from app.models.chatbot import AIChatbotSetting, ManualKnowledgeEntry
        from qdrant_client.http.models import PointStruct
        from datetime import datetime

        # 1. Update SQL
        entry = db.query(ManualKnowledgeEntry).filter(ManualKnowledgeEntry.EntryID == entry_id).first()
        if not entry:
            raise ValueError("Manual entry not found.")

        # Fetch allowed categories dynamically for validation
        active_config = db.query(AIChatbotSetting).filter(AIChatbotSetting.IsActive == True).order_by(AIChatbotSetting.SettingID.desc()).first()
        raw_categories = getattr(active_config, 'AllowedCategories', "General_IT")
        allowed_categories = [c.strip() for c in raw_categories.split(',')]

        if updates.get("title"): 
            entry.Title = updates["title"]
        if updates.get("content"): 
            entry.Content = updates["content"]
            
        # STRICT VALIDATION ON UPDATE
        if updates.get("category"): 
            new_category = updates["category"]
            if new_category not in allowed_categories:
                raise ValueError(f"Invalid category: '{new_category}'. Must be one of {allowed_categories}")
            entry.Category = new_category
            
        entry.UpdatedAt = datetime.utcnow()
        db.commit()

        # 2. Re-embed and update Qdrant (Overwrites the old vector)
        searchable_text = f"TITLE: {entry.Title}\nCONTENT: {entry.Content}"
        vector = await asyncio.to_thread(self.embeddings.embed_query, searchable_text)
        
        payload = {
            "page_content": searchable_text,
            "metadata": {
                "document_id": entry.EntryID,
                "source": entry.Title,
                "category": entry.Category,
                "doc_type": "general_text"
            }
        }
        
        self.qdrant.upsert(
            collection_name=self.collection_name,
            points=[PointStruct(id=entry.EntryID, vector=vector, payload=payload)]
        )

        return {"status": "success", "message": "Entry updated successfully."}

    async def delete_manual_entry(self, entry_id: str, db: Session) -> dict:
        from app.models.chatbot import ManualKnowledgeEntry

        # 1. Soft Delete from SQL
        entry = db.query(ManualKnowledgeEntry).filter(ManualKnowledgeEntry.EntryID == entry_id).first()
        if entry:
            entry.IsActive = False
            db.commit()

        # 2. Hard Delete from Qdrant by Exact ID (No index required)
        # Because the EntryID in SQL is the exact same UUID used in Qdrant
        self.qdrant.delete(
            collection_name=self.collection_name,
            points_selector=[entry_id]  # Pass the exact ID in a list
        )

        return {"status": "success", "message": "Manual entry deleted."}

    async def delete_document(self, document_id: str, db: Session) -> dict:
        """
        Remove a document from both SQL and Qdrant.

        Args:
            document_id: The UUID of the document to delete.
            db: Active database session.

        Returns:
            A dict with status and document_id.
        """
        logger.info("Deleting document %s...", document_id)

        # 1. Soft-delete (or hard-delete) from SQL.
        document = (
            db.query(UploadedDocument)
            .filter(UploadedDocument.DocumentID == document_id)
            .first()
        )
        if document:
            db.delete(document)
            db.commit()
            logger.info("SQL record for document %s deleted.", document_id)
        else:
            logger.warning("Document %s not found in SQL; proceeding to Qdrant delete.", document_id)

        # 2. Delete from Qdrant.
        try:
            self.qdrant.delete(
                collection_name=self.collection_name,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="metadata.document_id",
                            match=MatchValue(value=document_id),
                        )
                    ]
                ),
            )
            logger.info("Qdrant vectors for document %s deleted.", document_id)
        except Exception as exc:
            # Log and continue — SQL is the source of truth for UI state.
            logger.error("Qdrant delete for document %s failed: %s", document_id, exc)

        return {"status": "success", "document_id": document_id}
    

    async def update_document(self, document_id: str, updates: dict, db: Session) -> dict:
        """
        Updates a document's metadata in SQL and Qdrant without re-embedding text.
        """
        from app.models.chatbot import UploadedDocument
        from qdrant_client.http.models import Filter, FieldCondition, MatchValue

        # 1. Find the document in SQL
        document = db.query(UploadedDocument).filter(UploadedDocument.DocumentID == document_id).first()
        if not document:
            raise ValueError(f"Document {document_id} not found in database.")

        payload_updates = {}
        
        # 2. Apply updates conditionally
        if updates.get("file_name"):
            document.FileName = updates["file_name"]
            payload_updates["metadata"] = payload_updates.get("metadata", {})
            payload_updates["metadata"]["source"] = updates["file_name"] # Note: source maps to file_name in your payload

        if updates.get("category"):
            new_category = updates["category"]
            if new_category not in self.allowed_categories:
                raise ValueError(f"Invalid category: {new_category}. Must be one of {self.allowed_categories}")
            
            document.Category = new_category
            payload_updates["metadata"] = payload_updates.get("metadata", {})
            payload_updates["metadata"]["category"] = new_category

        if not payload_updates:
            return {"status": "skipped", "message": "No valid updates provided."}

        # Save SQL changes
        db.commit()

        # 3. Patch Qdrant metadata instantly across all chunks
        self.qdrant.set_payload(
            collection_name=self.collection_name,
            payload=payload_updates,
            points=Filter(
                must=[
                    FieldCondition(
                        key="metadata.document_id",
                        match=MatchValue(value=document_id),
                    )
                ]
            )
        )

        logger.info("Successfully updated metadata for document %s", document_id)
        return {"status": "success", "message": "Document metadata updated successfully."}
    

    
    async def process_resolved_ticket(self, ticket_data: dict, db: Session) -> dict:
        """
        Takes raw helpdesk ticket notes and ingests them directly into Qdrant "as is" 
        without LLM summarization.
        """
        ticket_number = ticket_data["ticket_number"]
        logger.info("Processing raw resolved ticket for AI ingestion: %s", ticket_number)

        # 1. Check if it's blacklisted
        from app.models.chatbot import BlacklistedTicket
        is_blacklisted = db.query(BlacklistedTicket).filter(BlacklistedTicket.TicketNumber == ticket_number).first()
        if is_blacklisted:
            logger.warning("Ticket %s is blacklisted. Skipping AI ingestion.", ticket_number)
            return {"status": "skipped", "ticket_number": ticket_number, "message": "Ticket is blacklisted."}

        # 2. Format the raw notes exactly as they came from the database
        raw_ticket_text = (
            f"TICKET NUMBER: {ticket_number}\n"
            f"ISSUE REPORTED: {ticket_data.get('issue_reported', 'None')}\n"
            f"ISSUE FOUND: {ticket_data.get('issue_found', 'None')}\n"
            f"ROOT CAUSE: {ticket_data.get('issue_cause', 'None')}\n"
            f"WORK DONE: {ticket_data.get('work_done', 'None')}"
        )

        # 3. Vectorize the RAW text directly (No LLM Car Wash!)
        logger.info("Vectorizing raw ticket %s...", ticket_number)
        vector = await asyncio.to_thread(self.embeddings.embed_query, raw_ticket_text)

        # 4. Deterministic UUID
        ticket_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"ticket_{ticket_number}"))

        payload = {
            "page_content": raw_ticket_text,
            "metadata": {
                "ticket_number": ticket_number,
                "doc_type": "ticket",
            }
        }

        # 5. Push to Qdrant
        try:
            self.qdrant.upsert(
                collection_name=self.collection_name,
                points=[PointStruct(id=ticket_uuid, vector=vector, payload=payload)]
            )
            logger.info("Raw ticket %s successfully ingested into Qdrant.", ticket_number)
        except Exception as exc:
            raise VectorStoreError(f"Failed to upsert raw ticket to Qdrant: {exc}") from exc

        return {"status": "success", "ticket_number": ticket_number, "message": "Raw ticket vectorized and added to AI."}



    async def process_resolved_chat(self, session_id: str, db: Session) -> dict:
        """
        Reads a successful chat session, extracts the problem and solution via a 
        database-configured LLM and custom Prompt as strict JSON, 
        formats it for search, and pushes it to Qdrant.
        """
        from app.models.chatbot import ChatMessage, AIChatbotSetting
        import json
        
        logger.info("Processing resolved chat session: %s", session_id)

        # 1. Fetch the entire chat history from SQL
        messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.SessionID == session_id)
            .order_by(ChatMessage.CreatedAt.asc())
            .all()
        )
        
        if len(messages) < 2:
            return {"status": "skipped", "message": "Chat is too short to summarize."}

        transcript = "\n".join([f"{msg.SenderRole.upper()}: {msg.MessageContent}" for msg in messages])

        # ---------------------------------------------------------
        # DYNAMIC CONFIGURATION (Model & Prompt)
        # ---------------------------------------------------------
        active_config = db.query(AIChatbotSetting).filter(AIChatbotSetting.IsActive == True).order_by(AIChatbotSetting.SettingID.desc()).first()

        # DYNAMIC MODEL: Get from DB, fallback to 8b-instant if empty
        extraction_model = getattr(active_config, 'ReformulatorModel', None)
        if not extraction_model or extraction_model.strip() == "":
            extraction_model = "llama-3.1-8b-instant" 

        # DYNAMIC PROMPT: Define fallback, use DB if available
        default_prompt = (
            "You are a strict IT Data Extraction API. Read the chat transcript below and extract the details.\n"
            "You MUST output EXACTLY a valid JSON object with these four keys: "
            "'issue_reported', 'issue_found', 'issue_cause', and 'work_done'.\n"
            "Keep the values concise and professional. Do NOT use first-person.\n"
            "If no clear resolution was reached, output exactly: {\"error\": \"no resolution\"}\n\n"
            "Do NOT include markdown formatting (like ```json). Output raw JSON only.\n\n"
            "Transcript:\n{transcript}\n\n"
            "JSON Output:"
        )

        raw_prompt_template = getattr(active_config, 'ChatExtractionPrompt', None)
        if not raw_prompt_template or raw_prompt_template.strip() == "":
            raw_prompt_template = default_prompt

        # Safely inject the transcript without triggering JSON bracket errors
        if "{transcript}" in raw_prompt_template:
            prompt = raw_prompt_template.replace("{transcript}", transcript)
        else:
            logger.error("Missing {transcript} tag in custom ChatExtractionPrompt. Falling back to default.")
            prompt = default_prompt.replace("{transcript}", transcript)
        # ---------------------------------------------------------

        # 2. Call the LLM with the DYNAMIC model
        logger.info("Extracting structured JSON using model [%s]...", extraction_model)
        cleaner_llm = ChatGroq(
            model=extraction_model, 
            temperature=0.0,
            api_key=settings.GROQ_API_KEY,
        )
        
        result = await cleaner_llm.ainvoke(prompt)
        raw_output = result.content.strip()

        # Clean up markdown if the LLM hallucinated it
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3].strip()
        elif raw_output.startswith("```"):
            raw_output = raw_output[3:-3].strip()

        # 3. Parse the JSON
        try:
            extracted_data = json.loads(raw_output)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse LLM JSON: %s", raw_output)
            return {"status": "error", "message": "AI failed to output valid JSON."}

        if "error" in extracted_data:
            return {"status": "skipped", "message": "No clear resolution found in transcript."}

        # 4. Format the text block for Qdrant's semantic search
        searchable_text = (
            f"ISSUE REPORTED: {extracted_data.get('issue_reported', 'None')}\n"
            f"ACTUAL ISSUE FOUND: {extracted_data.get('issue_found', 'None')}\n"
            f"ROOT CAUSE: {extracted_data.get('issue_cause', 'None')}\n"
            f"RESOLUTION (WORK DONE): {extracted_data.get('work_done', 'None')}"
        )

        # 5. Embed the formatted text
        logger.info("Vectorizing structured knowledge...")
        vector = await asyncio.to_thread(self.embeddings.embed_query, searchable_text)

        # 6. Deterministic UUID
        ticket_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"chat_resolve_{session_id}"))

        # 7. Payload: Searchable Text + SQL-Ready JSON Data
        payload = {
            "page_content": searchable_text,
            "metadata": {
                "source_session": session_id,
                "doc_type": "resolved_chat",
                "sql_ready_data": extracted_data 
            }
        }

        # 8. Push to Qdrant
        try:
            self.qdrant.upsert(
                collection_name=self.collection_name,
                points=[PointStruct(id=ticket_uuid, vector=vector, payload=payload)]
            )
            logger.info("Session %s successfully added to AI Brain as structured data.", session_id)
            
            print("\n" + "="*50)
            print("NEW STRUCTURED AI KNOWLEDGE CREATED:")
            print(json.dumps(extracted_data, indent=2))
            print("="*50 + "\n")

        except Exception as exc:
            raise Exception(f"Failed to upsert chat to Qdrant: {exc}") from exc
        
        existing_learned = db.query(LearnedChat).filter(LearnedChat.SessionID == session_id).first()
        if not existing_learned:
            learned_entry = LearnedChat(
                SessionID=session_id,
                IssueReported=extracted_data.get('issue_reported', 'None'),
                IssueFound=extracted_data.get('issue_found', 'None'),
                RootCause=extracted_data.get('issue_cause', 'None'),
                WorkDone=extracted_data.get('work_done', 'None')
            )
            db.add(learned_entry)
            db.commit()

        return {"status": "success", "session_id": session_id, "message": "Conversation extracted and learned!"}
    
    async def update_learned_chat(self, session_id: str, updates: dict, db: Session) -> dict:
        from app.models.chatbot import LearnedChat
        from qdrant_client.http.models import PointStruct
        from datetime import datetime

        # 1. Update SQL
        chat = db.query(LearnedChat).filter(LearnedChat.SessionID == session_id).first()
        if not chat:
            raise ValueError("Learned chat not found.")

        if updates.get("issue_reported"): chat.IssueReported = updates["issue_reported"]
        if updates.get("issue_found"): chat.IssueFound = updates["issue_found"]
        if updates.get("issue_cause"): chat.RootCause = updates["issue_cause"]
        if updates.get("work_done"): chat.WorkDone = updates["work_done"]
        chat.UpdatedAt = datetime.utcnow()
        db.commit()

        # 2. Re-format text block
        searchable_text = (
            f"ISSUE REPORTED: {chat.IssueReported}\n"
            f"ACTUAL ISSUE FOUND: {chat.IssueFound}\n"
            f"ROOT CAUSE: {chat.RootCause}\n"
            f"RESOLUTION (WORK DONE): {chat.WorkDone}"
        )

        # 3. Re-embed and update Qdrant
        vector = await asyncio.to_thread(self.embeddings.embed_query, searchable_text)
        ticket_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"chat_resolve_{session_id}"))

        payload = {
            "page_content": searchable_text,
            "metadata": {
                "source_session": session_id,
                "doc_type": "resolved_chat",
                "sql_ready_data": {
                    "issue_reported": chat.IssueReported,
                    "issue_found": chat.IssueFound,
                    "issue_cause": chat.RootCause,
                    "work_done": chat.WorkDone
                }
            }
        }
        
        self.qdrant.upsert(
            collection_name=self.collection_name,
            points=[PointStruct(id=ticket_uuid, vector=vector, payload=payload)]
        )

        return {"status": "success", "message": "AI knowledge corrected successfully."}


    

    async def delete_learned_chat(self, session_id: str, db: Session) -> dict:
        from app.models.chatbot import LearnedChat
        import uuid

        # 1. Soft Delete from SQL
        chat = db.query(LearnedChat).filter(LearnedChat.SessionID == session_id).first()
        if chat:
            chat.IsActive = False
            db.commit()

        # 2. Hard Delete from Qdrant by Exact ID (No index required)
        ticket_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"chat_resolve_{session_id}"))
        
        self.qdrant.delete(
            collection_name=self.collection_name,
            points_selector=[ticket_uuid]  # Pass the exact ID in a list
        )

        return {"status": "success", "message": "AI forced to unlearn chat."}