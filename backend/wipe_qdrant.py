"""
DESTRUCTIVE: Completely wipe and rebuild the Qdrant vector database.

This script deletes the entire collection and recreates it fresh with the proper
index structure. Use this when:
  - You have duplicate chunk UUIDs from old runs.
  - You want to enforce the new strict taxonomy.
  - You are re-building from scratch.

WARNING: This will DELETE ALL vectors. Make sure you have backups or are OK losing everything.
"""

import os
import sys
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models

# Load environment variables from .env
load_dotenv()


def wipe_and_rebuild():
    """Delete the collection and rebuild it fresh."""
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    collection_name = os.getenv("QDRANT_COLLECTION", "helpdesk_multilingual_v1")

    if not qdrant_url or not qdrant_api_key:
        print("❌ ERROR: QDRANT_URL and QDRANT_API_KEY must be set in .env")
        sys.exit(1)

    print(f"🔗 Connecting to Qdrant at {qdrant_url}...")
    client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)

    # Double-check with the user
    print(f"\n⚠️  WARNING: You are about to DELETE the entire collection '{collection_name}'")
    print("   All vectors will be lost. This action cannot be undone.")
    response = input("\n   Type 'YES' to proceed, or anything else to cancel: ")

    if response.strip().upper() != "YES":
        print("❌ Cancelled. No changes made.")
        sys.exit(0)

    print(f"\n🗑️  Deleting collection '{collection_name}'...")
    try:
        client.delete_collection(collection_name=collection_name)
        print(f"✅ Collection deleted.")
    except Exception as e:
        print(f"⚠️  Collection may not exist or error occurred: {e}")

    print(f"\n🏗️  Rebuilding fresh collection '{collection_name}'...")
    try:
        client.create_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(
                size=1024,  # IMPORTANT: Change to 384 if using 'multilingual-e5-small'
                distance=models.Distance.COSINE,
            ),
        )
        print(f"✅ Collection created with vector size 1024")
    except Exception as e:
        print(f"❌ Failed to create collection: {e}")
        sys.exit(1)

    # Create payload indexes for fast filtering
    print(f"\n📑 Creating payload indexes for fast filtering...")
    indexes = [
        "metadata.doc_type",
        "metadata.ticket_number",
        "metadata.document_id",
        "metadata.category",
    ]

    for field in indexes:
        try:
            client.create_payload_index(
                collection_name=collection_name,
                field_name=field,
                field_schema=models.PayloadSchemaType.KEYWORD,
            )
            print(f"   ✅ Index created: {field}")
        except Exception as e:
            print(f"   ⚠️  Could not create index for {field}: {e}")

    print(f"\n✅ Qdrant database is completely fresh and ready!")
    print(f"   Collection: {collection_name}")
    print(f"   You can now upload PDFs and ingest tickets with clean, locked taxonomy.")


if __name__ == "__main__":
    wipe_and_rebuild()
