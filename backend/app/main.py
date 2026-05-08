import os
import sys
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from langchain_community.document_loaders import Docx2txtLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

from app.api import chat
from app.core.config import settings

# Load environment variables
load_dotenv()

# ==========================================
# 🛑 THE PRE-FLIGHT CHECK (NEW)
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n🔍 Running Pre-Flight Database Check...")
    try:
        # Connect directly to Qdrant to check the status
        qdrant = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
        
        # Check if the collection named in config.py actually exists
        if not qdrant.collection_exists(settings.QDRANT_COLLECTION):
            print("\n" + "="*70)
            print("❌ CRITICAL ERROR: Vector Database Collection Missing!")
            print(f"The collection '{settings.QDRANT_COLLECTION}' does not exist in Qdrant.")
            print("This usually happens because the Embedding Model was changed in config.py.")
            print("\n🛠️  HOW TO FIX THIS:")
            print("1. Server startup has been ABORTED to prevent crashes.")
            print("2. Open your terminal and run: python -m app.services.ingest")
            print("3. Once ingestion is complete, restart this server.")
            print("="*70 + "\n")
            
            # Instantly kill the Uvicorn server
            sys.exit(1) 
            
        print(f"✅ Vector Database verified (Collection: {settings.QDRANT_COLLECTION})")
        
    except SystemExit:
        raise
    except Exception as e:
        print(f"❌ Qdrant Connection Failed: {e}")
        sys.exit(1)
        
    # Yield control back to FastAPI to actually start the server
    yield 

# ==========================================
# FASTAPI INITIALIZATION
# ==========================================
# Notice we attached the lifespan function here!
app = FastAPI(title="IT Support AI Enterprise", lifespan=lifespan)

# Essential for AWS/Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Mount the Chat Router
app.include_router(chat.router, prefix="/api")

# 2. Initialize Embeddings for the Document Upload
embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)

# 3. Document Upload Route 
@app.post("/api/upload", tags=["Documents"])
async def upload_document(
    file: UploadFile = File(...), 
    category: str = Form("General IT")
):
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        buffer.write(await file.read())
        
    try:
        if file.filename.endswith(".docx"):
            loader = Docx2txtLoader(temp_file_path)
            docs = loader.load()
        elif file.filename.endswith(".pdf"):
            loader = PyPDFLoader(temp_file_path)
            docs = loader.load()
        else:
            os.remove(temp_file_path)
            return {"error": "Unsupported file format. Please upload DOCX or PDF."}
            
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = text_splitter.split_documents(docs)
        
        for chunk in chunks:
            chunk.metadata["category"] = category
            chunk.metadata["source_file"] = file.filename
            
        QdrantVectorStore.from_documents(
            documents=chunks,
            embedding=embeddings,
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            collection_name=settings.QDRANT_COLLECTION 
        )
        
        os.remove(temp_file_path)
        return {
            "status": "success", 
            "message": f"Successfully processed {len(chunks)} chunks into Qdrant!",
            "category_applied": category
        }
        
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        return {"error": f"An error occurred: {str(e)}"}

# 4. Server Execution
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)