import os
import uuid
import tempfile
from fastapi import UploadFile
from PyPDF2 import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct
from app.core.config import settings
from app.core.models import SessionChatbot, AIChatbotSetting, UploadedDocument

class DocumentIngestionService:
    def __init__(self):
        print("\nStarting Ingestion")
        db = SessionChatbot()
        try:
            active_config = db.query(AIChatbotSetting).filter(AIChatbotSetting.IsActive == True).order_by(AIChatbotSetting.SettingID.desc()).first()
            self.embed_model = active_config.EmbeddingModel if active_config and getattr(active_config, 'EmbeddingModel', None) else "intfloat/multilingual-e5-large"
            self.classifier_model = active_config.ReformulatorModel if active_config and getattr(active_config, 'ReformulatorModel', None) else "llama-3.1-8b-instant"
            
            raw_categories = getattr(active_config, 'AllowedCategories', None)
            if raw_categories:
                self.allowed_categories = [c.strip() for c in raw_categories.split(',')]
            else:
                self.allowed_categories = [
                    "Network_Infrastructure", "Hardware_Guide", "Software_Documentation", 
                    "HR_IT_Policy", "Troubleshooting_Manual", "General_IT"
                ]
        finally:
            db.close()

        self.qdrant = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
        self.collection_name = settings.QDRANT_COLLECTION
        self.embeddings = HuggingFaceEmbeddings(model_name=self.embed_model)
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len,
        )

    async def process_pdf_upload(self, file: UploadFile) -> dict:
        # Secure Temporary File Handling
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(await file.read())
            temp_file_path = temp_file.name
            
        try:
            # 1. Parse PDF
            pdf_reader = PdfReader(temp_file_path)
            raw_text = ""
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    raw_text += text + "\n"
                    
            if not raw_text.strip():
                return {"status": "error", "message": "Could not extract text from PDF."}

            # 2. AI Auto-Categorization with STRICT Validation
            print(f"\n🧠 Auto-categorizing '{file.filename}'...")
            classify_llm = ChatGroq(model=self.classifier_model, temperature=0.0, api_key=settings.GROQ_API_KEY)
            
            categories_string = ", ".join(self.allowed_categories)
            prompt = f"""You are a strict document classifier API. Read the excerpt and categorize it into EXACTLY ONE of these tags:
            {categories_string}
            
            Output ONLY the exact tag name. Do not explain.
            Excerpt: {raw_text[:1500]}
            Category:"""
            
            ai_category = classify_llm.invoke(prompt).content.strip(' "\'\n')
            
            # Fallback Validation
            if ai_category not in self.allowed_categories:
                print(f"⚠️ Warning: AI hallucinated category '{ai_category}'. Falling back to 'General_IT'.")
                ai_category = "General_IT"
            else:
                print(f"✅ Classified as: {ai_category}")

            # 3. Chunking & Batch Embedding
            chunks = self.text_splitter.split_text(raw_text)
            document_id = str(uuid.uuid4())
            points = []
            
            print(f"🧮 Calculating Vector Embeddings (Batching {len(chunks)} chunks)...")
            vectors = self.embeddings.embed_documents(chunks)
            
            for i, chunk in enumerate(chunks):
                chunk_id = str(uuid.uuid4()) 
                payload = {
                    "page_content": chunk,
                    "metadata": {
                        "document_id": document_id,
                        "source": file.filename,
                        "category": ai_category,
                        "chunk_index": i,
                        "doc_type": "uploaded_manual"
                    }
                }
                points.append(PointStruct(id=chunk_id, vector=vectors[i], payload=payload))

            # 4. Save to Qdrant
            self.qdrant.upsert(collection_name=self.collection_name, points=points)
            
            # 5. Save to SQL Database (For Admin Panel)
            db = SessionChatbot()
            try:
                new_doc = UploadedDocument(
                    DocumentID=document_id,
                    FileName=file.filename,
                    Category=ai_category,
                    ChunkCount=len(chunks)
                )
                db.add(new_doc)
                db.commit()
            finally:
                db.close()

            return {
                "status": "success", 
                "document_id": document_id,
                "category": ai_category,
                "chunks_processed": len(chunks)
            }
            
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

ingestion_service = DocumentIngestionService()