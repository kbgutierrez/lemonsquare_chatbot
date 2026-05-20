"""
AI RAG Orchestrator.

Enterprise-grade RAG pipeline for IT support:
  1. Multi-query reformulation
  2. Federated retrieval
  3. Reciprocal Rank Fusion (RRF)
  4. CrossEncoder reranking
  5. Sigmoid score normalization
  6. Confidence filtering
  7. Ticket-prioritized slot allocation
  8. Context generation

Key Improvements:
- raw_ticket retrieval support
- multilingual retrieval optimization
- safe sigmoid normalization
- greeting/low-signal bypass
- no Qdrant object mutation
- stable debug observability
- ticket-first retrieval balancing
"""

import asyncio
import json
import logging
import math

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

_DEFAULT_MAIN_MODEL = "llama-3.3-70b-versatile"
_DEFAULT_REFORMULATOR_MODEL = "llama-3.1-8b-instant"

_DEFAULT_REFORMULATOR_PROMPT = (
    "You are an expert IT Helpdesk search assistant. "
    "Read the chat history and the user's latest message.\n"
    "Generate exactly THREE search query variations.\n"
    "Use English, Tagalog, and Taglish naturally.\n\n"
    "Rules:\n"
    "- Query 1: exact technical issue\n"
    "- Query 2: natural Tagalog/Taglish phrasing\n"
    "- Query 3: broader semantic intent\n\n"
    "Output ONLY a valid JSON array.\n\n"
    "History: {chat_history}\n"
    "Latest Message: {user_query}\n"
    "JSON Output:"
)

LOW_SIGNAL_QUERIES = {
    "hi",
    "hello",
    "hey",
    "thanks",
    "thank you",
    "ok",
    "okay",
    "yo",
    "sup",
    "good morning",
    "good afternoon",
    "good evening",
}


def sigmoid(x: float) -> float:
    """
    Numerically stable sigmoid normalization.
    Converts logits into 0.0 → 1.0 probabilities.
    """

    if x >= 0:
        z = math.exp(-x)
        return 1 / (1 + z)

    z = math.exp(x)
    return z / (1 + z)


