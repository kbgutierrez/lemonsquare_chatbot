from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings

# 1. Setup Embeddings
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# 2. Connect to the existing Qdrant Cloud collection
vectorstore = QdrantVectorStore.from_existing_collection(
    embedding=embeddings,
    collection_name="tickets",
    url=settings.QDRANT_URL,
    api_key=settings.QDRANT_API_KEY,
)

# 3. Setup LLM (Groq)
llm = ChatGroq(
    temperature=0.3, 
    model_name="llama-3.3-70b-versatile", 
    groq_api_key=settings.GROQ_API_KEY
)

# 4. Define the Prompt
system_prompt = (
    "You are a professional IT help desk assistant. Follow these exact rules:\n\n"
    "1. GREETINGS: If the user is just greeting you (e.g., 'hello', 'hi', 'hey'), IGNORE the context entirely. Just respond politely and ask how you can help with their IT issues today.\n"
    "2. QUESTIONS: For all actual questions, answer ONLY using the information in the provided Context.\n"
    "3. MISSING INFO: If the Context does not contain the answer to their question, do NOT make one up. Simply state: 'I cannot find the answer to that in my support tickets.'\n\n"
    "Context:\n{context}"
)

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])

# 5. Create the RAG Chain
question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(vectorstore.as_retriever(), question_answer_chain)

def get_chat_response(user_query: str):
    response = rag_chain.invoke({"input": user_query})
    return response["answer"]