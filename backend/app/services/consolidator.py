from __future__ import annotations

import hashlib
import re
import uuid
from dataclasses import dataclass
from typing import Any

from qdrant_client.http.models import PointStruct


def _norm(value: Any) -> str:
    if value is None:
        return ""
    text = str(value).strip().lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def _stable_text(value: Any) -> str:
    if value is None:
        return "None"
    text = str(value).strip()
    return text if text else "None"


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


@dataclass
class CanonicalRecord:
    cluster_key: str
    point_id: str
    page_content: str
    metadata: dict[str, Any]


class KnowledgeConsolidator:
    """
    Builds canonical knowledge objects before they are embedded into Qdrant.

    Strategy:
    - Tickets / manual entries / learned chats:
      deterministic semantic-lite grouping by normalized content hash
    - PDFs:
      version by file hash, because docs should generally be replaced, not merged
    """

    def ticket_cluster_key(self, ticket_number: Any, issue_reported: Any, issue_found: Any, issue_cause: Any, work_done: Any, advanced_work_done: Any) -> str:
        parts = [
            _norm(issue_reported),
            _norm(issue_found),
            _norm(issue_cause),
            _norm(work_done),
            _norm(advanced_work_done),
        ]
        raw = " | ".join(parts)
        return _sha256(raw)

    def manual_cluster_key(self, title: str, content: str, category: str) -> str:
        raw = f"{_norm(title)} | {_norm(content)} | {_norm(category)}"
        return _sha256(raw)

    def chat_cluster_key(self, issue_reported: Any, issue_found: Any, issue_cause: Any, work_done: Any) -> str:
        raw = " | ".join([_norm(issue_reported), _norm(issue_found), _norm(issue_cause), _norm(work_done)])
        return _sha256(raw)

    def pdf_cluster_key(self, file_name: str, raw_text: str, category: str) -> str:
        raw = f"{_norm(file_name)} | {_norm(category)} | {_norm(raw_text)}"
        return _sha256(raw)

    def cluster_id(self, cluster_key: str) -> str:
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"cluster_{cluster_key}"))

    def build_ticket_record(self, *, ticket_number: Any, issue_reported: Any, issue_found: Any, issue_cause: Any, work_done: Any, advanced_work_done: Any) -> CanonicalRecord:
        cluster_key = self.ticket_cluster_key(ticket_number, issue_reported, issue_found, issue_cause, work_done, advanced_work_done)
        point_id = self.cluster_id(cluster_key)

        page_content = (
            "CANONICAL HELPDESK ISSUE\n"
            "========================\n"
            f"REPRESENTATIVE TICKET NUMBER: {_stable_text(ticket_number)}\n\n"
            f"ISSUE REPORTED: {_stable_text(issue_reported)}\n"
            f"ACTUAL ISSUE FOUND: {_stable_text(issue_found)}\n"
            f"ROOT CAUSE: {_stable_text(issue_cause)}\n"
            f"RESOLUTION (WORK DONE): {_stable_text(work_done)}\n"
            f"ADVANCED RESOLUTION: {_stable_text(advanced_work_done)}\n"
        )

        metadata = {
            "doc_type": "canonical_ticket_cluster",
            "knowledge_type": "ticket",
            "cluster_key": cluster_key,
            "source_id": _stable_text(ticket_number),
            "source_ids": [_stable_text(ticket_number)],
            "frequency": 1,
        }
        return CanonicalRecord(cluster_key, point_id, page_content, metadata)

    def build_manual_record(self, *, entry_id: str, title: str, content: str, category: str) -> CanonicalRecord:
        cluster_key = self.manual_cluster_key(title, content, category)
        point_id = self.cluster_id(cluster_key)

        page_content = f"TITLE: {title.strip()}\nCONTENT: {content.strip()}"
        metadata = {
            "doc_type": "general_text",
            "knowledge_type": "manual",
            "cluster_key": cluster_key,
            "source_id": entry_id,
            "source_ids": [entry_id],
            "title": title,
            "category": category,
            "frequency": 1,
        }
        return CanonicalRecord(cluster_key, point_id, page_content, metadata)

    def build_chat_record(self, *, session_id: str, issue_reported: Any, issue_found: Any, issue_cause: Any, work_done: Any) -> CanonicalRecord:
        cluster_key = self.chat_cluster_key(issue_reported, issue_found, issue_cause, work_done)
        point_id = self.cluster_id(cluster_key)

        page_content = (
            "ISSUE REPORTED: " + _stable_text(issue_reported) + "\n"
            "ACTUAL ISSUE FOUND: " + _stable_text(issue_found) + "\n"
            "ROOT CAUSE: " + _stable_text(issue_cause) + "\n"
            "RESOLUTION (WORK DONE): " + _stable_text(work_done)
        )
        metadata = {
            "doc_type": "resolved_chat",
            "knowledge_type": "chat",
            "cluster_key": cluster_key,
            "source_id": session_id,
            "source_ids": [session_id],
            "frequency": 1,
        }
        return CanonicalRecord(cluster_key, point_id, page_content, metadata)

    def build_pdf_record(self, *, document_id: str, file_name: str, raw_text: str, category: str) -> CanonicalRecord:
        cluster_key = self.pdf_cluster_key(file_name, raw_text, category)
        point_id = self.cluster_id(cluster_key)

        # PDF is still chunked later, but the document identity is canonicalized.
        page_content = raw_text
        metadata = {
            "doc_type": "official_document",
            "knowledge_type": "pdf",
            "cluster_key": cluster_key,
            "source_id": document_id,
            "source_ids": [document_id],
            "file_name": file_name,
            "category": category,
            "frequency": 1,
        }
        return CanonicalRecord(cluster_key, point_id, page_content, metadata)