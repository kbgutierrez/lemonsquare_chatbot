import os
import uuid
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_core.documents import Document
from app.core.models import SessionHelpdesk, TicketEvaluation, SessionChatbot, BlacklistedTicket
from app.core.config import settings

load_dotenv(override=True)

def run_ingestion():
    print("Connecting to Databases...")
    db_helpdesk = SessionHelpdesk()
    db_chatbot = SessionChatbot()
    
    try:
        # 1. Fetch the Blacklist
        blacklisted_nums = {b.TicketNumber for b in db_chatbot.query(BlacklistedTicket.TicketNumber).all()}
        
        # 2. Fetch the Tickets
        tickets = db_helpdesk.query(TicketEvaluation).filter(TicketEvaluation.work_done.isnot(None)).all()
        
        # 3. Filter out the bad tickets
        valid_tickets = [t for t in tickets if t.ticket_number not in blacklisted_nums]
        print(f"Extracting {len(valid_tickets)} valid resolved tickets (Skipped {len(tickets) - len(valid_tickets)} blacklisted)...")
        
        docs = []
        ids = [] # We use deterministic IDs to prevent duplicating tickets on multiple runs
        
        for t in valid_tickets:
            content = (
                f"TICKET NUMBER: {t.ticket_number}\n"
                f"ISSUE REPORTED: {t.issue_reported or 'None'}\n"
                f"ACTUAL ISSUE FOUND: {t.issue_found or 'None'}\n"
                f"ROOT CAUSE: {t.issue_cause or 'None'}\n"
                f"RESOLUTION (WORK DONE): {t.work_done or 'None'}\n"
                f"ADVANCED RESOLUTION: {t.advanced_work_done or 'None'}"
            )
            metadata = {
                "evaluation_id": t.id, 
                "ticket_number": t.ticket_number,
                "doc_type": "ticket" # <--- CRITICAL FIX: Identifies this as a ticket for the AI
            }
            docs.append(Document(page_content=content, metadata=metadata))
            
            # Generate a consistent ID based on the ticket ID.
            # If we run ingest.py again, Qdrant will overwrite the old ticket instead of duplicating it!
            ids.append(str(uuid.uuid5(uuid.NAMESPACE_DNS, f"ticket_{t.id}")))

        print(f"Downloading {settings.EMBEDDING_MODEL} (Warning: This may take a minute!)...")
        embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
        
        print(f"Uploading to Qdrant Collection: {settings.QDRANT_COLLECTION}...")
        QdrantVectorStore.from_documents(
            docs, 
            embeddings,
            ids=ids, # Use our strict IDs
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            collection_name=settings.QDRANT_COLLECTION,
            force_recreate=False 
        )
        print("✅ Qdrant Sync Complete.")

    finally:
        db_helpdesk.close()
        db_chatbot.close()

if __name__ == "__main__":
    run_ingestion()