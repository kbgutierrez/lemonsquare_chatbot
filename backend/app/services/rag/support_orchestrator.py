"""
AI RAG Orchestrator — REFACTORED.
Now delegates to focused pipeline components:
  QueryReformulator → VectorStoreService → RerankerService → AnswerGenerator
Previously a 350-line monolith with all logic inlined.
"""
import asyncio
import logging
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
        user_query: str,
        chat_history: str,
        user_name: str,
        db: Session,
    ) -> tuple[str, list[int]]:
        """Run the full RAG pipeline. Returns (answer, ticket_ids)."""
        try:
            return await self._run_pipeline(user_query, chat_history, user_name, db, debug=False)
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
        """Debug version with detailed pipeline info."""
        try:
            return await self._run_pipeline(user_query, chat_history, user_name, db, debug=True)
        except Exception as exc:
            logger.error("Orchestrator debug pipeline failed: %s", exc, exc_info=True)
            raise AIProcessingError(f"AI debug pipeline error: {exc}") from exc

    async def _run_pipeline(
        self,
        user_query: str,
        chat_history: str,
        user_name: str,
        db: Session,
        debug: bool = False,
    ):
        # ── 1. Load Dynamic Settings ──────────────────────────────
        settings_repo = SettingsRepository(db)
        config = settings_repo.get_active_settings()

        use_reformulator = bool(config.UseReformulator if config and config.UseReformulator is not None else True)
        use_reranker = bool(config.UseReranker if config and config.UseReranker is not None else True)
        top_k = config.TopK_Tickets if config and config.TopK_Tickets else 5
        main_model = config.ActiveModel if config else _DEFAULT_MAIN_MODEL
        reformulator_model = config.ReformulatorModel if config and config.ReformulatorModel else _DEFAULT_REFORMULATOR_MODEL
        temperature = float(config.Temperature) if config else 0.2
        system_prompt = config.SystemPrompt if config else "You are an IT Support Agent."

        db_threshold = float(config.ConfidenceThreshold) if config and config.ConfidenceThreshold is not None else None
        if db_threshold is None or db_threshold <= -2.0:
            confidence_threshold = 0.0 if use_reranker else 0.7
        else:
            confidence_threshold = db_threshold

        reformulator_prompt = config.ReformulatorPrompt if config and config.ReformulatorPrompt else None

        # ── 2. Query Reformulation ────────────────────────────────
        search_query = user_query
        if use_reformulator:
            search_query = await self.reformulator.reformulate(
                user_query=user_query,
                chat_history=chat_history,
                model=reformulator_model,
                prompt_template=reformulator_prompt,
            )

        # ── 3. Vector Search (CPU-bound --- run in thread) ─────────
        query_vector = await asyncio.to_thread(self.embeddings.embed_query, search_query)
        raw_results = self.vector_store.federated_search(query_vector, limit=top_k)

        retrieval_docs = [RetrievalDocument.from_qdrant(hit) for hit in raw_results]

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
            return fallback_msg, []

        # ── 4. Reranking ──────────────────────────────────────────
        if use_reranker:
            scored_results = self.reranker.rerank(search_query, retrieval_docs)
        else:
            scored_results = sorted(
                [(doc.score, doc) for doc in retrieval_docs],
                key=lambda x: x[0],
                reverse=True,
            )

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

        if not valid_hits:
            fallback_msg = "I'm sorry, that doesn't match any IT issues or solutions in my knowledge base."
            if debug:
                return {
                    "original_query": user_query,
                    "reformulated_query": search_query,
                    "retrieval_results": [],
                    "final_answer": fallback_msg,
                    "ticket_ids_used": [],
                }
            return fallback_msg, []

        doc_budget = max(2, int(top_k * 0.4))
        ticket_budget = top_k - doc_budget
        final_hits: list = []
        tickets_added = 0
        docs_added = 0

        for hit in valid_hits:
            is_doc = hit.is_document
            if not is_doc and tickets_added < ticket_budget:
                final_hits.append(hit)
                tickets_added += 1
            elif is_doc and docs_added < doc_budget:
                final_hits.append(hit)
                docs_added += 1
            if len(final_hits) == top_k:
                break

        if len(final_hits) < top_k:
            for hit in valid_hits:
                if hit not in final_hits:
                    final_hits.append(hit)
                    if len(final_hits) == top_k:
                        break

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

        return answer, ticket_ids
