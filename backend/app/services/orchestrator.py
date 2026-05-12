"""
AI RAG Orchestrator.

Implements the Retrieve-Augment-Generate pipeline:
  1. Query Reformulation  — LLM rewrites vague queries for better retrieval.
  2. Federated Vector Search — Separate Qdrant queries for tickets vs documents.
  3. Cross-Encoder Reranking — Rerank combined results by semantic relevance.
  4. Slot Allocation — Select top results with a 3-ticket / 2-doc budget.
  5. Answer Generation — LLM generates a final answer from context.

CRITICAL FIXES vs original:
  A. No module-level instantiation.
     The original did `orchestrator = SupportOrchestrator()` at import time,
     which downloaded two ML models (embeddings + reranker) during import.
     This object is now created explicitly in the FastAPI lifespan and
     stored in app.state.

  B. Async correctness.
     The original `orchestrate()` was a synchronous method that called
     ChatGroq.invoke() (an HTTP request) inside an async endpoint without
     await — this blocked the entire event loop. It is now async and uses
     `ainvoke()` for LLM calls. CPU-bound operations (embedding, reranking)
     are run via asyncio.to_thread() so they don't block I/O processing.

  C. DB session via parameter, not self-created.
     The original opened its own SessionLocal() inside __init__. The db
     session is now passed in from the route via FastAPI DI.
"""

import asyncio
import logging

from sqlalchemy.orm import Session
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models
from sentence_transformers import CrossEncoder

from app.core.config import settings
from app.core.exceptions import AIProcessingError
from app.models.chatbot import AIChatbotSetting

logger = logging.getLogger(__name__)

# Default fallback values used when no active DB config is found.
_DEFAULT_MAIN_MODEL = "llama-3.3-70b-versatile"
_DEFAULT_REFORMULATOR_MODEL = "llama-3.1-8b-instant"
_DEFAULT_REFORMULATOR_PROMPT = (
    "You are a technical search assistant. Read the chat history and the user's "
    "latest message. If the latest message is vague, rewrite it into a specific "
    "IT search query based on the history. Otherwise, return it exactly as written.\n"
    "DO NOT answer the user. ONLY output the rewritten search string.\n"
    "History: {chat_history}\n"
    "Latest Message: {user_query}\n"
    "Rewritten Search Query:"
)


