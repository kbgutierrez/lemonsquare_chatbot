"""
Wipe and recreate Qdrant collection(s) aligned with app settings.

This script deletes the primary Qdrant collection(s) and recreates them
with sensible vector params and payload indexes. It reads configuration
from the app's settings so it aligns with the current environment.

Usage:
    cd backend
    python -m scripts.wipe_recreate_qdrant --yes

Options:
    --yes    Skip interactive confirmation (use with care).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Allow imports from the app package when running as a script.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import os
import logging
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models

from app.core.config import settings

logger = logging.getLogger(__name__)


def infer_vector_size_from_model(model_name: str | None) -> int:
    if not model_name:
        return int(os.getenv("QDRANT_VECTOR_SIZE", "1024"))
    # Common mappings; extend if you use other models
    if "e5-small" in model_name or "multilingual-e5-small" in model_name:
        return int(os.getenv("QDRANT_VECTOR_SIZE", "384"))
    return int(os.getenv("QDRANT_VECTOR_SIZE", "1024"))


def main(skip_confirm: bool = False) -> None:
    qdrant = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)

    collections = [
        settings.QDRANT_COLLECTION,
    ]
    # Optionally recreate routing collection if present in settings
    routing_col = getattr(settings, "QDRANT_ROUTING_COLLECTION", None)
    if routing_col:
        collections.append(routing_col)

    vector_size = infer_vector_size_from_model(settings.EMBEDDING_MODEL)

    print("Collections to recreate:")
    for c in collections:
        print(f"  - {c}")
    print(f"Using embedding model: {settings.EMBEDDING_MODEL} -> vector size {vector_size}")

    if not skip_confirm:
        answer = input("Type YES to proceed and delete these collections: ")
        if answer.strip().upper() != "YES":
            print("Aborted by user.")
            return

    for collection in collections:
        print(f"Deleting collection: {collection}")
        try:
            qdrant.delete_collection(collection_name=collection)
            print("  deleted")
        except Exception as exc:
            print(f"  warn: could not delete collection {collection}: {exc}")

        print(f"Creating collection: {collection}")
        try:
            qdrant.create_collection(
                collection_name=collection,
                vectors_config=qdrant_models.VectorParams(
                    size=vector_size,
                    distance=qdrant_models.Distance.COSINE,
                ),
            )
            print("  created")
        except Exception as exc:
            print(f"  error: could not create collection {collection}: {exc}")

        # Create helpful payload indexes
        indexes = [
            "metadata.doc_type",
            "metadata.ticket_number",
            "metadata.document_id",
            "metadata.category",
            "metadata.cluster_key",
        ]
        for field in indexes:
            try:
                qdrant.create_payload_index(
                    collection_name=collection,
                    field_name=field,
                    field_schema=qdrant_models.PayloadSchemaType.KEYWORD,
                )
                print(f"  index created: {field}")
            except Exception as exc:
                print(f"  warn: could not create index {field}: {exc}")

    print("Done. Qdrant collections recreated.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--yes", action="store_true", help="Skip confirmation")
    args = parser.parse_args()
    main(skip_confirm=args.yes)
