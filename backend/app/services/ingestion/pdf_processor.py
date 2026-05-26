"""PDF ingestion processor."""
from __future__ import annotations

import asyncio
import logging
import os
import tempfile
import uuid

from fastapi import UploadFile
from pypdf import PdfReader
from qdrant_client.http.models import PointStruct
from sqlalchemy.orm import Session

from app.core.exceptions import ValidationError, VectorStoreError
from app.core.metadata_contract import build_pdf_metadata, build_qdrant_payload
from app.models.chatbot import UploadedDocument
from app.services.settings.runtime_config import RuntimeAIConfig
from app.services.ingestion.chunking_service import ChunkingService
from app.services.ingestion.embedding_service import EmbeddingService
from app.services.llm_client import create_llm, invoke_llm
from app.utils.text_utils import normalize_text, sha256_hash

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


class PDFProcessor:
    def __init__(self, db: Session, vector_store, embeddings) -> None:
        self.db = db
        self.vector_store = vector_store
        self.embeddings = embeddings
        self.chunker = ChunkingService()
        self.embedding_service = EmbeddingService(embeddings)
        self.runtime_config = RuntimeAIConfig(db)

    def _allowed_categories(self) -> list[str]:
        raw = self.runtime_config.settings.AllowedCategories

        return (
            [c.strip() for c in raw.split(",")]
            if raw
            else _DEFAULT_CATEGORIES
        )


    @staticmethod
    def _validate_pdf_bytes(data: bytes) -> None:
        if not data.startswith(_PDF_MAGIC):
            raise ValidationError("Uploaded file is not a valid PDF. Only PDF files are supported.")

    @staticmethod
    def _document_id(file_name: str, raw_text: str, category: str) -> str:
        key = sha256_hash(f"{normalize_text(file_name)} | {normalize_text(category)} | {normalize_text(raw_text)}")
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"document_{key}"))

    async def _classify_document(self, text: str, allowed_categories: list[str]) -> str:
        snippet = text[:12000]
        try:
            llm = create_llm(model=self.runtime_config.document_classifier_model, temperature=0.0)
            prompt = self.runtime_config.document_classifier_prompt.replace(
                "{snippet}", snippet
            ).replace(
                "{allowed_categories}", str(allowed_categories)
            )
            
            # --- NEW JSON PARSING LOGIC ---
            from app.utils.json_utils import clean_llm_json_output, safe_json_loads
            raw_response = (
                await invoke_llm(
                    llm,
                    prompt,
                    model=self.runtime_config.document_classifier_model,
                    action="document_classification",
                )
            ).content
            cleaned_response = clean_llm_json_output(raw_response)
            parsed_json = safe_json_loads(cleaned_response, context="document_classification")
            
            # Extract the category from the JSON
            category = parsed_json.get("category", "").strip()
            
            if category in allowed_categories:
                logger.info("AI classified document as %s. Reasoning: %s", category, parsed_json.get("reasoning", "None"))
                return category
                
            logger.warning("AI returned invalid category '%s'; using General_IT.", category)
        except Exception as exc:
            logger.error("Document classification failed: %s", exc)
            
        return "General_IT"

    @staticmethod
    def _extract_pdf_text(filepath: str) -> str:
        """Synchronous PDF extraction to be run in a thread."""
        pdf_reader = PdfReader(filepath)
        return "\n".join(filter(None, (page.extract_text() for page in pdf_reader.pages)))

    async def process(self, file: UploadFile, manual_category: str | None = None) -> dict:
        raw_bytes = await file.read()
        self._validate_pdf_bytes(raw_bytes)

        temp_file_path: str | None = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(raw_bytes)
                temp_file_path = tmp.name

            # FIX: Offload the heavy PDF parsing to a separate thread
            raw_text = await asyncio.to_thread(self._extract_pdf_text, temp_file_path)

            if not raw_text.strip():
                raise ValidationError("Could not extract any text from the uploaded PDF.")

            allowed_categories = self._allowed_categories()
            if manual_category:
                if manual_category not in allowed_categories:
                    raise ValidationError(f"Invalid category: '{manual_category}'. Must be one of {allowed_categories}")
                category = manual_category
            else:
                category = await self._classify_document(raw_text, allowed_categories)

            document_id = self._document_id(file.filename or "document.pdf", raw_text, category)
            chunks = self.chunker.split_text(raw_text)
            if not chunks:
                raise ValidationError("Could not split extracted PDF text into chunks.")

            vectors = await self.embedding_service.embed_documents(chunks)
            points = []
            cluster_key = sha256_hash(f"{document_id}:{file.filename}:{category}")
            for index, chunk in enumerate(chunks):
                chunk_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document_id}_chunk_{index}"))
                metadata = build_pdf_metadata(
                    cluster_key=cluster_key,
                    document_id=document_id,
                    file_name=file.filename or "document.pdf",
                    category=category,
                    chunk_index=index,
                )
                metadata["is_active"] = True
                points.append(PointStruct(
                    id=chunk_id,
                    vector=vectors[index],
                    payload=build_qdrant_payload(page_content=chunk, metadata=metadata),
                ))

            try:
                self.vector_store.upsert_points(points)
            except Exception as exc:
                raise VectorStoreError(f"Failed to upsert document to Qdrant: {exc}") from exc

            from sqlalchemy.exc import IntegrityError
            try:
                self.db.add(UploadedDocument(
                    DocumentID=document_id,
                    FileName=file.filename or "document.pdf",
                    Category=category,
                    ChunkCount=len(chunks),
                    IsActive=True,
                ))
                self.db.commit()
            except IntegrityError as exc:
                self.db.rollback()
                # Clean up vectors if SQL insertion fails due to duplicate
                try:
                    self.vector_store.delete_points([point.id for point in points])
                except Exception as cleanup_exc:
                    logger.error(
                        "Failed to cleanup Qdrant points after duplicate DB failure for document %s: %s",
                        document_id,
                        cleanup_exc,
                    )
                raise ValidationError(f"File '{file.filename}' already exists in the database.") from exc
            except Exception as exc:
                self.db.rollback()
                try:
                    self.vector_store.delete_points([point.id for point in points])
                except Exception as cleanup_exc:
                    logger.error(
                        "Failed to cleanup Qdrant points after DB failure for document %s: %s",
                        document_id,
                        cleanup_exc,
                    )
                raise

            return {
                "status": "success",
                "document_id": document_id,
                "category": category,
                "chunks_processed": len(chunks),
            }
        finally:
            if temp_file_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
