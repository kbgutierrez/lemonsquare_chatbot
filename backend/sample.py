import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models

load_dotenv()

client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
)

collection = os.getenv(
    "QDRANT_COLLECTION",
    "helpdesk_multilingual_v1",
)

print(f"Applying missing indices to {collection}...")

client.create_payload_index(
    collection_name=collection,
    field_name="metadata.is_active",
    field_schema=models.PayloadSchemaType.BOOL,
)

client.create_payload_index(
    collection_name=collection,
    field_name="metadata.knowledge_type",
    field_schema=models.PayloadSchemaType.KEYWORD,
)

client.create_payload_index(
    collection_name=collection,
    field_name="metadata.source_id",
    field_schema=models.PayloadSchemaType.KEYWORD,
)

client.create_payload_index(
    collection_name=collection,
    field_name="metadata.source_ids",
    field_schema=models.PayloadSchemaType.KEYWORD,
)

print("✅ Live indices applied successfully. The Chat API should work now.")