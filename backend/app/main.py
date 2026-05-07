import os
import uvicorn
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from langchain_community.document_loaders import Docx2txtLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore

from app.api import chat

# Load environment variables (Qdrant URLs, API keys, etc.)
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="IT Support AI")

# Essential for AWS/Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Include your existing Chat Routes
app.include_router(chat.router, prefix="/api")

# 2. Initialize Embeddings (Loaded once on startup to save memory and time)
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# 3. The New Document Upload Route
@app.post("/api/upload", tags=["Documents"])
async def upload_document(
    file: UploadFile = File(...), 
    category: str = Form("General IT") # Defaults to 'General IT' but can be changed in the UI
):
    # Save the uploaded file temporarily so Python can read it
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        buffer.write(await file.read())
        
    try:
        # Read the text based on the file type
        if file.filename.endswith(".docx"):
            loader = Docx2txtLoader(temp_file_path)
            docs = loader.load()
        elif file.filename.endswith(".pdf"):
            loader = PyPDFLoader(temp_file_path)
            docs = loader.load()
        else:
            os.remove(temp_file_path)
            return {"error": "Unsupported file format. Please upload DOCX or PDF."}
            
        # Chop the document into readable chunks (paragraphs)
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,  # Characters per chunk
            chunk_overlap=100 # Overlap slightly so sentences don't get cut in half
        )
        chunks = text_splitter.split_documents(docs)
        
        # Attach Metadata (Categorization) to each chunk
        for chunk in chunks:
            chunk.metadata["category"] = category
            chunk.metadata["source_file"] = file.filename
            
        # Upload everything to Qdrant Cloud
        QdrantVectorStore.from_documents(
            documents=chunks,
            embedding=embeddings,
            url=os.getenv("QDRANT_URL"),
            api_key=os.getenv("QDRANT_API_KEY"),
            collection_name="tickets"
        )
        
        # Clean up the temporary file
        os.remove(temp_file_path)
        
        return {
            "status": "success", 
            "message": f"Successfully processed {len(chunks)} chunks from {file.filename} into Qdrant Cloud!",
            "category_applied": category
        }
        
    except Exception as e:
        # Ensure the temp file is deleted even if the code crashes
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        return {"error": f"An error occurred: {str(e)}"}

# 4. Server Execution
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)