class SupportOrchestrator:
    """
    Enterprise RAG orchestrator.
    """

    def __init__(
        self,
        db: Session,
        embed_model: str | None = None,
        reranker_model: str | None = None,
    ) -> None:

        logger.info("Initializing AI Orchestrator...")

        active_config = (
            db.query(AIChatbotSetting)
            .filter(AIChatbotSetting.IsActive == True)
            .order_by(AIChatbotSetting.SettingID.desc())
            .first()
        )

        resolved_embed = (
            embed_model
            or (
                active_config.EmbeddingModel
                if active_config and active_config.EmbeddingModel
                else None
            )
            or settings.EMBEDDING_MODEL
        )

        resolved_reranker = (
            reranker_model
            or (
                active_config.RerankerModel
                if active_config and active_config.RerankerModel
                else None
            )
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

        self.embeddings = HuggingFaceEmbeddings(
            model_name=resolved_embed
        )

        self.reranker = CrossEncoder(
            resolved_reranker
        )

        logger.info("AI Orchestrator ready.")

    @staticmethod
    def _reciprocal_rank_fusion(
        results_lists: list[list],
        k: int = 60,
    ) -> list[dict]:

        fused_scores = {}
        doc_map = {}
        max_qdrant_scores = {}

        for results in results_lists:

            for rank, hit in enumerate(results, start=1):

                uid = str(hit.id)

                if uid not in fused_scores:
                    fused_scores[uid] = 0.0
                    doc_map[uid] = hit
                    max_qdrant_scores[uid] = getattr(
                        hit,
                        "score",
                        0.0,
                    )

                else:
                    current_score = getattr(
                        hit,
                        "score",
                        0.0,
                    )

                    if current_score > max_qdrant_scores[uid]:
                        max_qdrant_scores[uid] = current_score

                fused_scores[uid] += 1.0 / (rank + k)

        sorted_uids = sorted(
            fused_scores.keys(),
            key=lambda x: fused_scores[x],
            reverse=True,
        )

        fused_docs = []

        for uid in sorted_uids:

            fused_docs.append(
                {
                    "hit": doc_map[uid],
                    "qdrant_score": max_qdrant_scores[uid],
                    "rrf_score": fused_scores[uid],
                }
            )

        return fused_docs

    async def orchestrate(
        self,
        user_query: str,
        chat_history: str,
        user_name: str,
        db: Session,
    ) -> tuple[str, list[int]]:

        try:
            return await self._run_pipeline(
                user_query,
                chat_history,
                user_name,
                db,
                debug=False,
            )

        except Exception as exc:

            logger.error(
                "Orchestrator pipeline failed: %s",
                exc,
                exc_info=True,
            )

            raise AIProcessingError(
                f"AI pipeline error: {exc}"
            ) from exc

    async def debug_orchestrate(
        self,
        user_query: str,
        chat_history: str,
        user_name: str,
        db: Session,
    ) -> dict:

        try:
            return await self._run_pipeline(
                user_query,
                chat_history,
                user_name,
                db,
                debug=True,
            )

        except Exception as exc:

            logger.error(
                "Orchestrator debug pipeline failed: %s",
                exc,
                exc_info=True,
            )

            raise AIProcessingError(
                f"AI debug pipeline error: {exc}"
            ) from exc

    async def _run_pipeline(
        self,
        user_query: str,
        chat_history: str,
        user_name: str,
        db: Session,
        debug: bool = False,
    ):

        # =====================================================
        # LOW SIGNAL BYPASS
        # =====================================================

        normalized_query = user_query.lower().strip()

        if normalized_query in LOW_SIGNAL_QUERIES:

            greeting_response = (
                "Hello! How can I help you "
                "with your IT issue today?"
            )

            if debug:
                return {
                    "original_query": user_query,
                    "reformulated_query": [],
                    "retrieval_results": [],
                    "final_answer": greeting_response,
                    "ticket_ids_used": [],
                }

            return greeting_response, []

        # =====================================================
        # LOAD SETTINGS
        # =====================================================

        active_config = (
            db.query(AIChatbotSetting)
            .filter(AIChatbotSetting.IsActive == True)
            .order_by(AIChatbotSetting.SettingID.desc())
            .first()
        )

        use_reformulator = bool(
            active_config.UseReformulator
            if active_config
            and active_config.UseReformulator is not None
            else True
        )

        use_reranker = bool(
            active_config.UseReranker
            if active_config
            and active_config.UseReranker is not None
            else True
        )

        top_k = (
            active_config.TopK_Tickets
            if active_config
            and active_config.TopK_Tickets
            else 8
        )

        main_model = (
            active_config.ActiveModel
            if active_config
            else _DEFAULT_MAIN_MODEL
        )

        reformulator_model = (
            active_config.ReformulatorModel
            if active_config
            and active_config.ReformulatorModel
            else _DEFAULT_REFORMULATOR_MODEL
        )

        temperature = (
            float(active_config.Temperature)
            if active_config
            else 0.2
        )

        system_prompt = (
            active_config.SystemPrompt
            if active_config
            else "You are an IT Support Agent."
        )

        db_threshold = (
            float(active_config.ConfidenceThreshold)
            if active_config
            and active_config.ConfidenceThreshold is not None
            else 0.30
        )

        confidence_threshold = max(
            0.05,
            min(db_threshold, 0.95),
        )

        db_prompt = (
            active_config.ReformulatorPrompt
            if active_config
            else None
        )

        if db_prompt and "JSON array" in db_prompt:
            reformulator_prompt_template = db_prompt
        else:
            reformulator_prompt_template = (
                _DEFAULT_REFORMULATOR_PROMPT
            )

        dynamic_llm = ChatGroq(
            model=main_model,
            temperature=temperature,
            api_key=settings.GROQ_API_KEY,
        )

        # =====================================================
        # MULTI QUERY REFORMULATION
        # =====================================================

        search_queries = [user_query]

        if use_reformulator:

            reformulator_llm = ChatGroq(
                model=reformulator_model,
                temperature=0.0,
                api_key=settings.GROQ_API_KEY,
            )

            safe_history = (
                chat_history.strip()
                or "No previous history."
            )

            rewrite_prompt = (
                reformulator_prompt_template
                .replace("{chat_history}", safe_history)
                .replace("{user_query}", user_query)
            )

            raw_output = (
                await reformulator_llm.ainvoke(
                    rewrite_prompt
                )
            ).content.strip()

            if raw_output.startswith("```json"):
                raw_output = raw_output[7:-3].strip()

            elif raw_output.startswith("```"):
                raw_output = raw_output[3:-3].strip()

            try:

                parsed_queries = json.loads(raw_output)

                if (
                    isinstance(parsed_queries, list)
                    and len(parsed_queries) > 0
                ):
                    search_queries = parsed_queries[:3]

            except Exception as exc:

                logger.error(
                    "Failed to parse reformulator JSON: %s",
                    exc,
                )

        # =====================================================
        # PARALLEL RETRIEVAL
        # =====================================================

        async def search_single_query(query: str):

            query_vector = await asyncio.to_thread(
                self.embeddings.embed_query,
                query,
            )

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
                                    "canonical_ticket_cluster",
                                    "resolved_chat",
                                ]
                            ),
                        )
                    ]
                ),
                with_payload=True,
                limit=top_k,
            )

            doc_response = self.qdrant.query_points(
                collection_name=self.collection_name,
                query=query_vector,
                query_filter=qdrant_models.Filter(
                    must=[
                        qdrant_models.FieldCondition(
                            key="metadata.doc_type",
                            match=qdrant_models.MatchAny(
                                any=[
                                    "official_document",
                                    "general_text",
                                ]
                            ),
                        )
                    ]
                ),
                with_payload=True,
                limit=top_k,
            )

            return (
                ticket_response.points
                + doc_response.points
            )

        search_tasks = [
            search_single_query(q)
            for q in search_queries
        ]

        results_lists = await asyncio.gather(
            *search_tasks
        )

        combined_results = (
            self._reciprocal_rank_fusion(
                results_lists
            )
        )

        if not combined_results:

            fallback_msg = (
                "I couldn't find any related "
                "tickets or documents in the "
                "knowledge base."
            )

            if debug:
                return {
                    "original_query": user_query,
                    "reformulated_query": search_queries,
                    "retrieval_results": [],
                    "final_answer": fallback_msg,
                    "ticket_ids_used": [],
                }

            return fallback_msg, []

        # =====================================================
        # RERANKING
        # =====================================================

        if use_reranker:

            rerank_pairs = [
                [
                    search_queries[0],
                    item["hit"].payload.get(
                        "page_content",
                        "",
                    ),
                ]
                for item in combined_results
            ]

            raw_logits = await asyncio.to_thread(
                self.reranker.predict,
                rerank_pairs,
            )

            normalized_scores = [
                sigmoid(logit)
                for logit in raw_logits
            ]

            scored_results = sorted(
                [
                    {
                        "rerank_score": float(score),
                        "raw_logit": float(raw_logit),
                        "hit": item["hit"],
                        "qdrant_score": item["qdrant_score"],
                        "rrf_score": item["rrf_score"],
                    }
                    for score, raw_logit, item in zip(
                        normalized_scores,
                        raw_logits,
                        combined_results,
                    )
                ],
                key=lambda x: x["rerank_score"],
                reverse=True,
            )

        else:

            scored_results = [
                {
                    "rerank_score": item["qdrant_score"],
                    "raw_logit": item["qdrant_score"],
                    "hit": item["hit"],
                    "qdrant_score": item["qdrant_score"],
                    "rrf_score": item["rrf_score"],
                }
                for item in combined_results
            ]

        # =====================================================
        # OBSERVABILITY LOGGING
        # =====================================================

        logger.debug(
            "Original query : %s",
            user_query,
        )

        logger.debug(
            "Search queries : %s",
            search_queries,
        )

        for item in scored_results:

            hit = item["hit"]

            meta = hit.payload.get(
                "metadata",
                {},
            )

            doc_type = meta.get(
                "doc_type",
                "unknown",
            )

            source = (
                meta.get("source", "Manual")
                if doc_type in [
                    "official_document",
                    "general_text",
                ]
                else meta.get(
                    "ticket_number",
                    "UNKNOWN",
                )
            )

            logger.debug(
                (
                    "rerank=%.4f | "
                    "logit=%.4f | "
                    "qdrant=%.4f | "
                    "rrf=%.4f | "
                    "type=%s | "
                    "source=%s"
                ),
                item["rerank_score"],
                item["raw_logit"],
                item["qdrant_score"],
                item["rrf_score"],
                doc_type,
                source,
            )

        # =====================================================
        # CONFIDENCE FILTERING
        # =====================================================

        valid_items = [
            item
            for item in scored_results
            if item["rerank_score"]
            > confidence_threshold
        ]

        if not valid_items:

            fallback_msg = (
                "I'm sorry, that doesn't match "
                "any IT issues or solutions in "
                "my knowledge base."
            )

            if debug:
                return {
                    "original_query": user_query,
                    "reformulated_query": search_queries,
                    "retrieval_results": [],
                    "final_answer": fallback_msg,
                    "ticket_ids_used": [],
                }

            return fallback_msg, []

        # =====================================================
        # SLOT ALLOCATION
        # =====================================================

        doc_budget = 1 if top_k > 1 else 0
        ticket_budget = top_k - doc_budget

        final_items = []

        tickets_added = 0
        docs_added = 0

        for item in valid_items:

            hit = item["hit"]

            doc_type = (
                hit.payload.get("metadata", {})
                .get("doc_type", "ticket")
            )

            is_doc = doc_type in [
                "official_document",
                "general_text",
            ]

            if (
                not is_doc
                and tickets_added < ticket_budget
            ):
                final_items.append(item)
                tickets_added += 1

            elif (
                is_doc
                and docs_added < doc_budget
            ):
                final_items.append(item)
                docs_added += 1

            if len(final_items) == top_k:
                break

        # =====================================================
        # FALLBACK FILLER
        # =====================================================

        if len(final_items) < top_k:

            for item in valid_items:

                if item not in final_items:
                    final_items.append(item)

                if len(final_items) == top_k:
                    break

        # =====================================================
        # TICKET IDS
        # =====================================================

        ticket_ids = [
            item["hit"].payload.get(
                "metadata",
                {},
            ).get("evaluation_id")
            for item in final_items
            if (
                item["hit"].payload.get(
                    "metadata",
                    {},
                ).get("evaluation_id")
                is not None
            )
        ]

        # =====================================================
        # CONTEXT BUILDING
        # =====================================================

        formatted_chunks = []

        for item in final_items:

            hit = item["hit"]

            meta = hit.payload.get(
                "metadata",
                {},
            )

            doc_type = meta.get(
                "doc_type",
                "ticket",
            )

            content = hit.payload.get(
                "page_content",
                "",
            )

            if doc_type in [
                "official_document",
                "general_text",
            ]:

                source_name = meta.get(
                    "source",
                    "Manual",
                )

                category = meta.get(
                    "category",
                    "General",
                )

                formatted_chunks.append(
                    (
                        f"[SOURCE: OFFICIAL DOCUMENT — "
                        f"{source_name} | "
                        f"CATEGORY: {category}]\n"
                        f"{content}"
                    )
                )

            else:

                ticket_number = meta.get(
                    "ticket_number",
                    "UNKNOWN",
                )

                formatted_chunks.append(
                    (
                        f"[SOURCE: RESOLVED TICKET — "
                        f"{ticket_number}]\n"
                        f"{content}"
                    )
                )

        context = "\n\n---\n\n".join(
            formatted_chunks
        )

        final_prompt = (
            f"{system_prompt}\n"
            f"The user you are speaking to is named: "
            f"{user_name}\n\n"
            f"History: {chat_history}\n\n"
            f"Retrieved Context:\n{context}\n\n"
            f"User Query: {user_query}"
        )

        final_answer_msg = await dynamic_llm.ainvoke(
            final_prompt
        )

        # =====================================================
        # DEBUG OUTPUT
        # =====================================================

        if debug:

            debug_retrieval = []

            for item in final_items:

                hit = item["hit"]

                meta = hit.payload.get(
                    "metadata",
                    {},
                )

                doc_type = meta.get(
                    "doc_type",
                    "unknown",
                )

                debug_retrieval.append(
                    {
                        "score": float(item["rerank_score"]),
                        "raw_logit": float(item["raw_logit"]),
                        "qdrant_score": float(item["qdrant_score"]),
                        "rrf_score": float(item["rrf_score"]),
                        "type": doc_type,
                        "source": (
                            meta.get(
                                "source",
                                "Manual",
                            )
                            if doc_type in [
                                "official_document",
                                "general_text",
                            ]
                            else meta.get(
                                "ticket_number",
                                "UNKNOWN",
                            )
                        ),
                        "content": hit.payload.get(
                            "page_content",
                            "",
                        ),
                    }
                )

            return {
                "original_query": user_query,
                "reformulated_query": search_queries,
                "retrieval_results": debug_retrieval,
                "final_answer": final_answer_msg.content,
                "ticket_ids_used": ticket_ids,
            }

        return (
            final_answer_msg.content,
            ticket_ids,
        )