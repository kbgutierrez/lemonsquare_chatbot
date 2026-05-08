import os
from sqlalchemy.orm import Session
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from sentence_transformers import CrossEncoder
from app.core.config import settings
from app.core.models import AIChatbotSetting
from app.core.models import SessionChatbot as SessionLocal 

class SupportOrchestrator:
    def __init__(self):
        print("\n⚙️  Booting AI Orchestrator & Fetching Core Models from SQL...")
        
        # 1. Open a temporary database session just for startup
        db = SessionLocal()
        try:
            active_config = db.query(AIChatbotSetting).filter(AIChatbotSetting.IsActive == True).order_by(AIChatbotSetting.SettingID.desc()).first()
            
            # Read the heavy models from SQL, with safety fallbacks
            embed_model = active_config.EmbeddingModel if active_config and getattr(active_config, 'EmbeddingModel', None) else "intfloat/multilingual-e5-large"
            rerank_model = active_config.RerankerModel if active_config and getattr(active_config, 'RerankerModel', None) else "BAAI/bge-reranker-v2-m3"
            
            print(f"   - Embedding Model : {embed_model}")
            print(f"   - Reranker Model  : {rerank_model}")
            
        finally:
            db.close() # Close it immediately

        # 2. Initialize the heavy infrastructure using the SQL values
        self.qdrant = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
        self.collection_name = settings.QDRANT_COLLECTION
        
        self.embeddings = HuggingFaceEmbeddings(model_name=embed_model)
        self.reranker = CrossEncoder(rerank_model)
        print("✅ Core Infrastructure Initialized.")

    def orchestrate(self, user_query: str, chat_history: str, db: Session) -> tuple[str, list]:
        # ---------------------------------------------------------
        # 1. FETCH DYNAMIC SETTINGS FROM SQL
        # ---------------------------------------------------------
        active_config = db.query(AIChatbotSetting).filter(AIChatbotSetting.IsActive == True).order_by(AIChatbotSetting.SettingID.desc()).first()
        
        # --- NEW: A/B Testing Toggles ---
        use_reformulator = bool(active_config.UseReformulator) if active_config and getattr(active_config, 'UseReformulator', None) is not None else True
        use_reranker = bool(active_config.UseReranker) if active_config and getattr(active_config, 'UseReranker', None) is not None else True
        
        main_model_name = active_config.ActiveModel if active_config else "llama-3.3-70b-versatile"
        reformulator_model_name = active_config.ReformulatorModel if active_config and getattr(active_config, 'ReformulatorModel', None) else "llama-3.1-8b-instant"
        
        temperature = float(active_config.Temperature) if active_config else 0.2
        system_prompt = active_config.SystemPrompt if active_config else "You are an IT Support Agent."
        top_k = active_config.TopK_Tickets if active_config else 8
        
        # Pull threshold from SQL if it exists, otherwise default to -1.0
        confidence_threshold = float(active_config.ConfidenceThreshold) if active_config and getattr(active_config, 'ConfidenceThreshold', None) is not None else -1.0

        reformulator_prompt_template = active_config.ReformulatorPrompt if active_config and getattr(active_config, 'ReformulatorPrompt', None) else """You are a technical search assistant. Read the chat history and the user's latest message. 
If the latest message is vague, rewrite it into a specific IT search query based on the history. Otherwise, return it exactly as written.
DO NOT answer the user. ONLY output the rewritten search string.
History: {chat_history}
Latest Message: {user_query}
Rewritten Search Query:"""

        dynamic_llm = ChatGroq(model=main_model_name, temperature=temperature, api_key=settings.GROQ_API_KEY)

        # ---------------------------------------------------------
        # 2. QUERY REFORMULATION & TRANSLATION (TOGGLEABLE)
        # ---------------------------------------------------------
        search_query = user_query
        
        if use_reformulator:
            reformulator_llm = ChatGroq(model=reformulator_model_name, temperature=0.0, api_key=settings.GROQ_API_KEY)
            safe_history = chat_history if chat_history.strip() else "No previous history. This is the first message."
            
            rewrite_prompt = reformulator_prompt_template.format(
                chat_history=safe_history, 
                user_query=user_query
            )
            
            raw_output = reformulator_llm.invoke(rewrite_prompt).content
            search_query = raw_output.strip(' "\'\n')

        # ---------------------------------------------------------
        # 3. VECTOR SEARCH & RERANKING (TOGGLEABLE)
        # ---------------------------------------------------------
        query_vector = self.embeddings.embed_query(search_query)
        
        search_response = self.qdrant.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            with_payload=True,
            limit=top_k  
        )
        search_result = search_response.points
        
        if not search_result:
            return "I couldn't find any related tickets in the knowledge base.", []

        if use_reranker:
            # Score using the heavy CrossEncoder model
            docs_to_rerank = [[search_query, hit.payload.get('page_content', '')] for hit in search_result]
            scores = self.reranker.predict(docs_to_rerank)
            scored_results = sorted(zip(scores, search_result), key=lambda x: x[0], reverse=True)
        else:
            # Score using Qdrant's raw native Cosine Similarity
            scored_results = [(hit.score, hit) for hit in search_result]

        # ---------------------------------------------------------
        # 4. OBSERVABILITY: ENHANCED TERMINAL TRACE LOGGING
        # ---------------------------------------------------------
        print("\n" + "="*80)
        print("🔍 AI SEARCH TRACE")
        print(f"Reformulator    : {'🟢 ON' if use_reformulator else '🔴 OFF'}")
        print(f"Reranker        : {'🟢 ON' if use_reranker else '🔴 OFF'}")
        print(f"Original Query  : {user_query}")
        print(f"Search Query    : {search_query}")
        print(f"Threshold       : {confidence_threshold}")
        print("-" * 80)
        print("📥 RETRIEVED TICKETS & CONTENT SNIPPETS:")
        
        for score, hit in scored_results:
            ticket_num = hit.payload.get('metadata', {}).get('ticket_number', 'UNKNOWN')
            status = "✅ PASSED " if score > confidence_threshold else "❌ BLOCKED"
            
            # Clean and truncate text for the terminal view
            raw_text = hit.payload.get('page_content', '').replace('\n', ' | ')
            snippet = (raw_text[:60] + '...') if len(raw_text) > 60 else raw_text
            
            print(f" {status} | Score: {score:>7.3f} | Ticket: {ticket_num:<12} | {snippet}")
            
        print("="*80 + "\n")

        # ---------------------------------------------------------
        # 5. FILTERING (The "BS Detector")
        # ---------------------------------------------------------
        valid_hits = [hit for score, hit in scored_results if score > confidence_threshold]
        
        if not valid_hits:
            return "I'm sorry, but that doesn't match any IT issues or solutions in my knowledge base. Could you provide more details about the technical problem?", []

        top_hits = valid_hits[:3] 
        ticket_ids = [hit.payload.get('metadata', {}).get('evaluation_id') for hit in top_hits]
        
        # ---------------------------------------------------------
        # 6. GENERATION 
        # ---------------------------------------------------------
        context = "\n\n---\n\n".join([hit.payload.get('page_content', '') for hit in top_hits])
        
        final_prompt = f"""{system_prompt}
        
        History: {chat_history}
        
        Retrieved Tickets: 
        {context}
        
        User Query: {user_query}"""
        
        final_answer = dynamic_llm.invoke(final_prompt).content
        return final_answer, ticket_ids

orchestrator = SupportOrchestrator()