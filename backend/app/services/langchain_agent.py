import os
from sqlalchemy.orm import Session
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models  # <-- NEW IMPORT
from sentence_transformers import CrossEncoder
from app.core.config import settings
from app.core.models import AIChatbotSetting
from app.core.models import SessionChatbot as SessionLocal 

class SupportOrchestrator:
    def __init__(self):
        print("\nBooting AI Orchestrator & Fetching Core Models from SQL...")
        
        db = SessionLocal()
        try:
            active_config = db.query(AIChatbotSetting).filter(AIChatbotSetting.IsActive == True).order_by(AIChatbotSetting.SettingID.desc()).first()
            
            embed_model = active_config.EmbeddingModel if active_config and getattr(active_config, 'EmbeddingModel', None) else "intfloat/multilingual-e5-large"
            rerank_model = active_config.RerankerModel if active_config and getattr(active_config, 'RerankerModel', None) else "BAAI/bge-reranker-v2-m3"
            
            print(f"   - Embedding Model : {embed_model}")
            print(f"   - Reranker Model  : {rerank_model}")
            
        finally:
            db.close()

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
        
        use_reformulator = bool(active_config.UseReformulator) if active_config and getattr(active_config, 'UseReformulator', None) is not None else True
        use_reranker = bool(active_config.UseReranker) if active_config and getattr(active_config, 'UseReranker', None) is not None else True
        
        main_model_name = active_config.ActiveModel if active_config else "llama-3.3-70b-versatile"
        reformulator_model_name = active_config.ReformulatorModel if active_config and getattr(active_config, 'ReformulatorModel', None) else "llama-3.1-8b-instant"
        
        temperature = float(active_config.Temperature) if active_config else 0.2
        system_prompt = active_config.SystemPrompt if active_config else "You are an IT Support Agent."
        
        confidence_threshold = float(active_config.ConfidenceThreshold) if active_config and getattr(active_config, 'ConfidenceThreshold', None) is not None else -1.0

        reformulator_prompt_template = active_config.ReformulatorPrompt if active_config and getattr(active_config, 'ReformulatorPrompt', None) else """You are a technical search assistant. Read the chat history and the user's latest message. 
If the latest message is vague, rewrite it into a specific IT search query based on the history. Otherwise, return it exactly as written.
DO NOT answer the user. ONLY output the rewritten search string.
History: {chat_history}
Latest Message: {user_query}
Rewritten Search Query:"""

        dynamic_llm = ChatGroq(model=main_model_name, temperature=temperature, api_key=settings.GROQ_API_KEY)

        # ---------------------------------------------------------
        # 2. QUERY REFORMULATION & TRANSLATION
        # ---------------------------------------------------------
        search_query = user_query
        if use_reformulator:
            reformulator_llm = ChatGroq(model=reformulator_model_name, temperature=0.0, api_key=settings.GROQ_API_KEY)
            safe_history = chat_history if chat_history.strip() else "No previous history. This is the first message."
            rewrite_prompt = reformulator_prompt_template.format(chat_history=safe_history, user_query=user_query)
            raw_output = reformulator_llm.invoke(rewrite_prompt).content
            search_query = raw_output.strip(' "\'\n')

        # ---------------------------------------------------------
        # 3. VECTOR SEARCH (FEDERATED MULTI-QUERY)
        # ---------------------------------------------------------
        query_vector = self.embeddings.embed_query(search_query)
        
        # Query A: Force retrieve up to 5 TICKETS ONLY
        ticket_response = self.qdrant.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=qdrant_models.Filter(
                must_not=[qdrant_models.FieldCondition(key="metadata.doc_type", match=qdrant_models.MatchValue(value="uploaded_manual"))]
            ),
            with_payload=True,
            limit=5
        )

        # Query B: Force retrieve up to 5 DOCUMENTS ONLY
        doc_response = self.qdrant.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=qdrant_models.Filter(
                must=[qdrant_models.FieldCondition(key="metadata.doc_type", match=qdrant_models.MatchValue(value="uploaded_manual"))]
            ),
            with_payload=True,
            limit=5
        )

        combined_results = ticket_response.points + doc_response.points
        
        if not combined_results:
            return "I couldn't find any related tickets or documents in the knowledge base.", []

        if use_reranker:
            docs_to_rerank = [[search_query, hit.payload.get('page_content', '')] for hit in combined_results]
            scores = self.reranker.predict(docs_to_rerank)
            scored_results = sorted(zip(scores, combined_results), key=lambda x: x[0], reverse=True)
        else:
            scored_results = sorted([(hit.score, hit) for hit in combined_results], key=lambda x: x[0], reverse=True)

        # ---------------------------------------------------------
        # 4. OBSERVABILITY LOGGING
        # ---------------------------------------------------------
        print("\n" + "="*80)
        print("🔍 AI SEARCH TRACE")
        print(f"Original Query  : {user_query}")
        print(f"Search Query    : {search_query}")
        print("-" * 80)
        print("📥 RETRIEVED KNOWLEDGE & CONTENT SNIPPETS:")
        
        for score, hit in scored_results:
            status = "✅ PASSED " if score > confidence_threshold else "❌ BLOCKED"
            doc_type = hit.payload.get('metadata', {}).get('doc_type', 'ticket')
            
            if doc_type == 'uploaded_manual':
                display_id = f"📄 {hit.payload.get('metadata', {}).get('source', 'Manual')} [{hit.payload.get('metadata', {}).get('category', 'General')}]"
            else:
                display_id = f"🎫 Ticket: {hit.payload.get('metadata', {}).get('ticket_number', 'UNKNOWN')}"
            
            raw_text = hit.payload.get('page_content', '').replace('\n', ' | ')
            print(f" {status} | Score: {score:>7.3f} | Source: {display_id}")
            print(f"      ↳ CONTENT: {raw_text[:150]}...\n")
        print("="*80 + "\n")

        # ---------------------------------------------------------
        # 5. FILTERING & SLOT ALLOCATION (Max 5 Total)
        # ---------------------------------------------------------
        valid_hits = [hit for score, hit in scored_results if score > confidence_threshold]
        if not valid_hits:
            return "I'm sorry, but that doesn't match any IT issues or solutions in my knowledge base.", []

        final_hits = []
        tickets_added = 0
        docs_added = 0
        
        # We aim for 3 Tickets and 2 Documents
        for hit in valid_hits:
            doc_type = hit.payload.get('metadata', {}).get('doc_type', 'ticket')
            if doc_type != 'uploaded_manual' and tickets_added < 3:
                final_hits.append(hit)
                tickets_added += 1
            elif doc_type == 'uploaded_manual' and docs_added < 2:
                final_hits.append(hit)
                docs_added += 1
            if len(final_hits) == 5:
                break
                
        # Fallback: If we didn't fill all 5 slots, fill with whatever is left
        if len(final_hits) < 5:
            for hit in valid_hits:
                if hit not in final_hits:
                    final_hits.append(hit)
                if len(final_hits) == 5:
                    break

        top_hits = final_hits
        
        ticket_ids = [
            hit.payload.get('metadata', {}).get('evaluation_id') 
            for hit in top_hits 
            if hit.payload.get('metadata', {}).get('evaluation_id') is not None
        ]
        
        # ---------------------------------------------------------
        # 6. GENERATION (With Smart Context Tagging)
        # ---------------------------------------------------------
        formatted_chunks = []
        for hit in top_hits:
            doc_type = hit.payload.get('metadata', {}).get('doc_type', 'ticket')
            content = hit.payload.get('page_content', '')
            
            if doc_type == 'uploaded_manual':
                source_name = hit.payload.get('metadata', {}).get('source', 'Manual')
                cat = hit.payload.get('metadata', {}).get('category', 'General')
                formatted_chunks.append(f"[SOURCE: OFFICIAL DOCUMENT - {source_name} | CATEGORY: {cat}]\n{content}")
            else:
                t_num = hit.payload.get('metadata', {}).get('ticket_number', 'UNKNOWN')
                formatted_chunks.append(f"[SOURCE: RESOLVED TICKET - {t_num}]\n{content}")
                
        context = "\n\n---\n\n".join(formatted_chunks)
        
        final_prompt = f"""{system_prompt}
        
        History: {chat_history}
        
        Retrieved Context: 
        {context}
        
        User Query: {user_query}"""
        
        final_answer = dynamic_llm.invoke(final_prompt).content
        return final_answer, ticket_ids

orchestrator = SupportOrchestrator()