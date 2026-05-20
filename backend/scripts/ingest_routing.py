"""
Standalone routing ingestion script.
Syncs ground-truth ticket headers into Qdrant to power the RAC Routing Engine.
"""

import logging
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore

from app.core.config import settings
from app.core.database import SessionHelpdesk
from app.core.logging import configure_logging
from app.models.helpdesk import TicketHeader

configure_logging()
logger = logging.getLogger(__name__)

def run_routing_ingestion() -> None:
    logger.info("Connecting to Helpdesk Database...")
    db_helpdesk = SessionHelpdesk()

    try:
        # 1. Fetch valid headers (must have text and routing IDs)
        routing_tickets = (
            db_helpdesk.query(TicketHeader)
            .filter(TicketHeader.department_id.isnot(None))
            .filter(TicketHeader.subcategory_id.isnot(None))
            .filter(TicketHeader.summary.isnot(None))
            .all()
        )

        logger.info(f"Fetched {len(routing_tickets)} historical routing examples.")

        # 2. Build Document objects
        docs: list[Document] = []
        ids: list[str] = []

        for ticket in routing_tickets:
            # Skip useless/empty tickets
            if len(str(ticket.summary).strip()) < 3:
                continue

            # Format exactly how the LLM needs to read it
            content = (
                f"ROUTED TO -> DEPT ID: {ticket.department_id} | SUBCAT ID: {ticket.subcategory_id}\n"
                f"SUMMARY: {ticket.summary or 'None'}\n"
                f"DESCRIPTION: {ticket.description or 'None'}"
            )
            
            metadata = {
                "ticket_number": ticket.ticket_number,
                "department_id": ticket.department_id,
                "subcategory_id": ticket.subcategory_id,
                "doc_type": "routing_example", # Crucial: Keeps it separate from chat RAG
                "category": "AI Routing Sync"
            }
            
            docs.append(Document(page_content=content, metadata=metadata))
            ids.append(str(uuid.uuid5(uuid.NAMESPACE_DNS, f"routing_{ticket.id}")))

        # 3. Load Embeddings and Push to Qdrant
        logger.info("Loading embedding model...")
        embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)

        collection_name = getattr(settings, "QDRANT_ROUTING_COLLECTION", "LemonSquareRouting")
        
        BATCH_SIZE = 128
        total_docs = len(docs)
        
        for i in range(0, total_docs, BATCH_SIZE):
            batch_docs = docs[i : i + BATCH_SIZE]
            batch_ids = ids[i : i + BATCH_SIZE]
            
            logger.info("Uploading batch %d to %d of %d...", i, min(i + BATCH_SIZE, total_docs), total_docs)
            
            QdrantVectorStore.from_documents(
                batch_docs,
                embeddings,
                ids=batch_ids,
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY,
                collection_name=collection_name,
                force_recreate=False,
            )
            
        logger.info("Routing Dataset completely synced to Qdrant!")

    finally:
        db_helpdesk.close()

if __name__ == "__main__":
    run_routing_ingestion()