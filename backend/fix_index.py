import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models

# Load your .env variables
load_dotenv()

def build_qdrant_indexes():
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    collection_name = os.getenv("QDRANT_COLLECTION", "helpdesk_multilingual_v1")

    print(f"🔌 Connecting to Qdrant at {qdrant_url}...")
    qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)

    # The three metadata fields our Chatbot filters and deletes by
    indexes_to_create = [
        "metadata.doc_type",
        "metadata.ticket_number",
        "metadata.document_id"  # <--- The missing link for deleting PDFs!
    ]

    for field in indexes_to_create:
        print(f"🏗️ Building KEYWORD index on '{field}'...")
        try:
            qdrant.create_payload_index(
                collection_name=collection_name,
                field_name=field,
                field_schema=models.PayloadSchemaType.KEYWORD,
            )
            print(f"✅ Index successfully created for {field}!")
        except Exception as e:
            # If it already exists, Qdrant will throw a harmless error, we just catch and print it.
            print(f"⚠️ Note on {field}: {e}")

if __name__ == "__main__":
    build_qdrant_indexes()