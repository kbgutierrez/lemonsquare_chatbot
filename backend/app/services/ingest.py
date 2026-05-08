import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_core.documents import Document
from app.core.models import SessionHelpdesk, TicketEvaluation
from app.core.config import settings  # <-- Added config import

load_dotenv(override=True)

def run_ingestion():
    print("Connecting to BigEHelpDeskDev...")
    db = SessionHelpdesk()
    
    try:
        tickets = db.query(TicketEvaluation).filter(TicketEvaluation.work_done.isnot(None)).all()
        print(f"Extracting {len(tickets)} resolved tickets...")
        
        docs = []
        for t in tickets:
            # Dual-Embedding Format
            content = (
                f"TICKET NUMBER: {t.ticket_number}\n"
                f"ISSUE REPORTED: {t.issue_reported or 'None'}\n"
                f"ACTUAL ISSUE FOUND: {t.issue_found or 'None'}\n"
                f"ROOT CAUSE: {t.issue_cause or 'None'}\n"
                f"RESOLUTION (WORK DONE): {t.work_done or 'None'}\n"
                f"ADVANCED RESOLUTION: {t.advanced_work_done or 'None'}"
            )
            metadata = {"evaluation_id": t.id, "ticket_number": t.ticket_number}
            docs.append(Document(page_content=content, metadata=metadata))

        # --- UPDATED: Read model name from Config ---
        print(f"Downloading {settings.EMBEDDING_MODEL} (Warning: This may take a minute!)...")
        embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
        
        # --- UPDATED: Read collection name from Config ---
        print(f"Uploading to Qdrant Collection: {settings.QDRANT_COLLECTION}...")
        QdrantVectorStore.from_documents(
            docs, 
            embeddings,
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            collection_name=settings.QDRANT_COLLECTION,
            force_recreate=True 
        )
        print("✅ Qdrant Sync Complete.")

    finally:
        db.close()

if __name__ == "__main__":
    run_ingestion()