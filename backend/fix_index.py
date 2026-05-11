import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models

# Load your .env variables
load_dotenv()

def build_qdrant_index():
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    collection_name = os.getenv("QDRANT_COLLECTION", "helpdesk_multilingual_v1")

    print(f"🔌 Connecting to Qdrant at {qdrant_url}...")
    qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)

    print(f"🏗️ Building KEYWORD index on 'metadata.doc_type' for collection '{collection_name}'...")
    try:
        qdrant.create_payload_index(
            collection_name=collection_name,
            field_name="metadata.doc_type",
            field_schema=models.PayloadSchemaType.KEYWORD,
        )
        print("✅ Index successfully created! Your filters will now work.")
    except Exception as e:
        print(f"❌ Failed to create index: {e}")

if __name__ == "__main__":
    build_qdrant_index()