"""
Document ingestion service.

Handles:
  - PDF parsing and text extraction.
  - AI-based document categorisation.
  - Chunk splitting and embedding.
  - Qdrant vector upsert.
  - SQL metadata persistence.
  - Document deletion (Qdrant + SQL).
  - Canonical knowledge consolidation for manual entries, tickets, and chats.

This version adds a shared consolidation layer so repeated knowledge does not
explode into many near-identical Qdrant vectors.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import tempfile
import uuid
from datetime import datetime

from fastapi import UploadFile
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader
from qdrant_client import QdrantClient
from qdrant_client.http.models import (
    FieldCondition,
    Filter,
    MatchValue,
    PointStruct,
)
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import ValidationError, VectorStoreError
from app.models.chatbot import (
    AIChatbotSetting,
    BlacklistedTicket,
    KnowledgeClusterMap,
    LearnedChat,
    ManualKnowledgeEntry,
    UploadedDocument,
)
from app.services.consolidator import KnowledgeConsolidator

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
    Processes knowledge sources into the Qdrant vector store.

    Instantiated once during app lifespan startup. Shared across requests.
    """

    def __init__(self, db: Session) -> None:
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

        raw_categories = active_config.AllowedCategories if active_config else None
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
        self.consolidator = KnowledgeConsolidator()

        logger.info("DocumentIngestionService ready (embed_model=%s).", self.embed_model)

    @staticmethod
    def _validate_pdf_bytes(data: bytes) -> None:
        if not data[:5] == _PDF_MAGIC:
            raise ValidationError(
                "Uploaded file is not a valid PDF. Only PDF files are supported."
            )

    def _get_existing_payload(self, point_id: str) -> dict | None:
        try:
            records = self.qdrant.retrieve(
                collection_name=self.collection_name,
                ids=[point_id],
                with_payload=True,
                with_vectors=False,
            )
            if records:
                payload = getattr(records[0], "payload", None)
                if isinstance(payload, dict):
                    return payload
        except Exception as exc:
            logger.warning("Could not retrieve existing Qdrant point %s: %s", point_id, exc)
        return None

    @staticmethod
    def _payload_metadata(payload: dict | None) -> dict:
        if not isinstance(payload, dict):
            return {}
        meta = payload.get("metadata", {})
        return meta if isinstance(meta, dict) else {}

    def _merge_cluster_payload(
        self,
        existing_payload: dict | None,
        record_page_content: str,
        record_metadata: dict,
        source_id: str,
        source_type: str,
    ) -> dict:
        existing_meta = self._payload_metadata(existing_payload)

        source_ids = list(existing_meta.get("source_ids", []) or [])
        source_already_present = source_id in source_ids
        if not source_already_present:
            source_ids.append(source_id)

        source_types = list(existing_meta.get("source_types", []) or [])
        if source_type not in source_types:
            source_types.append(source_type)

        existing_frequency = int(existing_meta.get("frequency", 0) or 0)
        frequency = existing_frequency if source_already_present else existing_frequency + 1
        if frequency <= 0:
            frequency = 1

        merged_meta = dict(existing_meta)
        merged_meta.update(record_metadata)
        merged_meta["source_id"] = source_id
        merged_meta["source_ids"] = source_ids
        merged_meta["source_types"] = source_types
        merged_meta["frequency"] = frequency

        return {
            "page_content": record_page_content,
            "metadata": merged_meta,
        }

    def _sync_cluster_map(
        self,
        db: Session,
        source_id: str,
        source_type: str,
        cluster_id: str,
        cluster_key: str,
    ) -> None:
        mapping = (
            db.query(KnowledgeClusterMap)
            .filter(KnowledgeClusterMap.SourceID == source_id)
            .first()
        )
        if mapping:
            mapping.SourceType = source_type
            mapping.ClusterID = cluster_id
            mapping.ClusterKey = cluster_key
            mapping.IsActive = True
            mapping.UpdatedAt = datetime.utcnow()
        else:
            db.add(
                KnowledgeClusterMap(
                    SourceID=source_id,
                    SourceType=source_type,
                    ClusterID=cluster_id,
                    ClusterKey=cluster_key,
                    IsActive=True,
                )
            )

    def _deactivate_source_mapping(self, db: Session, source_id: str) -> str | None:
        mapping = (
            db.query(KnowledgeClusterMap)
            .filter(KnowledgeClusterMap.SourceID == source_id)
            .first()
        )
        if not mapping:
            return None

        mapping.IsActive = False
        mapping.UpdatedAt = datetime.utcnow()
        cluster_id = mapping.ClusterID
        db.commit()
        return cluster_id

    def _maybe_delete_orphan_cluster(self, db: Session, cluster_id: str | None) -> None:
        if not cluster_id:
            return

        active_count = (
            db.query(KnowledgeClusterMap)
            .filter(KnowledgeClusterMap.ClusterID == cluster_id)
            .filter(KnowledgeClusterMap.IsActive == True)
            .count()
        )
        if active_count > 0:
            return

        try:
            self.qdrant.delete(
                collection_name=self.collection_name,
                points_selector=[cluster_id],
            )
        except Exception as exc:
            logger.warning("Could not delete orphan Qdrant cluster %s: %s", cluster_id, exc)

    async def _upsert_canonical_point_async(
        self,
        *,
        db: Session,
        source_id: str,
        source_type: str,
        cluster_id: str,
        cluster_key: str,
        page_content: str,
        metadata: dict,
    ) -> None:
        existing_payload = self._get_existing_payload(cluster_id)
        payload = self._merge_cluster_payload(
            existing_payload=existing_payload,
            record_page_content=page_content,
            record_metadata=metadata,
            source_id=source_id,
            source_type=source_type,
        )

        vector = await asyncio.to_thread(self.embeddings.embed_query, page_content)

        self.qdrant.upsert(
            collection_name=self.collection_name,
            points=[
                PointStruct(
                    id=cluster_id,
                    vector=vector,
                    payload=payload,
                )
            ],
        )

        self._sync_cluster_map(db, source_id, source_type, cluster_id, cluster_key)
        db.commit()

    async def process_pdf_upload(
        self,
        file: UploadFile,
        db: Session,
        manual_category: str = None,
    ) -> dict:
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
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(raw_bytes)
                temp_file_path = tmp.name

            pdf_reader = PdfReader(temp_file_path)
            raw_text = ""
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    raw_text += text + "\n"

            if not raw_text.strip():
                raise ValidationError("Could not extract any text from the uploaded PDF.")

            if manual_category and manual_category in self.allowed_categories:
                ai_category = manual_category
            else:
                if manual_category:
                    logger.warning(
                        "Admin provided category '%s' but it's not in allowed list: %s",
                        manual_category,
                        self.allowed_categories,
                    )
                ai_category = await self._classify_document(raw_text)

            cluster_key = self.consolidator.pdf_cluster_key(
                file_name=file.filename,
                raw_text=raw_text,
                category=ai_category,
            )
            document_id = self.consolidator.cluster_id(cluster_key)

            chunks = self.text_splitter.split_text(raw_text)

            logger.info("Embedding %d chunks for document %s...", len(chunks), document_id)
            vectors = await asyncio.to_thread(self.embeddings.embed_documents, chunks)

            points = []
            for i, chunk in enumerate(chunks):
                chunk_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document_id}_chunk_{i}"))
                payload = {
                    "page_content": chunk,
                    "metadata": {
                        "document_id": document_id,
                        "source": file.filename,
                        "category": ai_category,
                        "chunk_index": i,
                        "doc_type": "official_document",
                        "knowledge_type": "pdf",
                        "cluster_key": cluster_key,
                        "source_id": document_id,
                        "source_ids": [document_id],
                        "frequency": 1,
                    },
                }
                points.append(PointStruct(id=chunk_id, vector=vectors[i], payload=payload))

            try:
                self.qdrant.upsert(
                    collection_name=self.collection_name,
                    points=points,
                )
            except Exception as exc:
                raise VectorStoreError(f"Failed to upsert document to Qdrant: {exc}") from exc

            db.add(
                UploadedDocument(
                    DocumentID=document_id,
                    FileName=file.filename,
                    Category=ai_category,
                    ChunkCount=len(chunks),
                )
            )
            db.commit()

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
        snippet = text[:3000]
        try:
            classify_llm = ChatGroq(
                model="llama-3.1-8b-instant",
                temperature=0.0,
                api_key=settings.GROQ_API_KEY,
            )

            prompt = (
                f"You are an IT categorization AI. Read this document snippet: '{snippet}'. "
                f"Categorize it into EXACTLY ONE of these categories: {self.allowed_categories}. "
                "Reply with ONLY the exact category name. Do not add punctuation or extra words."
            )

            ai_category = (await classify_llm.ainvoke(prompt)).content.strip(' "\'\n')
            if ai_category not in self.allowed_categories:
                logger.warning(
                    "AI hallucinated category '%s'. Defaulting to 'General_IT'.",
                    ai_category,
                )
                return "General_IT"
            return ai_category

        except Exception as exc:
            logger.error("Error during AI categorization: %s", exc)
            return "General_IT"

    async def process_manual_entry(
        self,
        title: str,
        content: str,
        manual_category: str | None,
        db: Session,
    ) -> dict:
        active_config = (
            db.query(AIChatbotSetting)
            .filter(AIChatbotSetting.IsActive == True)
            .order_by(AIChatbotSetting.SettingID.desc())
            .first()
        )

        raw_categories = (
            active_config.AllowedCategories
            if active_config and active_config.AllowedCategories
            else "General_IT"
        )
        allowed_categories = [c.strip() for c in raw_categories.split(",")]

        if manual_category:
            if manual_category not in allowed_categories:
                raise ValueError(
                    f"Invalid category: '{manual_category}'. Must be one of {allowed_categories}"
                )
            ai_category = manual_category
        else:
            classify_llm = ChatGroq(
                model="llama-3.1-8b-instant",
                temperature=0.0,
                api_key=settings.GROQ_API_KEY,
            )
            prompt = (
                f"You are an IT categorization AI. Read this text: '{title} - {content}'. "
                f"Categorize it into EXACTLY ONE of these categories: {allowed_categories}. "
                "Reply with ONLY the category name. Do not add punctuation."
            )
            ai_category = (await classify_llm.ainvoke(prompt)).content.strip(' "\'\n')
            if ai_category not in allowed_categories:
                logger.warning(
                    "AI hallucinated category '%s'. Overriding to 'General_IT'.",
                    ai_category,
                )
                ai_category = "General_IT"

        document_id = str(uuid.uuid4())
        record = self.consolidator.build_manual_record(
            entry_id=document_id,
            title=title,
            content=content,
            category=ai_category,
        )

        await self._upsert_canonical_point_async(
            db=db,
            source_id=document_id,
            source_type="manual",
            cluster_id=record.point_id,
            cluster_key=record.cluster_key,
            page_content=record.page_content,
            metadata=record.metadata,
        )

        db.add(
            ManualKnowledgeEntry(
                EntryID=document_id,
                Title=title,
                Content=content,
                Category=ai_category,
            )
        )
        db.commit()

        return {
            "status": "success",
            "entry_id": document_id,
            "category": ai_category,
            "message": f"Manual entry added to AI Brain under '{ai_category}'.",
        }

    async def update_manual_entry(self, entry_id: str, updates: dict, db: Session) -> dict:
        entry = (
            db.query(ManualKnowledgeEntry)
            .filter(ManualKnowledgeEntry.EntryID == entry_id)
            .first()
        )
        if not entry:
            raise ValueError("Manual entry not found.")

        active_config = (
            db.query(AIChatbotSetting)
            .filter(AIChatbotSetting.IsActive == True)
            .order_by(AIChatbotSetting.SettingID.desc())
            .first()
        )
        raw_categories = (
            active_config.AllowedCategories
            if active_config and active_config.AllowedCategories
            else "General_IT"
        )
        allowed_categories = [c.strip() for c in raw_categories.split(",")]

        if updates.get("title"):
            entry.Title = updates["title"]
        if updates.get("content"):
            entry.Content = updates["content"]
        if updates.get("category"):
            new_category = updates["category"]
            if new_category not in allowed_categories:
                raise ValueError(
                    f"Invalid category: '{new_category}'. Must be one of {allowed_categories}"
                )
            entry.Category = new_category

        entry.UpdatedAt = datetime.utcnow()
        db.commit()

        record = self.consolidator.build_manual_record(
            entry_id=entry.EntryID,
            title=entry.Title,
            content=entry.Content,
            category=entry.Category,
        )

        old_mapping = (
            db.query(KnowledgeClusterMap)
            .filter(KnowledgeClusterMap.SourceID == entry.EntryID)
            .first()
        )
        old_cluster_id = old_mapping.ClusterID if old_mapping else None

        await self._upsert_canonical_point_async(
            db=db,
            source_id=entry.EntryID,
            source_type="manual",
            cluster_id=record.point_id,
            cluster_key=record.cluster_key,
            page_content=record.page_content,
            metadata=record.metadata,
        )

        if old_cluster_id and old_cluster_id != record.point_id:
            self._maybe_delete_orphan_cluster(db, old_cluster_id)
            db.commit()

        return {"status": "success", "message": "Entry updated successfully."}

    async def delete_manual_entry(self, entry_id: str, db: Session) -> dict:
        entry = (
            db.query(ManualKnowledgeEntry)
            .filter(ManualKnowledgeEntry.EntryID == entry_id)
            .first()
        )
        if entry:
            entry.IsActive = False
            db.commit()

        cluster_id = self._deactivate_source_mapping(db, entry_id)
        self._maybe_delete_orphan_cluster(db, cluster_id)
        db.commit()

        return {"status": "success", "message": "Manual entry deleted."}

    async def delete_document(self, document_id: str, db: Session) -> dict:
        doc = (
            db.query(UploadedDocument)
            .filter(UploadedDocument.DocumentID == document_id)
            .first()
        )
        if not doc:
            raise ValueError("Document not found in database.")

        doc.IsActive = False
        db.commit()

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

        return {
            "status": "success",
            "message": f"Document '{doc.FileName}' has been archived and scrubbed from the AI's memory.",
        }

    async def update_document(self, document_id: str, updates: dict, db: Session) -> dict:
        document = (
            db.query(UploadedDocument)
            .filter(UploadedDocument.DocumentID == document_id)
            .first()
        )
        if not document:
            raise ValueError(f"Document {document_id} not found in database.")

        payload_updates = {}

        if updates.get("file_name"):
            document.FileName = updates["file_name"]
            payload_updates["metadata"] = payload_updates.get("metadata", {})
            payload_updates["metadata"]["source"] = updates["file_name"]

        if updates.get("category"):
            new_category = updates["category"]
            if new_category not in self.allowed_categories:
                raise ValueError(
                    f"Invalid category: {new_category}. Must be one of {self.allowed_categories}"
                )

            document.Category = new_category
            payload_updates["metadata"] = payload_updates.get("metadata", {})
            payload_updates["metadata"]["category"] = new_category

        if not payload_updates:
            return {"status": "skipped", "message": "No valid updates provided."}

        db.commit()

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
            ),
        )

        logger.info("Successfully updated metadata for document %s", document_id)
        return {"status": "success", "message": "Document metadata updated successfully."}

    async def process_resolved_ticket(self, ticket_data: dict, db: Session) -> dict:
        ticket_number = ticket_data["ticket_number"]
        logger.info("Processing raw resolved ticket for AI ingestion: %s", ticket_number)

        is_blacklisted = (
            db.query(BlacklistedTicket)
            .filter(BlacklistedTicket.TicketNumber == ticket_number)
            .first()
        )
        if is_blacklisted:
            logger.warning("Ticket %s is blacklisted. Skipping AI ingestion.", ticket_number)
            return {
                "status": "skipped",
                "ticket_number": ticket_number,
                "message": "Ticket is blacklisted.",
            }

        record = self.consolidator.build_ticket_record(
            ticket_number=ticket_number,
            issue_reported=ticket_data.get("issue_reported"),
            issue_found=ticket_data.get("issue_found"),
            issue_cause=ticket_data.get("issue_cause"),
            work_done=ticket_data.get("work_done"),
            advanced_work_done=ticket_data.get("advanced_work_done"),
        )

        await self._upsert_canonical_point_async(
            db=db,
            source_id=str(ticket_number),
            source_type="ticket",
            cluster_id=record.point_id,
            cluster_key=record.cluster_key,
            page_content=record.page_content,
            metadata=record.metadata,
        )

        return {
            "status": "success",
            "ticket_number": ticket_number,
            "message": "Resolved ticket clustered and added to AI.",
        }

    async def process_resolved_chat(self, session_id: str, db: Session) -> dict:
        from app.models.chatbot import ChatMessage

        logger.info("Processing resolved chat session: %s", session_id)

        messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.SessionID == session_id)
            .order_by(ChatMessage.CreatedAt.asc())
            .all()
        )

        if len(messages) < 2:
            return {"status": "skipped", "message": "Chat is too short to summarize."}

        transcript = "\n".join([f"{msg.SenderRole.upper()}: {msg.MessageContent}" for msg in messages])

        active_config = (
            db.query(AIChatbotSetting)
            .filter(AIChatbotSetting.IsActive == True)
            .order_by(AIChatbotSetting.SettingID.desc())
            .first()
        )

        extraction_model = getattr(active_config, "ReformulatorModel", None)
        if not extraction_model or extraction_model.strip() == "":
            extraction_model = "llama-3.1-8b-instant"

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

        raw_prompt_template = getattr(active_config, "ChatExtractionPrompt", None)
        if not raw_prompt_template or raw_prompt_template.strip() == "":
            raw_prompt_template = default_prompt

        if "{transcript}" in raw_prompt_template:
            prompt = raw_prompt_template.replace("{transcript}", transcript)
        else:
            logger.error("Missing {transcript} tag in custom ChatExtractionPrompt. Falling back to default.")
            prompt = default_prompt.replace("{transcript}", transcript)

        cleaner_llm = ChatGroq(
            model=extraction_model,
            temperature=0.0,
            api_key=settings.GROQ_API_KEY,
        )

        result = await cleaner_llm.ainvoke(prompt)
        raw_output = result.content.strip()

        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3].strip()
        elif raw_output.startswith("```"):
            raw_output = raw_output[3:-3].strip()

        try:
            extracted_data = json.loads(raw_output)
        except json.JSONDecodeError:
            logger.error("Failed to parse LLM JSON: %s", raw_output)
            return {"status": "error", "message": "AI failed to output valid JSON."}

        if "error" in extracted_data:
            return {"status": "skipped", "message": "No clear resolution found in transcript."}

        record = self.consolidator.build_chat_record(
            session_id=session_id,
            issue_reported=extracted_data.get("issue_reported", "None"),
            issue_found=extracted_data.get("issue_found", "None"),
            issue_cause=extracted_data.get("issue_cause", "None"),
            work_done=extracted_data.get("work_done", "None"),
        )

        await self._upsert_canonical_point_async(
            db=db,
            source_id=session_id,
            source_type="chat",
            cluster_id=record.point_id,
            cluster_key=record.cluster_key,
            page_content=record.page_content,
            metadata=record.metadata,
        )

        existing_learned = (
            db.query(LearnedChat)
            .filter(LearnedChat.SessionID == session_id)
            .first()
        )
        if not existing_learned:
            learned_entry = LearnedChat(
                SessionID=session_id,
                IssueReported=extracted_data.get("issue_reported", "None"),
                IssueFound=extracted_data.get("issue_found", "None"),
                RootCause=extracted_data.get("issue_cause", "None"),
                WorkDone=extracted_data.get("work_done", "None"),
            )
            db.add(learned_entry)
            db.commit()

        return {
            "status": "success",
            "session_id": session_id,
            "message": "Conversation extracted, clustered, and learned!",
        }

    async def update_learned_chat(self, session_id: str, updates: dict, db: Session) -> dict:
        chat = (
            db.query(LearnedChat)
            .filter(LearnedChat.SessionID == session_id)
            .first()
        )
        if not chat:
            raise ValueError("Learned chat not found.")

        if updates.get("issue_reported"):
            chat.IssueReported = updates["issue_reported"]
        if updates.get("issue_found"):
            chat.IssueFound = updates["issue_found"]
        if updates.get("issue_cause"):
            chat.RootCause = updates["issue_cause"]
        if updates.get("work_done"):
            chat.WorkDone = updates["work_done"]
        chat.UpdatedAt = datetime.utcnow()
        db.commit()

        record = self.consolidator.build_chat_record(
            session_id=chat.SessionID,
            issue_reported=chat.IssueReported,
            issue_found=chat.IssueFound,
            issue_cause=chat.RootCause,
            work_done=chat.WorkDone,
        )

        old_mapping = (
            db.query(KnowledgeClusterMap)
            .filter(KnowledgeClusterMap.SourceID == session_id)
            .first()
        )
        old_cluster_id = old_mapping.ClusterID if old_mapping else None

        await self._upsert_canonical_point_async(
            db=db,
            source_id=session_id,
            source_type="chat",
            cluster_id=record.point_id,
            cluster_key=record.cluster_key,
            page_content=record.page_content,
            metadata=record.metadata,
        )

        if old_cluster_id and old_cluster_id != record.point_id:
            self._maybe_delete_orphan_cluster(db, old_cluster_id)
            db.commit()

        return {"status": "success", "message": "AI knowledge corrected successfully."}

    async def delete_learned_chat(self, session_id: str, db: Session) -> dict:
        chat = (
            db.query(LearnedChat)
            .filter(LearnedChat.SessionID == session_id)
            .first()
        )
        if chat:
            chat.IsActive = False
            db.commit()

        cluster_id = self._deactivate_source_mapping(db, session_id)
        self._maybe_delete_orphan_cluster(db, cluster_id)
        db.commit()

        return {"status": "success", "message": "AI forced to unlearn chat."}

    async def restore_manual_entry(self, entry_id: str, db: Session) -> dict:
        entry = (
            db.query(ManualKnowledgeEntry)
            .filter(ManualKnowledgeEntry.EntryID == entry_id)
            .first()
        )
        if not entry:
            raise ValueError("Manual entry not found in the database.")

        if entry.IsActive:
            return {"status": "skipped", "message": "Entry is already active."}

        entry.IsActive = True
        db.commit()

        record = self.consolidator.build_manual_record(
            entry_id=entry.EntryID,
            title=entry.Title,
            content=entry.Content,
            category=entry.Category,
        )

        await self._upsert_canonical_point_async(
            db=db,
            source_id=entry.EntryID,
            source_type="manual",
            cluster_id=record.point_id,
            cluster_key=record.cluster_key,
            page_content=record.page_content,
            metadata=record.metadata,
        )

        return {"status": "success", "message": "Manual entry successfully restored to the AI Brain."}

    async def restore_learned_chat(self, session_id: str, db: Session) -> dict:
        chat = (
            db.query(LearnedChat)
            .filter(LearnedChat.SessionID == session_id)
            .first()
        )
        if not chat:
            raise ValueError("Learned chat not found in the database.")

        if chat.IsActive:
            return {"status": "skipped", "message": "Chat is already active."}

        chat.IsActive = True
        db.commit()

        record = self.consolidator.build_chat_record(
            session_id=chat.SessionID,
            issue_reported=chat.IssueReported,
            issue_found=chat.IssueFound,
            issue_cause=chat.RootCause,
            work_done=chat.WorkDone,
        )

        await self._upsert_canonical_point_async(
            db=db,
            source_id=session_id,
            source_type="chat",
            cluster_id=record.point_id,
            cluster_key=record.cluster_key,
            page_content=record.page_content,
            metadata=record.metadata,
        )

        return {"status": "success", "message": "Learned chat successfully restored to the AI Brain."}