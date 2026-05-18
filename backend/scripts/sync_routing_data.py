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

def run_sync() -> None:
    # USE THE NEW ROUTING COLLECTION!
    routing_collection = getattr(settings, "QDRANT_ROUTING_COLLECTION", "helpdesk_routing_v1")
    
    logger.info("Connecting to SQL Helpdesk Database...")
    db_helpdesk = SessionHelpdesk()

    try:
        real_tickets = (
            db_helpdesk.query(TicketHeader)
            .filter(TicketHeader.department_id.isnot(None))
            .filter(TicketHeader.subcategory_id.isnot(None))
            .filter(TicketHeader.summary.isnot(None))
            .all()
        )

        logger.info(f"📥 Fetched {len(real_tickets)} real historical tickets from SQL.")
        if not real_tickets: return

        docs: list[Document] = []
        ids: list[str] = []

        for ticket in real_tickets:
            summary_text = str(ticket.summary).strip()
            if len(summary_text) < 5: continue

            content = f"SUMMARY: {summary_text}\nDESCRIPTION: {ticket.description or 'None'}"
            
            metadata = {
                "ticket_number": ticket.ticket_number,
                "department_id": ticket.department_id,
                "subcategory_id": ticket.subcategory_id,
            }
            
            docs.append(Document(page_content=content, metadata=metadata))
            ids.append(str(uuid.uuid5(uuid.NAMESPACE_DNS, f"routing_{ticket.id}")))

        logger.info("🧠 Loading HuggingFace Embedding Model...")
        embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)

        BATCH_SIZE = 50
        total_docs = len(docs)
        
        logger.info(f"🚀 Starting vector upload to '{routing_collection}'...")
        
        for i in range(0, total_docs, BATCH_SIZE):
            batch_docs = docs[i : i + BATCH_SIZE]
            batch_ids = ids[i : i + BATCH_SIZE]
            
            # force_recreate=True on the VERY FIRST batch will wipe the collection clean.
            # We set it to False for subsequent batches so we don't delete what we just uploaded!
            is_first_batch = (i == 0)
            
            QdrantVectorStore.from_documents(
                batch_docs,
                embeddings,
                ids=batch_ids,
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY,
                collection_name=routing_collection, # USING NEW COLLECTION
                force_recreate=is_first_batch,      # WIPES IT CLEAN SAFELY!
            )
            
        logger.info(f"🎉 SUCCESS! The dedicated Routing Brain is now loaded!")

    finally:
        db_helpdesk.close()

if __name__ == "__main__":
    run_sync()