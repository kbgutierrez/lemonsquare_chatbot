"""
AI RAG Orchestrator.

Implements the Retrieve-Augment-Generate pipeline:
  1. Query Reformulation  — LLM rewrites vague queries for better retrieval.
  2. Federated Vector Search — Separate Qdrant queries for tickets vs documents.
  3. Cross-Encoder Reranking — Rerank combined results by semantic relevance.
  4. Slot Allocation — Select top results with a budget.
  5. Answer Generation — LLM generates a final answer from context.

CRITICAL FIXES vs original:
  A. No module-level instantiation.
  B. Async correctness.
  C. DB session via parameter, not self-created.
  D. Fixed doc_type filtering to actually match ingested vectors.
  E. Prevented debug_orchestrate from double-billing the LLM.
  F. Bound TopK_Tickets and ConfidenceThreshold settings.
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
from app.core.metadata_contract import (
    DOC_TYPE_CANONICAL_TICKET,
    DOC_TYPE_GENERAL_TEXT,
    DOC_TYPE_OFFICIAL_DOCUMENT,
    DOC_TYPE_RESOLVED_CHAT,
)

from app.core.retrieval_models import RetrievalDocument

logger = logging.getLogger(__name__)

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

    Instantiated once during app startup and reused for every request.
    """

    def __init__(
        self,
        db: Session,
        embed_model: str | None = None,
        reranker_model: str | None = None,
    ) -> None:
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
            timeout=settings.QDRANT_TIMEOUT,
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
        """
        Debug version that returns detailed pipeline information without double-running.
        """
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
        
        top_k = active_config.TopK_Tickets if active_config and active_config.TopK_Tickets else 5
        
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
        
        # Enforce sane confidence defaults if set to bypass (-2.0)
        db_threshold = float(active_config.ConfidenceThreshold) if active_config and active_config.ConfidenceThreshold is not None else None
        if db_threshold is None or db_threshold <= -2.0:
            confidence_threshold = 0.0 if use_reranker else 0.7 
        else:
            confidence_threshold = db_threshold
            
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
            raw_output = await reformulator_llm.ainvoke(rewrite_prompt)
            search_query = raw_output.content.strip(' "\'\n')

        # ── 3. Vector Search (CPU-bound — run in thread) ──────────────────
        query_vector = await asyncio.to_thread(
            self.embeddings.embed_query, search_query
        )

        # Ticket Bucket: raw tickets (exact lookup) + canonical clusters (semantic) & resolved chats
        ticket_response = self.qdrant.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=qdrant_models.Filter(
                must=[
                    qdrant_models.FieldCondition(
                        key="metadata.doc_type",
                        match=qdrant_models.MatchAny(
                            any=[
                                "raw_ticket",
                                DOC_TYPE_CANONICAL_TICKET,
                                DOC_TYPE_RESOLVED_CHAT,
                            ]
                        ),
                    )
                ]
            ),
            with_payload=True,
            limit=top_k,
        )
        
        # Doc Bucket: PDFs & Manual Rules
        doc_response = self.qdrant.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=qdrant_models.Filter(
                must=[
                    qdrant_models.FieldCondition(
                        key="metadata.doc_type",
                        match=qdrant_models.MatchAny(
                            any=[
                                DOC_TYPE_OFFICIAL_DOCUMENT,
                                DOC_TYPE_GENERAL_TEXT,
                            ]
                        ),
                    )
                ]
            ),
            with_payload=True,
            limit=top_k,
        )

        combined_results = ticket_response.points + doc_response.points
        retrieval_docs = [
            RetrievalDocument.from_qdrant(hit)
            for hit in combined_results
        ]
        
        if not combined_results:
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

        # ── 4. Reranking (CPU-bound — run in thread) ──────────────────────
        if use_reranker:
            pairs = [
                [search_query, doc.page_content]
                for doc in retrieval_docs
            ]
            scores = await asyncio.to_thread(self.reranker.predict, pairs)
            scored_results = sorted(
                zip(scores, retrieval_docs),
                key=lambda x: x[0],
                reverse=True,
            )
        else:
            scored_results = sorted(
                [(doc.score, doc) for doc in retrieval_docs],
                key=lambda x: x[0],
                reverse=True,
            )

        # ── 5. Observability Logging ──────────────────────────────────────
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

        # ── 6. Confidence Filtering & Slot Allocation ─────────────────────
        valid_hits = [
            doc
            for score, doc in scored_results
            if score > confidence_threshold
        ]
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

        # Dynamic budget based on top_k
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

        # Fallback: fill any remaining slots with whatever is available.
        if len(final_hits) < top_k:
            for hit in valid_hits:
                if hit not in final_hits:
                    final_hits.append(hit)
                if len(final_hits) == top_k:
                    break

        ticket_ids = []

        # ── 7. Context Formatting & Generation ────────────────────────────
        formatted_chunks = [
            hit.format_for_prompt()
            for hit in final_hits
        ]

        context = "\n\n---\n\n".join(formatted_chunks)
        final_prompt = (
            f"{system_prompt}\n"
            f"The user you are speaking to is named: {user_name}\n\n"
            f"History: {chat_history}\n\n"
            f"Retrieved Context:\n{context}\n\n"
            f"User Query: {user_query}"
        )

        final_answer_msg = await dynamic_llm.ainvoke(final_prompt)
        
        if debug:
            debug_retrieval = []
            for hit in final_hits:
                debug_retrieval.append(
                    {
                        "score": hit.score,
                        "type": hit.doc_type,
                        "source": hit.source_name,
                        "content": hit.page_content,
                    }
                )
            
            return {
                "original_query": user_query,
                "reformulated_query": search_query,
                "retrieval_results": debug_retrieval,
                "final_answer": final_answer_msg.content,
                "ticket_ids_used": ticket_ids,
            }

        return final_answer_msg.content, ticket_ids