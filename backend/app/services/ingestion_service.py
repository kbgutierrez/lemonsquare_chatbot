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
from app.models.chatbot import AIChatbotSetting, UploadedDocument

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

    async def process_pdf_upload(self, file: UploadFile, db: Session) -> dict:
        """
        Full ingestion pipeline for an uploaded PDF.

        Args:
            file: The uploaded file from FastAPI.
            db: Active database session for persisting document metadata.

        Returns:
            A dict with status, document_id, category, chunks_processed.
        """
        raw_bytes = await file.read()
        self._validate_pdf_bytes(raw_bytes)

        temp_file_path: str | None = None
        try:
            # Write to a named temp file for pypdf to read.
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(raw_bytes)
                temp_file_path = tmp.name

            # 1. Extract text.
            pdf_reader = PdfReader(temp_file_path)
            raw_text = ""
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    raw_text += text + "\n"

            if not raw_text.strip():
                raise ValidationError("Could not extract any text from the uploaded PDF.")

            # 2. AI auto-categorisation (async LLM call).
            logger.info("Auto-categorizing '%s'...", file.filename)
            ai_category = await self._classify_document(raw_text)
            logger.info("Classified '%s' as: %s", file.filename, ai_category)

            # 3. Chunk + embed (CPU-bound — run in thread).
            chunks = self.text_splitter.split_text(raw_text)
            document_id = str(uuid.uuid4())

            logger.info("Embedding %d chunks for document %s...", len(chunks), document_id)
            vectors = await asyncio.to_thread(self.embeddings.embed_documents, chunks)

            # 4. Build Qdrant points.
            points = [
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vectors[i],
                    payload={
                        "page_content": chunk,
                        "metadata": {
                            "document_id": document_id,
                            "source": file.filename,
                            "category": ai_category,
                            "chunk_index": i,
                            "doc_type": "uploaded_manual",
                        },
                    },
                )
                for i, chunk in enumerate(chunks)
            ]

            # 5. Upsert to Qdrant.
            try:
                self.qdrant.upsert(
                    collection_name=self.collection_name,
                    points=points,
                )
            except Exception as exc:
                raise VectorStoreError(f"Failed to upsert document to Qdrant: {exc}") from exc

            # 6. Persist metadata to SQL.
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

    async def _classify_document(self, raw_text: str) -> str:
        """Use an LLM to classify the document into one of the allowed categories."""
        classify_llm = ChatGroq(
            model=self.classifier_model,
            temperature=0.0,
            api_key=settings.GROQ_API_KEY,
        )
        categories_string = ", ".join(self.allowed_categories)
        prompt = (
            "You are a strict document classifier API. Read the excerpt and "
            f"categorize it into EXACTLY ONE of these tags: {categories_string}\n\n"
            "Output ONLY the exact tag name. Do not explain.\n"
            f"Excerpt: {raw_text[:1500]}\n"
            "Category:"
        )
        result = await classify_llm.ainvoke(prompt)
        ai_category = result.content.strip(' "\'\n')

        if ai_category not in self.allowed_categories:
            logger.warning(
                "LLM returned unknown category '%s'. Falling back to 'General_IT'.",
                ai_category,
            )
            return "General_IT"
        return ai_category

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
    

    # Add this inside the DocumentIngestionService class in backend/app/services/ingestion_service.py
    
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
            Reads a successful chat session, extracts the problem and solution via LLM, 
            and pushes the new knowledge to Qdrant.
            """
            from app.models.chatbot import ChatMessage
            
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

            # 2. Format the transcript for the LLM
            transcript = "\n".join([f"{msg.SenderRole.upper()}: {msg.MessageContent}" for msg in messages])

            # 3. The "Car Wash" (LLM Extraction)
            cleaner_llm = ChatGroq(
                model=self.classifier_model, # Your 8B model
                temperature=0.1,
                api_key=settings.GROQ_API_KEY,
            )
            
            prompt = (
                "You are an IT Documentation Expert. Read the following chat transcript between a user "
                "and an AI IT Support Agent. Extract the core issue the user had and the exact steps "
                "the AI provided to resolve it. Format this into a professional, concise Knowledge Base entry.\n"
                "If no clear resolution was reached, state 'No resolution found.'\n\n"
                f"Transcript:\n{transcript}\n\n"
                "Professional KB Summary:"
            )
            
            logger.info("Extracting KB article from session %s...", session_id)
            result = await cleaner_llm.ainvoke(prompt)
            clean_summary = result.content.strip()
            print (clean_summary)

            # Abort if the AI couldn't find a solution
            if "no resolution found" in clean_summary.lower():
                return {"status": "skipped", "message": "No clear resolution found in transcript."}

            # 4. Embed the summary
            logger.info("Vectorizing new KB article...")
            vector = await asyncio.to_thread(self.embeddings.embed_query, clean_summary)

            # 5. Deterministic UUID based on the Session ID
            ticket_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"chat_resolve_{session_id}"))

            payload = {
                "page_content": clean_summary,
                "metadata": {
                    "source_session": session_id,
                    "doc_type": "resolved_chat"
                }
            }

            # 6. Push to Qdrant
            try:
                self.qdrant.upsert(
                    collection_name=self.collection_name,
                    points=[PointStruct(id=ticket_uuid, vector=vector, payload=payload)]
                )
                logger.info("Session %s successfully added to AI Brain.", session_id)
            except Exception as exc:
                raise VectorStoreError(f"Failed to upsert chat to Qdrant: {exc}") from exc

            return {"status": "success", "session_id": session_id, "message": "Conversation summarized and learned!"}
