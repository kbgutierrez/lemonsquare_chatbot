import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore  # <--- UPDATED IMPORT
from langchain_core.documents import Document
from dotenv import load_dotenv

# override=True forces it to reload variables just in case
load_dotenv(override=True)

def run_ingestion():
    print("Downloading/Loading Embedding Model...")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    sample_data = [
        {"text": "Password reset issues can be solved by using the forgot password page.", "metadata": {"source": "manual"}},
        {"text": "VPN connection problems are usually caused by expired credentials.", "metadata": {"source": "manual"}},
        {"text": "Blue screen errors may happen because of outdated graphics drivers.", "metadata": {"source": "manual"}},
        {"text": "Email login issues can be fixed by clearing browser cache and cookies.", "metadata": {"source": "manual"}},
        {"text": "SI jzar ay pogi at mabait", "metadata": {"source": "internal_memo"}},
        {"text": "Maraming salapi ang isang jzar", "metadata": {"source": "internal_memo"}}
    ]

    docs = [Document(page_content=item["text"], metadata=item["metadata"]) for item in sample_data]

    url = os.getenv("QDRANT_URL")
    api_key = os.getenv("QDRANT_API_KEY")
    
    # SAFETY CHECK: Stop immediately if the .env file is missing
    if not url:
        print("❌ FATAL ERROR: QDRANT_URL is missing. Please check your .env file!")
        return
        
    print(f"Connecting to Qdrant at: {url}")
    print("Uploading vectors...")

    # Upload using the new QdrantVectorStore class
    vectorstore = QdrantVectorStore.from_documents(
        docs,
        embeddings,
        url=url,
        api_key=api_key,
        collection_name="tickets",
        force_recreate=True
    )

    print("Success! Data is now in the Qdrant Cloud.")

if __name__ == "__main__":
    run_ingestion()