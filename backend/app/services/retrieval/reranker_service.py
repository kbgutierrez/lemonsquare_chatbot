"""
Reranking service using cross-encoder.
Extracted from SupportOrchestrator._run_pipeline().
"""
import logging
import math
from sentence_transformers import CrossEncoder
from app.core.retrieval_models import RetrievalDocument

logger = logging.getLogger(__name__)


class RerankerService:
    """Cross-encoder reranking for retrieval results."""

    def __init__(self, model_name: str):
        self.reranker = CrossEncoder(model_name)

    def rerank(
        self,
        query: str,
        documents: list[RetrievalDocument],
    ) -> list[tuple[float, RetrievalDocument]]:
        """
        Rerank documents by relevance to the query.

        Returns:
            List of (score, document) tuples sorted by score descending.
        """
        if not documents:
            return []

        pairs = [[query, doc.page_content] for doc in documents]
        
        # 1. Get raw logits from the cross-encoder
        raw_scores = self.reranker.predict(pairs)
        
        # 2. Apply Sigmoid to convert logits to 0.0 - 1.0 probabilities.
        # This ensures our confidence thresholds in the orchestrator work correctly.
        scores = [1 / (1 + math.exp(-score)) for score in raw_scores]

        scored = sorted(
            zip(scores, documents),
            key=lambda x: x[0],
            reverse=True,
        )
        # Attach reranker scores to documents
        for score, doc in scored:
            doc.score = float(score)
        return scored
