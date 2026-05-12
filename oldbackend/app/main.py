import os
import sys
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models

from app.api import chat
from app.api.deps import get_helpdesk_db, get_chatbot_db
from app.core.models import TicketEvaluation, BlacklistedTicket, UploadedDocument,AIChatbotSetting
from app.core.config import settings
from app.services.ingestion import ingestion_service 
from app.api.chat import SettingsUpdate



load_dotenv()

# Global Qdrant Client for the APIs
qdrant_api_client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n🔍 Running Pre-Flight Database Check...")
    try:
        if not qdrant_api_client.collection_exists(settings.QDRANT_COLLECTION):
            print("\n" + "="*70)
            print("❌ CRITICAL ERROR: Vector Database Collection Missing!")
            sys.exit(1) 
        print(f"✅ Vector Database verified (Collection: {settings.QDRANT_COLLECTION})")
    except SystemExit:
        raise
    except Exception as e:
        print(f"❌ Qdrant Connection Failed: {e}")
        sys.exit(1)
    yield 

app = FastAPI(title="IT Support AI Enterprise", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")

# ---------------------------------------------------------
# DOCUMENT UPLOAD APIs
# ---------------------------------------------------------
@app.post("/api/upload-document", tags=["Documents"])
async def upload_document(file: UploadFile = File(...)):
    """Uploads a PDF manual, auto-categorizes it, and saves it to Qdrant & SQL."""
    if not file.filename.endswith(".pdf"):
        return {"error": "Currently, only PDF files are supported."}
        
    return await ingestion_service.process_pdf_upload(file)

@app.delete("/api/documents/{document_id}", tags=["Documents"])
async def delete_knowledge_document(document_id: str):
    """Safely removes a document from Qdrant and soft-deletes it from SQL."""
    return await ingestion_service.delete_document(document_id)


@app.get("/api/documents", tags=["Documents"])
def get_documents(
    category: str = None,
    limit: int = 50,
    db: Session = Depends(get_chatbot_db)
):
    """Fetches the list of active uploaded documents for the Admin UI."""
    query = db.query(UploadedDocument).filter(UploadedDocument.IsActive == True)
    
    if category:
        query = query.filter(UploadedDocument.Category == category)
        
    documents = query.order_by(UploadedDocument.UploadedAt.desc()).limit(limit).all()
    
    result = []
    for doc in documents:
        result.append({
            "document_id": doc.DocumentID,
            "file_name": doc.FileName,
            "category": doc.Category,
            "chunk_count": doc.ChunkCount,
            "uploaded_at": doc.UploadedAt
        })
        
    return result

# ---------------------------------------------------------
# TICKET BLACKLIST APIs
# ---------------------------------------------------------
@app.get("/api/tickets", tags=["Tickets"])
def get_tickets(
    search: str = None, 
    limit: int = 50, 
    db_helpdesk: Session = Depends(get_helpdesk_db),
    db_chatbot: Session = Depends(get_chatbot_db)
):
    """Fetches resolved tickets, and flags if they are blacklisted."""
    # Fast lookup for blacklisted tickets
    blacklisted = {b.TicketNumber for b in db_chatbot.query(BlacklistedTicket.TicketNumber).all()}
    
    query = db_helpdesk.query(TicketEvaluation).filter(TicketEvaluation.work_done.isnot(None))
    
    if search:
        query = query.filter(TicketEvaluation.ticket_number.contains(search))
        
    tickets = query.order_by(TicketEvaluation.id.desc()).limit(limit).all()
    
    result = []
    for t in tickets:
        result.append({
            "id": t.id,
            "ticket_number": t.ticket_number,
            "issue_reported": t.issue_reported,
            "work_done": t.work_done,
            "is_blacklisted": t.ticket_number in blacklisted
        })
    return result

@app.delete("/api/tickets/{ticket_number}", tags=["Tickets"])
def delete_ticket_from_ai(
    ticket_number: str, 
    db_chatbot: Session = Depends(get_chatbot_db)
):
    """Removes a ticket from Qdrant and adds it to the SQL Blacklist."""
    print(f"\n🗑️ Purging Ticket {ticket_number} from AI Knowledge Base...")
    
    # 1. HARD DELETE from Qdrant
    try:
        qdrant_api_client.delete(
            collection_name=settings.QDRANT_COLLECTION,
            points_selector=qdrant_models.Filter(
                must=[
                    qdrant_models.FieldCondition(
                        key="metadata.ticket_number",
                        match=qdrant_models.MatchValue(value=ticket_number)
                    )
                ]
            )
        )
        print(f"✅ Ticket {ticket_number} vectors deleted from Qdrant.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Qdrant deletion failed: {e}")

    # 2. Add to SQL Blacklist
    try:
        existing = db_chatbot.query(BlacklistedTicket).filter(BlacklistedTicket.TicketNumber == ticket_number).first()
        if not existing:
            blacklist_entry = BlacklistedTicket(TicketNumber=ticket_number)
            db_chatbot.add(blacklist_entry)
            db_chatbot.commit()
            print(f"✅ Ticket {ticket_number} added to Blacklist.")
    except Exception as e:
        db_chatbot.rollback()
        raise HTTPException(status_code=500, detail=f"SQL Blacklist failed: {e}")

    return {"status": "success", "message": f"Ticket {ticket_number} permanently removed."}



# ---------------------------------------------------------
# AI SETTINGS APIs
# ---------------------------------------------------------

@app.get("/api/settings", tags=["Settings"])
def get_current_settings(db: Session = Depends(get_chatbot_db)):
    """Fetches the currently active AI configuration."""
    active_config = (
        db.query(AIChatbotSetting)
        .filter(AIChatbotSetting.IsActive == True)
        .order_by(AIChatbotSetting.SettingID.desc())
        .first()
    )
    
    if not active_config:
        raise HTTPException(status_code=404, detail="No active settings found.")
        
    return active_config


@app.post("/api/settings", tags=["Settings"])
def update_settings(
    new_settings: SettingsUpdate, # <--- Uses the Pydantic schema we just made
    user_token: str = "DEV_MODE", # You can secure this with your User API later!
    db: Session = Depends(get_chatbot_db)
):
    """Saves a new AI configuration and archives the old one."""
    
    # 1. DEACTIVATE the currently active settings (Archive them)
    db.query(AIChatbotSetting).filter(AIChatbotSetting.IsActive == True).update({"IsActive": False})
    
    # 2. INSERT the brand new settings row
    new_config = AIChatbotSetting(
        ActiveModel=new_settings.ActiveModel,
        ReformulatorModel=new_settings.ReformulatorModel,
        SystemPrompt=new_settings.SystemPrompt,
        ReformulatorPrompt=new_settings.ReformulatorPrompt,
        Temperature=new_settings.Temperature,
        ConfidenceThreshold=new_settings.ConfidenceThreshold,
        EmbeddingModel=new_settings.EmbeddingModel,
        RerankerModel=new_settings.RerankerModel,
        TopK_Tickets=new_settings.TopK_Tickets,
        UseReformulator=new_settings.UseReformulator,
        UseReranker=new_settings.UseReranker,
        AllowedCategories=new_settings.AllowedCategories,
        IsActive=True, # Make this the new active config!
        UpdatedBy=1 # You can grab the actual admin ID using the token here later
    )
    
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    
    return {"status": "success", "message": "Settings updated successfully!", "data": new_config}





@app.get("/api/settings/ai", tags=["Settings"])
def get_ai_settings(db: Session = Depends(get_chatbot_db)):
    """Fetches the currently active AI configuration for the Admin Dashboard."""
    active_config = (
        db.query(AIChatbotSetting)
        .filter(AIChatbotSetting.IsActive == True)
        .order_by(AIChatbotSetting.SettingID.desc())
        .first()
    )
    
    if not active_config:
        raise HTTPException(status_code=404, detail="No active settings found.")
        
    return active_config


@app.post("/api/settings/ai/update", tags=["Settings"])
def update_ai_settings(
    new_settings: SettingsUpdate, 
    db: Session = Depends(get_chatbot_db)
):
    """Saves a new AI configuration and archives the old one."""
    
    # 1. DEACTIVATE the currently active settings (Archive them)
    db.query(AIChatbotSetting).filter(AIChatbotSetting.IsActive == True).update({"IsActive": False})
    
    # 2. INSERT the brand new settings row
    new_config = AIChatbotSetting(
        ActiveModel=new_settings.ActiveModel,
        ReformulatorModel=new_settings.ReformulatorModel,
        SystemPrompt=new_settings.SystemPrompt,
        ReformulatorPrompt=new_settings.ReformulatorPrompt,
        Temperature=new_settings.Temperature,
        ConfidenceThreshold=new_settings.ConfidenceThreshold,
        EmbeddingModel=new_settings.EmbeddingModel,
        RerankerModel=new_settings.RerankerModel,
        TopK_Tickets=new_settings.TopK_Tickets,
        UseReformulator=new_settings.UseReformulator,
        UseReranker=new_settings.UseReranker,
        AllowedCategories=new_settings.AllowedCategories,
        IsActive=True, 
        UpdatedBy=1 
    )
    
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    
    return {"status": "success", "message": "AI Settings updated successfully!", "data": new_config}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)



