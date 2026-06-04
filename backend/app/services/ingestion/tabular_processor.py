"""Tabular (CSV/Excel) ingestion processor."""
from __future__ import annotations

import asyncio
import logging
import os
import uuid
from typing import Any

import pandas as pd
from qdrant_client.http.models import PointStruct
from sqlalchemy.orm import Session

from app.core.exceptions import ValidationError, VectorStoreError
from app.services.consolidation.knowledge_consolidator import KnowledgeConsolidator
from app.models.chatbot import UploadedDocument
from app.services.settings.runtime_config import RuntimeAIConfig
from app.services.ingestion.embedding_service import EmbeddingService
from app.services.llm_client import create_llm, invoke_llm
from app.utils.text_utils import normalize_text, sha256_hash

logger = logging.getLogger(__name__)

_DEFAULT_CATEGORIES = [
    "General", 
    "Policies", 
    "Procedures", 
    "Software", 
    "Hardware",  
    "Network"
]


class TabularProcessor:
    def __init__(self, db: Session, vector_store, embeddings) -> None:
        self.db = db
        self.vector_store = vector_store
        self.embeddings = embeddings
        self.embedding_service = EmbeddingService(embeddings)
        self.runtime_config = RuntimeAIConfig(db)
        self.consolidator = KnowledgeConsolidator()

    def _allowed_categories(self) -> list[str]:
        raw = self.runtime_config.settings.AllowedCategories
        return (
            [c.strip() for c in raw.split(",")]
            if raw
            else _DEFAULT_CATEGORIES
        )

    @staticmethod
    def _document_id(file_name: str, sample_text: str, category: str) -> str:
        key = sha256_hash(f"{normalize_text(file_name)} | {normalize_text(category)} | {normalize_text(sample_text)}")
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
            
            category = parsed_json.get("category", "").strip()
            if category in allowed_categories:
                return category
        except Exception as exc:
            logger.error("Tabular classification failed: %s", exc)
            
        return "General"

    def _load_data(self, filepath: str) -> pd.DataFrame:
        """Load CSV or Excel data using pandas with explicit engines."""
        ext = os.path.splitext(filepath)[1].lower()
        try:
            if ext == ".csv":
                return pd.read_csv(filepath)
            elif ext == ".xlsx":
                return pd.read_excel(filepath, engine="openpyxl")
            elif ext == ".xls":
                return pd.read_excel(filepath, engine="xlrd")
            else:
                raise ValidationError(f"Unsupported file extension: {ext}")
        except ImportError as exc:
            engine_name = "openpyxl" if ext == ".xlsx" else "xlrd"
            logger.error("Missing dependency for Excel processing: %s", exc)
            raise ValidationError(
                f"Missing dependency to read {ext} files. "
                f"Please ensure '{engine_name}' is installed."
            ) from exc
        except Exception as exc:
            logger.error("Failed to load tabular data from %s: %s", filepath, exc)
            raise ValidationError(f"Failed to read the uploaded file: {str(exc)}") from exc

    def _row_to_text(self, row: pd.Series) -> str:
        """Convert a pandas row to a human-readable text block."""
        lines = []
        for col, val in row.items():
            if pd.isna(val):
                continue
            lines.append(f"{col}: {val}")
        return "\n".join(lines)

    async def process(self, file_path: str, original_filename: str, manual_category: str | None = None, job_id: str | None = None, acting_user_id: int = 1, acting_username: str = "System") -> dict:
        from app.services.maintenance.job_manager import job_manager

        def _update(prog: float, msg: str):
            if job_id:
                job_manager.update_job(job_id, progress=prog, message=msg)

        try:
            _update(20.0, "Loading data file...")
            df = await asyncio.to_thread(self._load_data, file_path)
            
            if df.empty:
                raise ValidationError("The uploaded file is empty.")

            _update(35.0, "Processing rows...")
            row_texts = [self._row_to_text(row) for _, row in df.iterrows()]
            
            # Use a sample of the data for classification
            sample_text = "\n---\n".join(row_texts[:5])
            
            allowed_categories = self._allowed_categories()
            if manual_category:
                if manual_category not in allowed_categories:
                    raise ValidationError(f"Invalid category: '{manual_category}'. Must be one of {allowed_categories}")
                category = manual_category
            else:
                _update(50.0, "AI is classifying data...")
                category = await self._classify_document(sample_text, allowed_categories)

            document_id = self._document_id(original_filename, sample_text, category)
            
            _update(65.0, "Generating vector embeddings...")
            vectors = await self.embedding_service.embed_documents(row_texts)
            
            points = []
            for index, text in enumerate(row_texts):
                record = self.consolidator.build_tabular_record(
                    document_id=document_id,
                    file_name=original_filename,
                    row_text=text,
                    category=category,
                    row_index=index,
                )
                record.metadata["is_active"] = True
                points.append(PointStruct(
                    id=record.point_id,
                    vector=vectors[index],
                    payload={
                        "page_content": record.page_content,
                        "metadata": record.metadata,
                    },
                ))

            _update(85.0, "Saving rows to vector database...")
            try:
                await asyncio.to_thread(self.vector_store.upsert_points, points)
            except Exception as exc:
                raise VectorStoreError(f"Failed to upsert rows to Qdrant: {exc}") from exc

            from sqlalchemy.exc import IntegrityError
            try:
                self.db.add(UploadedDocument(
                    DocumentID=document_id,
                    FileName=original_filename,
                    Category=category,
                    ChunkCount=len(row_texts),
                    IsActive=True,
                    UploadedBy=acting_user_id,
                    UploadedByUsername=acting_username,
                ))
                self.db.commit()
            except IntegrityError as exc:
                self.db.rollback()
                try:
                    self.vector_store.delete_points([point.id for point in points])
                except Exception as cleanup_exc:
                    logger.error("Failed cleanup for %s: %s", document_id, cleanup_exc)
                raise ValidationError(f"File '{original_filename}' already exists.") from exc
            except Exception:
                self.db.rollback()
                raise

            return {
                "status": "success",
                "document_id": document_id,
                "category": category,
                "rows_processed": len(row_texts),
            }
        finally:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
