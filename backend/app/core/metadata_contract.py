"""
Canonical metadata and payload contracts.
Single source of truth for Qdrant payload schemas, metadata normalization,
doc type constants, knowledge type constants, and payload builders.
"""
from __future__ import annotations
from typing import Any

# =========================================================
# DOC TYPES
# =========================================================
DOC_TYPE_RAW_TICKET = "raw_ticket"
DOC_TYPE_CANONICAL_TICKET = "canonical_ticket_cluster"
DOC_TYPE_RESOLVED_CHAT = "resolved_chat"
DOC_TYPE_OFFICIAL_DOCUMENT = "official_document"
DOC_TYPE_GENERAL_TEXT = "general_text"

DOCUMENT_DOC_TYPES = {
    DOC_TYPE_OFFICIAL_DOCUMENT,
    DOC_TYPE_GENERAL_TEXT,
}

TICKET_LIKE_DOC_TYPES = {
    DOC_TYPE_RAW_TICKET,
    DOC_TYPE_CANONICAL_TICKET,
    DOC_TYPE_RESOLVED_CHAT,
}

# =========================================================
# KNOWLEDGE TYPES
# =========================================================
KNOWLEDGE_TYPE_TICKET = "ticket"
KNOWLEDGE_TYPE_CHAT = "chat"
KNOWLEDGE_TYPE_MANUAL = "manual"
KNOWLEDGE_TYPE_PDF = "pdf"

# =========================================================
# HELPERS
# =========================================================
def normalize_metadata(metadata: dict | None) -> dict:
    if not isinstance(metadata, dict):
        return {}
    normalized = dict(metadata)
    normalized.setdefault("doc_type", "unknown")
    normalized.setdefault("knowledge_type", "unknown")
    normalized.setdefault("cluster_key", "")
    normalized.setdefault("source_id", "")
    normalized.setdefault("source_ids", [])
    normalized.setdefault("source_types", [])
    normalized.setdefault("frequency", 1)
    normalized.setdefault("is_active", True)
    return normalized


def build_qdrant_payload(*, page_content: str, metadata: dict) -> dict:
    return {
        "page_content": page_content,
        "metadata": normalize_metadata(metadata),
    }


# =========================================================
# METADATA BUILDERS
# =========================================================
def build_ticket_metadata(*, cluster_key: str, ticket_number: str) -> dict:
    return normalize_metadata({
        "doc_type": DOC_TYPE_CANONICAL_TICKET,
        "knowledge_type": KNOWLEDGE_TYPE_TICKET,
        "cluster_key": cluster_key,
        "source_id": ticket_number,
        "source_ids": [ticket_number],
        "ticket_number": ticket_number,
        "frequency": 1,
    })


def build_chat_metadata(*, cluster_key: str, session_id: str) -> dict:
    return normalize_metadata({
        "doc_type": DOC_TYPE_RESOLVED_CHAT,
        "knowledge_type": KNOWLEDGE_TYPE_CHAT,
        "cluster_key": cluster_key,
        "source_id": session_id,
        "source_ids": [session_id],
        "session_id": session_id,
        "frequency": 1,
    })


def build_manual_metadata(*, cluster_key: str, entry_id: str, title: str, category: str) -> dict:
    return normalize_metadata({
        "doc_type": DOC_TYPE_GENERAL_TEXT,
        "knowledge_type": KNOWLEDGE_TYPE_MANUAL,
        "cluster_key": cluster_key,
        "source_id": entry_id,
        "source_ids": [entry_id],
        "title": title,
        "category": category,
        "source": title,
        "frequency": 1,
    })


def build_pdf_metadata(*, cluster_key: str, document_id: str, file_name: str, category: str, chunk_index: int) -> dict:
    return normalize_metadata({
        "doc_type": DOC_TYPE_OFFICIAL_DOCUMENT,
        "knowledge_type": KNOWLEDGE_TYPE_PDF,
        "cluster_key": cluster_key,
        "document_id": document_id,
        "source_id": document_id,
        "source_ids": [document_id],
        "source": file_name,
        "file_name": file_name,
        "category": category,
        "chunk_index": chunk_index,
        "frequency": 1,
    })
