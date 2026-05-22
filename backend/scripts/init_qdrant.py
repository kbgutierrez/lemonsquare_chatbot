import sys
import os

# Add the backend directory to the Python path so it can find 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from app.core.config import settings  # Imports your existing DB credentials

def setup_qdrant_indexes():
    print(f"🔌 Connecting to Qdrant at {settings.QDRANT_URL}...")
    
    client = QdrantClient(
        url=settings.QDRANT_URL, 
        api_key=settings.QDRANT_API_KEY
    )
    
    collection_name = "LemonSquareQdrant" # Update if your routing collection also needs indexes
    
    # Define the fields and their types
    indexes = [
        ("metadata.is_active", "bool"),
        ("metadata.doc_type", "keyword"),
        ("metadata.source_id", "keyword"),
        ("metadata.document_id", "keyword"),
        ("metadata.ticket_number", "keyword")
    ]
    
    print(f"📦 Checking indexes for collection: {collection_name}")
    
    for field_name, field_schema in indexes:
        try:
            client.create_payload_index(
                collection_name=collection_name,
                field_name=field_name,
                field_schema=field_schema,
                wait=True  # Waiting is good here, it ensures it finishes before the script ends
            )
            print(f"✅ Created index: {field_name}")
        except UnexpectedResponse as e:
            # Safely catch if the index was already built previously
            if "already exists" in str(e).lower():
                print(f"⏭️ Skipped: {field_name} (Already exists)")
            else:
                print(f"❌ Error creating {field_name}: {e}")
                raise e

if __name__ == "__main__":
    setup_qdrant_indexes()
    print("🎉 Qdrant index setup complete!")
