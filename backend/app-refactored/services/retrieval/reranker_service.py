"""
Reranking service using cross-encoder.
Extracted from SupportOrchestrator._run_pipeline().
"""
import logging
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
        scores = self.reranker.predict(pairs)

        scored = sorted(
            zip(scores, documents),
            key=lambda x: x[0],
            reverse=True,
        )
        # Attach reranker scores to documents
        for score, doc in scored:
            doc.score = float(score)
        return scored
