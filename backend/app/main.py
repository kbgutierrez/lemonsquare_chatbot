import os
import sys
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from qdrant_client import QdrantClient

from app.api import chat
from app.core.config import settings
from app.services.ingestion import ingestion_service 

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n🔍 Running Pre-Flight Database Check...")
    try:
        qdrant = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
        if not qdrant.collection_exists(settings.QDRANT_COLLECTION):
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

@app.post("/api/upload-document", tags=["Documents"])
async def upload_document(file: UploadFile = File(...)):
    """Uploads a PDF manual, auto-categorizes it, and saves it to Qdrant & SQL."""
    if not file.filename.endswith(".pdf"):
        return {"error": "Currently, only PDF files are supported."}
        
    return await ingestion_service.process_pdf_upload(file)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)