class SupportOrchestrator:
    """
    Manages the full RAG pipeline for IT support queries.

    This object is expensive to create (loads two ML models). It is
    instantiated once during app startup and reused for every request.
    """

    def __init__(
        self,
        db: Session,
        embed_model: str | None = None,
        reranker_model: str | None = None,
    ) -> None:
        """
        Load models and connect to Qdrant.

        Args:
            db: A short-lived DB session used only during __init__ to read
                the active AIChatbotSetting. Closed by the caller after init.
            embed_model: Override embedding model name (optional).
            reranker_model: Override reranker model name (optional).
        """
        logger.info("Initializing AI Orchestrator — loading models...")

        active_config = (
            db.query(AIChatbotSetting)
            .filter(AIChatbotSetting.IsActive == True)
            .order_by(AIChatbotSetting.SettingID.desc())
            .first()
        )

        resolved_embed = (
            embed_model
            or (active_config.EmbeddingModel if active_config and active_config.EmbeddingModel else None)
            or settings.EMBEDDING_MODEL
        )
        resolved_reranker = (
            reranker_model
            or (active_config.RerankerModel if active_config and active_config.RerankerModel else None)
            or settings.RERANKER_MODEL
        )

        logger.info("Embedding model  : %s", resolved_embed)
        logger.info("Reranker model   : %s", resolved_reranker)

        self.qdrant = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
        )
        self.collection_name = settings.QDRANT_COLLECTION
        self.embeddings = HuggingFaceEmbeddings(model_name=resolved_embed)
        self.reranker = CrossEncoder(resolved_reranker)

        logger.info("AI Orchestrator ready.")

    async def orchestrate(
        self,
        user_query: str,
        chat_history: str,
        user_name: str,
        db: Session,
    ) -> tuple[str, list[int]]:
        """
        Run the full RAG pipeline for a user query.

        Args:
            user_query: The raw message from the user.
            chat_history: Prior conversation formatted as "role: message" lines.
            user_name: Display name of the authenticated user (injected into prompt).
            db: Active DB session for reading current AI settings.

        Returns:
            A tuple of (ai_response_text, list_of_ticket_ids_used).

        Raises:
            AIProcessingError: If any stage of the pipeline fails.
        """
        try:
            return await self._run_pipeline(user_query, chat_history, user_name, db)
        except Exception as exc:
            logger.error("Orchestrator pipeline failed: %s", exc, exc_info=True)
            raise AIProcessingError(f"AI pipeline error: {exc}") from exc

    async def debug_orchestrate(
        self,
        user_query: str,
        chat_history: str,
        user_name: str,
        db: Session,
    ) -> dict:
        """
        Debug version that returns detailed pipeline information.
        """
        # Run the normal pipeline but capture all intermediate data
        final_answer, ticket_ids = await self.orchestrate(user_query, chat_history, user_name, db)
        
        # For debug, we need to re-run the pipeline to capture intermediates
        # This is a simplified version - in production you'd modify orchestrate to return debug data
        
        # Get settings
        active_config = (
            db.query(AIChatbotSetting)
            .filter(AIChatbotSetting.IsActive == True)
            .order_by(AIChatbotSetting.SettingID.desc())
            .first()
        )
        
        use_reformulator = bool(
            active_config.UseReformulator
            if active_config and active_config.UseReformulator is not None
            else True
        )
        
        # Reformulate query if enabled
        search_query = user_query
        if use_reformulator:
            reformulator_llm = ChatGroq(
                model=active_config.ReformulatorModel if active_config and active_config.ReformulatorModel else _DEFAULT_REFORMULATOR_MODEL,
                temperature=0.0,
                api_key=settings.GROQ_API_KEY,
            )
            safe_history = chat_history.strip() or "No previous history. This is the first message."
            rewrite_prompt = (active_config.ReformulatorPrompt if active_config and active_config.ReformulatorPrompt else _DEFAULT_REFORMULATOR_PROMPT).format(
                chat_history=safe_history,
                user_query=user_query,
            )
            raw_output = await reformulator_llm.ainvoke(rewrite_prompt)
            search_query = raw_output.content.strip(' "\'\n')
        
        # Vector search
        query_vector = await asyncio.to_thread(self.embeddings.embed_query, search_query)
        
        ticket_response = self.qdrant.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=qdrant_models.Filter(
                must_not=[
                    qdrant_models.FieldCondition(
                        key="metadata.doc_type",
                        match=qdrant_models.MatchValue(value="uploaded_manual"),
                    )
                ]
            ),
            with_payload=True,
            limit=5,
        )
        doc_response = self.qdrant.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=qdrant_models.Filter(
                must=[
                    qdrant_models.FieldCondition(
                        key="metadata.doc_type",
                        match=qdrant_models.MatchValue(value="uploaded_manual"),
                    )
                ]
            ),
            with_payload=True,
            limit=5,
        )
        
        # Format retrieval results
        retrieval_results = []
        for hit in ticket_response.points + doc_response.points:
            retrieval_results.append({
                "score": hit.score,
                "type": hit.payload.get("metadata", {}).get("doc_type", "unknown"),
                "source": (
                    hit.payload.get("metadata", {}).get("ticket_number", "UNKNOWN")
                    if hit.payload.get("metadata", {}).get("doc_type") != "uploaded_manual"
                    else hit.payload.get("metadata", {}).get("source", "Manual")
                ),
                "content": hit.payload.get("page_content", ""),
            })
        
        return {
            "original_query": user_query,
            "reformulated_query": search_query,
            "retrieval_results": retrieval_results,
            "final_answer": final_answer,
            "ticket_ids_used": ticket_ids,
        }

    async def _run_pipeline(
        self,
        user_query: str,
        chat_history: str,
        user_name: str,
        db: Session,
    ) -> tuple[str, list[int]]:
        # ── 1. Load Dynamic Settings ──────────────────────────────────────
        active_config = (
            db.query(AIChatbotSetting)
            .filter(AIChatbotSetting.IsActive == True)
            .order_by(AIChatbotSetting.SettingID.desc())
            .first()
        )

        use_reformulator = bool(
            active_config.UseReformulator
            if active_config and active_config.UseReformulator is not None
            else True
        )
        use_reranker = bool(
            active_config.UseReranker
            if active_config and active_config.UseReranker is not None
            else True
        )
        main_model = (active_config.ActiveModel if active_config else _DEFAULT_MAIN_MODEL)
        reformulator_model = (
            active_config.ReformulatorModel
            if active_config and active_config.ReformulatorModel
            else _DEFAULT_REFORMULATOR_MODEL
        )
        temperature = float(active_config.Temperature) if active_config else 0.2
        system_prompt = (
            active_config.SystemPrompt if active_config else "You are an IT Support Agent."
        )
        confidence_threshold = (
            float(active_config.ConfidenceThreshold)
            if active_config and active_config.ConfidenceThreshold is not None
            else -1.0
        )
        reformulator_prompt_template = (
            active_config.ReformulatorPrompt
            if active_config and active_config.ReformulatorPrompt
            else _DEFAULT_REFORMULATOR_PROMPT
        )

        dynamic_llm = ChatGroq(
            model=main_model,
            temperature=temperature,
            api_key=settings.GROQ_API_KEY,
        )

        # ── 2. Query Reformulation ────────────────────────────────────────
        search_query = user_query
        if use_reformulator:
            reformulator_llm = ChatGroq(
                model=reformulator_model,
                temperature=0.0,
                api_key=settings.GROQ_API_KEY,
            )
            safe_history = (
                chat_history.strip()
                or "No previous history. This is the first message."
            )
            rewrite_prompt = reformulator_prompt_template.format(
                chat_history=safe_history,
                user_query=user_query,
            )
            # ainvoke() is async — does NOT block the event loop.
            raw_output = await reformulator_llm.ainvoke(rewrite_prompt)
            search_query = raw_output.content.strip(' "\'\n')

        # ── 3. Vector Search (CPU-bound — run in thread) ──────────────────
        query_vector = await asyncio.to_thread(
            self.embeddings.embed_query, search_query
        )

        ticket_response = self.qdrant.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=qdrant_models.Filter(
                must_not=[
                    qdrant_models.FieldCondition(
                        key="metadata.doc_type",
                        match=qdrant_models.MatchValue(value="uploaded_manual"),
                    )
                ]
            ),
            with_payload=True,
            limit=5,
        )
        doc_response = self.qdrant.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=qdrant_models.Filter(
                must=[
                    qdrant_models.FieldCondition(
                        key="metadata.doc_type",
                        match=qdrant_models.MatchValue(value="uploaded_manual"),
                    )
                ]
            ),
            with_payload=True,
            limit=5,
        )

        combined_results = ticket_response.points + doc_response.points
        if not combined_results:
            return (
                "I couldn't find any related tickets or documents in the knowledge base.",
                [],
            )

        # ── 4. Reranking (CPU-bound — run in thread) ──────────────────────
        if use_reranker:
            pairs = [
                [search_query, hit.payload.get("page_content", "")]
                for hit in combined_results
            ]
            scores = await asyncio.to_thread(self.reranker.predict, pairs)
            scored_results = sorted(
                zip(scores, combined_results), key=lambda x: x[0], reverse=True
            )
        else:
            scored_results = sorted(
                [(hit.score, hit) for hit in combined_results],
                key=lambda x: x[0],
                reverse=True,
            )

        # ── 5. Observability Logging ──────────────────────────────────────
        logger.debug("Original query : %s", user_query)
        logger.debug("Search query   : %s", search_query)
        for score, hit in scored_results:
            passed = score > confidence_threshold
            doc_type = hit.payload.get("metadata", {}).get("doc_type", "ticket")
            source = (
                hit.payload.get("metadata", {}).get("source", "Manual")
                if doc_type == "uploaded_manual"
                else hit.payload.get("metadata", {}).get("ticket_number", "UNKNOWN")
            )
            logger.debug(
                "%s | score=%.3f | source=%s",
                "PASS" if passed else "BLOCKED",
                score,
                source,
            )

        # ── 6. Confidence Filtering & Slot Allocation ─────────────────────
        valid_hits = [hit for score, hit in scored_results if score > confidence_threshold]
        if not valid_hits:
            return (
                "I'm sorry, that doesn't match any IT issues or solutions in my knowledge base.",
                [],
            )

        # Budget: up to 3 tickets + 2 documents = 5 total context items.
        final_hits: list = []
        tickets_added = 0
        docs_added = 0
        for hit in valid_hits:
            doc_type = hit.payload.get("metadata", {}).get("doc_type", "ticket")
            if doc_type != "uploaded_manual" and tickets_added < 3:
                final_hits.append(hit)
                tickets_added += 1
            elif doc_type == "uploaded_manual" and docs_added < 2:
                final_hits.append(hit)
                docs_added += 1
            if len(final_hits) == 5:
                break

        # Fallback: fill any remaining slots with whatever is available.
        if len(final_hits) < 5:
            for hit in valid_hits:
                if hit not in final_hits:
                    final_hits.append(hit)
                if len(final_hits) == 5:
                    break

        ticket_ids = [
            hit.payload.get("metadata", {}).get("evaluation_id")
            for hit in final_hits
            if hit.payload.get("metadata", {}).get("evaluation_id") is not None
        ]

        # ── 7. Context Formatting & Generation ────────────────────────────
        formatted_chunks = []
        for hit in final_hits:
            doc_type = hit.payload.get("metadata", {}).get("doc_type", "ticket")
            content = hit.payload.get("page_content", "")
            if doc_type == "uploaded_manual":
                source_name = hit.payload.get("metadata", {}).get("source", "Manual")
                cat = hit.payload.get("metadata", {}).get("category", "General")
                formatted_chunks.append(
                    f"[SOURCE: OFFICIAL DOCUMENT — {source_name} | CATEGORY: {cat}]\n{content}"
                )
            else:
                t_num = hit.payload.get("metadata", {}).get("ticket_number", "UNKNOWN")
                formatted_chunks.append(
                    f"[SOURCE: RESOLVED TICKET — {t_num}]\n{content}"
                )

        context = "\n\n---\n\n".join(formatted_chunks)
        final_prompt = (
            f"{system_prompt}\n"
            f"The user you are speaking to is named: {user_name}\n\n"
            f"History: {chat_history}\n\n"
            f"Retrieved Context:\n{context}\n\n"
            f"User Query: {user_query}"
        )

        # ainvoke() — async, does not block the event loop.
        final_answer_msg = await dynamic_llm.ainvoke(final_prompt)
        return final_answer_msg.content, ticket_ids
