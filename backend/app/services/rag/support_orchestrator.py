"""
AI RAG Orchestrator — REFACTORED.
Now delegates to focused pipeline components:
  QueryReformulator → VectorStoreService → RerankerService → AnswerGenerator
Previously a 350-line monolith with all logic inlined.
"""
import asyncio
import logging
import time
from typing import Any
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.exceptions import AIProcessingError
from app.core.retrieval_models import RetrievalDocument
from app.repositories.settings_repository import SettingsRepository
from app.services.rag.query_reformulator import QueryReformulator
from app.services.retrieval.embedding_provider import get_embedding_model
from app.services.retrieval.vector_store import get_shared_vector_store
from app.services.retrieval.reranker_service import RerankerService
from app.services.rag.answer_generator import AnswerGenerator
from app.services.prompts import DEFAULT_SYSTEM_PROMPT
from app.utils.json_utils import safe_json_loads

logger = logging.getLogger(__name__)

_DEFAULT_MAIN_MODEL = "llama-3.3-70b-versatile"
_DEFAULT_REFORMULATOR_MODEL = "llama-3.1-8b-instant"


class SupportOrchestrator:
    """
    Composes the full RAG pipeline from focused sub-components.
    Instantiated once during app startup and reused per request.
    """

    def __init__(
        self,
        db: Session,
        embed_model: str | None = None,
        reranker_model: str | None = None,
    ) -> None:
        logger.info("Initializing AI Orchestrator --- loading models...")

        settings_repo = SettingsRepository(db)
        active_config = settings_repo.get_active_settings()

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

        self.vector_store = get_shared_vector_store()
        self.embeddings = get_embedding_model(resolved_embed)
        self.reranker = RerankerService(resolved_reranker)
        self.reformulator = QueryReformulator()
        self.answer_generator = AnswerGenerator()

        logger.info("AI Orchestrator ready.")

    async def orchestrate(
        self,
        session_id: str,
        user_query: str,
        chat_history: str,
        user_name: str,
        db: Session,
    ) -> tuple[str, str, str | None, list[int], dict[str, Any] | None]:
        """Run the full RAG pipeline. Returns (display_text, action, resolution_message, ticket_ids, debug_info)."""
        try:
            return await self._run_pipeline(session_id, user_query, chat_history, user_name, db, debug=False)
        except Exception as exc:
            logger.error("Orchestrator pipeline failed: %s", exc, exc_info=True)
            raise AIProcessingError(f"AI pipeline error: {exc}") from exc

    async def debug_orchestrate(
        self,
        session_id: str,
        user_query: str,
        chat_history: str,
        user_name: str,
        db: Session,
        limit: int | None = None,
    ) -> dict:
        """Debug version with detailed pipeline info."""
        try:
            return await self._run_pipeline(
                session_id,
                user_query,
                chat_history,
                user_name,
                db,
                debug=True,
                limit=limit,
            )
        except Exception as exc:
            logger.error("Orchestrator debug pipeline failed: %s", exc, exc_info=True)
            raise AIProcessingError(f"AI debug pipeline error: {exc}") from exc

    async def _run_pipeline(
        self,
        session_id: str,
        user_query: str,
        chat_history: str,
        user_name: str,
        db: Session,
        debug: bool = False,
        limit: int | None = None,
    ):
        # ── 1. Interview State Interceptor ───────────────────────
        from app.models.chatbot import ChatSession
        from app.services.chat.escalation_service import EscalationService

        if session_id:
            session = await asyncio.to_thread(
                lambda: db.query(ChatSession)
                .filter(ChatSession.SessionID == session_id)
                .first()
            )
            if session and session.SessionStatus == "Drafting_Ticket":
                logger.info("Chat intercepted: User is currently in Drafting_Ticket state.")

                draft_result = await EscalationService(db).draft_escalation(session_id)

                if draft_result.get("status") == "needs_info":
                    return draft_result.get("pushback_message", ""), "none", None, [], None

                return (
                    "I will now create your ticket draft for review...",
                    "open_draft",
                    None,
                    [],
                    None,
                )

        # ── 2. Load Dynamic Settings ──────────────────────────────
        normalized_query = user_query.lower().strip()
        settings_repo = SettingsRepository(db)
        config = settings_repo.get_active_settings()

        debug_info: dict[str, Any] = {
            "original_query": user_query,
            "chat_history": chat_history,
            "use_reformulator": bool(config.UseReformulator if config and config.UseReformulator is not None else True),
            "use_reranker": bool(config.UseReranker if config and config.UseReranker is not None else False),
            "top_k": None,
            "confidence_threshold": None,
            "reformulated_query": None,
            "retrieval_count": 0,
            "valid_hit_count": 0,
            "retrieved_documents": [],
            "final_hits": [],
        }

        use_reformulator = bool(config.UseReformulator if config and config.UseReformulator is not None else True)
        use_reranker = bool(config.UseReranker if config and config.UseReranker is not None else False)
        top_k = limit or (config.TopK_Tickets if config and config.TopK_Tickets else 5)
        top_k = max(1, min(int(top_k), 20))
        main_model = config.ActiveModel if config else _DEFAULT_MAIN_MODEL
        reformulator_model = config.ReformulatorModel if config and config.ReformulatorModel else _DEFAULT_REFORMULATOR_MODEL
        temperature = float(config.Temperature) if config else 0.2
        system_prompt = config.SystemPrompt if config else DEFAULT_SYSTEM_PROMPT

        db_threshold = float(config.ConfidenceThreshold) if config and config.ConfidenceThreshold is not None else None
        if db_threshold is None or db_threshold <= -2.0:
            # 0.15 is a safe probability threshold for Sigmoid-normalized reranker scores.
            confidence_threshold = 0.15 if use_reranker else 0.7
        else:
            confidence_threshold = db_threshold

        reformulator_prompt = config.ReformulatorPrompt if config and config.ReformulatorPrompt else None

        # ── 2. Query Reformulation ────────────────────────────────
        search_query = user_query
        if use_reformulator:
            try:
                search_query = await self.reformulator.reformulate(
                    user_query=user_query,
                    chat_history=chat_history,
                    model=reformulator_model,
                    prompt_template=reformulator_prompt,
                )
                
                logger.debug(
                    "Reformulated query original=%r reformulated=%r",
                    user_query,
                    search_query,
                )

            except Exception as exc:
                logger.warning("Reformulator failed; using original query. Error: %s", exc)
                search_query = user_query
        debug_info["reformulated_query"] = search_query

        # ── 3. Vector Search (CPU-bound --- run in thread) ─────────
        started = time.perf_counter()
        query_vector = await asyncio.to_thread(self.embeddings.embed_query, search_query)
        logger.info(
            "embedding.latency_ms=%d session_id=%s",
            int((time.perf_counter() - started) * 1000),
            session_id,
        )

        started = time.perf_counter()
        raw_results = await self.vector_store.federated_search_async(query_vector, limit=top_k)
        logger.info(
            "retrieval.federated_latency_ms=%d session_id=%s result_count=%d",
            int((time.perf_counter() - started) * 1000),
            session_id,
            len(raw_results),
        )

        retrieval_docs = [RetrievalDocument.from_qdrant(hit) for hit in raw_results]
        debug_info["retrieval_count"] = len(retrieval_docs)

        if not retrieval_docs:
            fallback_msg = "I couldn't find any related tickets or documents in the knowledge base."
            if debug:
                return {
                    "original_query": user_query,
                    "reformulated_query": search_query,
                    "retrieval_results": [],
                    "final_answer": fallback_msg,
                    "ticket_ids_used": [],
                }
            debug_info["final_answer"] = fallback_msg
            return fallback_msg, "none", None, [], debug_info

        # ── 4. Reranking ──────────────────────────────────────────
        if use_reranker:
            started = time.perf_counter()
            scored_results = await asyncio.to_thread(self.reranker.rerank, search_query, retrieval_docs)
            logger.info(
                "reranker.latency_ms=%d session_id=%s result_count=%d",
                int((time.perf_counter() - started) * 1000),
                session_id,
                len(scored_results),
            )
        else:
            scored_results = sorted(
                [(doc.score, doc) for doc in retrieval_docs],
                key=lambda x: x[0],
                reverse=True,
            )

        def summarize_doc(doc: RetrievalDocument) -> dict[str, Any]:
            return {
                "score": doc.score,
                "type": doc.doc_type,
                "source": doc.source_name,
                "snippet": (doc.page_content or "")[:180].replace("\n", " ").strip(),
            }

        debug_info["retrieved_documents"] = [summarize_doc(doc) for doc in retrieval_docs]

        # ── 5. Observability Logging ──────────────────────────────
        logger.debug("Original query : %s", user_query)
        logger.debug("Search query   : %s", search_query)
        for score, doc in scored_results:
            passed = score > confidence_threshold
            logger.debug(
                "%s | score=%.3f | source=%s | type=%s",
                "PASS" if passed else "BLOCKED",
                score,
                doc.source_name,
                doc.doc_type,
            )

        # ── 6. Confidence Filtering & Slot Allocation ─────────────
        valid_hits = [doc for score, doc in scored_results if score > confidence_threshold]
        debug_info["valid_hit_count"] = len(valid_hits)
        debug_info["confidence_threshold"] = confidence_threshold

        # Survival of the Fittest: Just take the absolute best items up to top_k, 
        # regardless of whether they are docs or tickets. This preserves the LLM's
        # ability to answer simple acknowledgments or greetings even when no
        # relevant documents were found.
        final_hits = valid_hits[:top_k]
        debug_info["final_hits"] = [summarize_doc(hit) for hit in final_hits]

        ticket_ids = []
        for hit in final_hits:
            raw_id = hit.metadata.get("evaluation_id") or hit.metadata.get("ticket_id")
            if raw_id is None:
                raw_id = hit.metadata.get("ticket_number")
            try:
                if raw_id is not None:
                    ticket_ids.append(int(raw_id))
            except (TypeError, ValueError):
                logger.debug("Skipping non-numeric ticket id from retrieval metadata: %s", raw_id)

        # ── 7. Answer Generation ──────────────────────────────────
        answer = await self.answer_generator.generate(
            user_query=user_query,
            chat_history=chat_history,
            user_name=user_name,
            documents=final_hits,
            system_prompt=system_prompt,
            model=main_model,
            temperature=temperature,
        )
        if debug:
            debug_retrieval = []
            for hit in final_hits:
                debug_retrieval.append({
                    "score": hit.score,
                    "type": hit.doc_type,
                    "source": hit.source_name,
                    "content": hit.page_content,
                })
            return {
                "original_query": user_query,
                "reformulated_query": search_query,
                "retrieval_results": debug_retrieval,
                "final_answer": answer,
                "ticket_ids_used": ticket_ids,
            }

        debug_info["final_answer"] = answer

        # Try to parse the final answer as the new JSON schema. If the LLM
        # followed instructions, we'll get a dict with `response`, `action`,
        # and `resolution_message`. Otherwise fall back to the plain text
        # answer and use a 'none' action.
        parsed = safe_json_loads(answer, context="final_answer")

        if isinstance(parsed, dict) and parsed.get("response"):
            display_text = str(parsed.get("response") or "")
            action = str(parsed.get("action") or "none").strip().lower()
            resolution_message = parsed.get("resolution_message")
        else:
            display_text = answer
            action = "none"
            resolution_message = None

        return display_text, action, resolution_message, ticket_ids, debug_info
