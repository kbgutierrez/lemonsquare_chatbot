"""Async embedding helpers for ingestion processors."""
import asyncio


class EmbeddingService:
    def __init__(self, embeddings) -> None:
        self.embeddings = embeddings

    async def embed_query(self, text: str) -> list[float]:
        return await asyncio.to_thread(self.embeddings.embed_query, text)

    async def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return await asyncio.to_thread(self.embeddings.embed_documents, texts)
