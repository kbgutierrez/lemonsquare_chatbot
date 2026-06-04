"""
Knowledge consolidation service.
Builds canonical knowledge objects before embedding into Qdrant.

Uses deterministic semantic-lite grouping
by normalized content hash.

Uses centralized text utilities.
"""

from __future__ import annotations

import hashlib
import uuid

from dataclasses import dataclass
from typing import Any

from app.core.metadata_contract import (
    DOC_TYPE_RAW_TICKET,
    DOC_TYPE_CANONICAL_TICKET,
    DOC_TYPE_GENERAL_TEXT,
    DOC_TYPE_OFFICIAL_DOCUMENT,
    DOC_TYPE_RESOLVED_CHAT,
    DOC_TYPE_TABULAR_DATA,
    KNOWLEDGE_TYPE_TICKET,
    KNOWLEDGE_TYPE_CHAT,
    KNOWLEDGE_TYPE_MANUAL,
    KNOWLEDGE_TYPE_PDF,
    KNOWLEDGE_TYPE_TABULAR,
)

from app.utils.text_utils import (
    normalize_text,
    stable_text,
    sha256_hash,
)


@dataclass
class CanonicalRecord:
    cluster_key: str
    point_id: str
    page_content: str
    metadata: dict[str, Any]


class KnowledgeConsolidator:
    """
    Builds canonical records for Qdrant embedding.
    """

    def ticket_cluster_key(
        self,
        ticket_number,
        issue_reported,
        issue_found,
        issue_cause,
        work_done,
        advanced_work_done,
    ) -> str:

        parts = [
            normalize_text(issue_reported),
            normalize_text(issue_found),
            normalize_text(issue_cause),
            normalize_text(work_done),
            normalize_text(advanced_work_done),
        ]

        raw = " | ".join(parts)

        return sha256_hash(raw)

    def manual_cluster_key(
        self,
        title: str,
        content: str,
        category: str,
    ) -> str:

        raw = (
            f"{normalize_text(title)} "
            f"| {normalize_text(content)} "
            f"| {normalize_text(category)}"
        )

        return sha256_hash(raw)

    def chat_cluster_key(
        self,
        issue_reported,
        issue_found,
        issue_cause,
        work_done,
    ) -> str:

        raw = " | ".join([
            normalize_text(issue_reported),
            normalize_text(issue_found),
            normalize_text(issue_cause),
            normalize_text(work_done),
        ])

        return sha256_hash(raw)

    def pdf_cluster_key(
        self,
        file_name: str,
        raw_text: str,
        category: str,
    ) -> str:

        raw = (
            f"{normalize_text(file_name)} "
            f"| {normalize_text(category)} "
            f"| {normalize_text(raw_text)}"
        )

        return sha256_hash(raw)

    def cluster_id(
        self,
        cluster_key: str,
    ) -> str:

        return str(
            uuid.uuid5(
                uuid.NAMESPACE_DNS,
                f"cluster_{cluster_key}",
            )
        )

    def build_ticket_record(
        self,
        *,
        ticket_number,
        issue_reported,
        issue_found,
        issue_cause,
        work_done,
        advanced_work_done,
    ) -> CanonicalRecord:

        cluster_key = (
            self.ticket_cluster_key(
                ticket_number,
                issue_reported,
                issue_found,
                issue_cause,
                work_done,
                advanced_work_done,
            )
        )

        point_id = (
            self.cluster_id(
                cluster_key
            )
        )

        page_content = (
            "CANONICAL HELPDESK ISSUE\n"
            "========================\n"
            f"REPRESENTATIVE TICKET NUMBER: "
            f"{stable_text(ticket_number)}\n\n"
            f"ISSUE REPORTED: "
            f"{stable_text(issue_reported)}\n"
            f"ACTUAL ISSUE FOUND: "
            f"{stable_text(issue_found)}\n"
            f"ROOT CAUSE: "
            f"{stable_text(issue_cause)}\n"
            f"RESOLUTION (WORK DONE): "
            f"{stable_text(work_done)}\n"
            f"ADVANCED RESOLUTION: "
            f"{stable_text(advanced_work_done)}\n"
        )

        metadata = {
            "doc_type":
                DOC_TYPE_CANONICAL_TICKET,

            "knowledge_type":
                KNOWLEDGE_TYPE_TICKET,

            "cluster_key":
                cluster_key,

            "source_id":
                stable_text(ticket_number),

            "source_ids": [
                stable_text(ticket_number)
            ],

            "frequency":
                1,
        }

        return CanonicalRecord(
            cluster_key,
            point_id,
            page_content,
            metadata,
        )

    def build_raw_ticket_record(
        self,
        *,
        ticket_number,
        issue_reported,
        issue_found,
        issue_cause,
        work_done,
        advanced_work_done,
    ) -> CanonicalRecord:

        point_id = str(
            uuid.uuid5(
                uuid.NAMESPACE_DNS,
                f"raw_ticket_{ticket_number}",
            )
        )

        cluster_key = (
            self.ticket_cluster_key(
                ticket_number,
                issue_reported,
                issue_found,
                issue_cause,
                work_done,
                advanced_work_done,
            )
        )

        page_content = (
            f"TICKET NUMBER: "
            f"{stable_text(ticket_number)}\n"

            f"ISSUE REPORTED: "
            f"{stable_text(issue_reported)}\n"

            f"ACTUAL ISSUE FOUND: "
            f"{stable_text(issue_found)}\n"

            f"ROOT CAUSE: "
            f"{stable_text(issue_cause)}\n"

            f"RESOLUTION (WORK DONE): "
            f"{stable_text(work_done)}\n"

            f"ADVANCED RESOLUTION: "
            f"{stable_text(advanced_work_done)}\n"
        )

        metadata = {
            "doc_type":
                DOC_TYPE_RAW_TICKET,

            "knowledge_type":
                KNOWLEDGE_TYPE_TICKET,

            "ticket_number":
                stable_text(ticket_number),

            "cluster_key":
                cluster_key,

            "source_id":
                stable_text(ticket_number),

            "source_ids": [
                stable_text(ticket_number)
            ],

            "frequency":
                1,
        }

        return CanonicalRecord(
            cluster_key,
            point_id,
            page_content,
            metadata,
        )

    def build_manual_record(
        self,
        *,
        entry_id: str,
        title: str,
        content: str,
        category: str,
    ) -> CanonicalRecord:

        """
        IMPORTANT:
        Empty category means:
        AI AUTO-DETECT MODE

        We preserve empty string intentionally.
        DO NOT fallback to General_IT.
        """

        normalized_category = (
            (category or "")
            .strip()
        )

        cluster_key = (
            self.manual_cluster_key(
                title,
                content,
                normalized_category,
            )
        )

        point_id = str(
            uuid.uuid5(
                uuid.NAMESPACE_DNS,
                f"manual_{entry_id}",
            )
        )

        """
        ========================================
        PAGE CONTENT
        ========================================
        """

        if normalized_category:

            page_content = (
                f"TITLE: "
                f"{title.strip()}\n"

                f"CATEGORY: "
                f"{normalized_category}\n"

                f"CONTENT: "
                f"{content.strip()}"
            )

        else:

            """
            IMPORTANT:
            Avoid poisoning embeddings
            with fake category labels.
            """

            page_content = (
                f"TITLE: "
                f"{title.strip()}\n"

                f"CONTENT: "
                f"{content.strip()}"
            )

        metadata = {
            "doc_type":
                DOC_TYPE_GENERAL_TEXT,

            "knowledge_type":
                KNOWLEDGE_TYPE_MANUAL,

            "cluster_key":
                cluster_key,

            "source_id":
                entry_id,

            "source_ids": [
                entry_id
            ],

            "title":
                title,

            """
            IMPORTANT:
            Preserve empty category.
            """
            "category":
                normalized_category,

            "frequency":
                1,
        }

        return CanonicalRecord(
            cluster_key,
            point_id,
            page_content,
            metadata,
        )

    def build_chat_record(
        self,
        *,
        session_id: str,
        issue_reported,
        issue_found,
        issue_cause,
        work_done,
    ) -> CanonicalRecord:

        cluster_key = (
            self.chat_cluster_key(
                issue_reported,
                issue_found,
                issue_cause,
                work_done,
            )
        )

        point_id = str(
            uuid.uuid5(
                uuid.NAMESPACE_DNS,
                f"resolved_chat_{session_id}",
            )
        )

        page_content = (
            f"ISSUE REPORTED: "
            f"{stable_text(issue_reported)}\n"

            f"ACTUAL ISSUE FOUND: "
            f"{stable_text(issue_found)}\n"

            f"ROOT CAUSE: "
            f"{stable_text(issue_cause)}\n"

            f"RESOLUTION (WORK DONE): "
            f"{stable_text(work_done)}"
        )

        metadata = {
            "doc_type":
                DOC_TYPE_RESOLVED_CHAT,

            "knowledge_type":
                KNOWLEDGE_TYPE_CHAT,

            "cluster_key":
                cluster_key,

            "source_id":
                session_id,

            "source_ids": [
                session_id
            ],

            "frequency":
                1,
        }

        return CanonicalRecord(
            cluster_key,
            point_id,
            page_content,
            metadata,
        )

    def build_pdf_record(
        self,
        *,
        document_id: str,
        file_name: str,
        raw_text: str,
        category: str,
    ) -> CanonicalRecord:

        cluster_key = (
            self.pdf_cluster_key(
                file_name,
                raw_text,
                category,
            )
        )

        point_id = (
            self.cluster_id(
                cluster_key
            )
        )

        metadata = {
            "doc_type":
                DOC_TYPE_OFFICIAL_DOCUMENT,

            "knowledge_type":
                KNOWLEDGE_TYPE_PDF,

            "cluster_key":
                cluster_key,

            "document_id":
                document_id,

            "source_id":
                document_id,

            "source_ids": [
                document_id
            ],

            "file_name":
                file_name,

            "category":
                category,

            "frequency":
                1,
        }

        return CanonicalRecord(
            cluster_key,
            point_id,
            raw_text,
            metadata,
        )

    def build_tabular_record(
        self,
        *,
        document_id: str,
        file_name: str,
        row_text: str,
        category: str,
        row_index: int,
    ) -> CanonicalRecord:

        cluster_key = sha256_hash(
            f"{document_id}:{file_name}:{category}"
        )

        point_id = str(
            uuid.uuid5(
                uuid.NAMESPACE_DNS,
                f"{document_id}_row_{row_index}",
            )
        )

        metadata = {
            "doc_type":
                DOC_TYPE_TABULAR_DATA,

            "knowledge_type":
                KNOWLEDGE_TYPE_TABULAR,

            "cluster_key":
                cluster_key,

            "document_id":
                document_id,

            "source_id":
                document_id,

            "source_ids": [
                document_id
            ],

            "file_name":
                file_name,

            "category":
                category,

            "row_index":
                row_index,

            "frequency":
                1,
        }

        return CanonicalRecord(
            cluster_key,
            point_id,
            row_text,
            metadata,
        )