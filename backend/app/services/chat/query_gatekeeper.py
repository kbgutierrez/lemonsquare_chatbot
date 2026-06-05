"""
Deterministic pre-RAG routing for obvious chat turns.

The gatekeeper must stay local, explainable, and cheap: no LLM calls, no
semantic inference, and no hidden state. Any uncertainty returns continue_rag.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
import re


class GatekeeperDecision(StrEnum):
    CONTINUE_RAG = "continue_rag"
    SKIP_AI = "skip_ai"
    SHOW_TICKET = "show_ticket"
    SHOW_RESOLVE = "show_resolve"


@dataclass(frozen=True)
class GatekeeperResult:
    decision: GatekeeperDecision
    reason: str
    confidence: float
    response: str | None = None
    action: str = "none"
    resolution_message: str | None = None

    def as_debug_dict(self) -> dict[str, str | float | None]:
        return {
            "decision": self.decision.value,
            "reason": self.reason,
            "confidence": self.confidence,
            "action": self.action,
            "response": self.response,
            "resolution_message": self.resolution_message,
        }


class QueryGatekeeper:
    """Route only explicit, low-risk chat turns before the RAG pipeline."""

    _NORMALIZE_RE = re.compile(r"\s+")
    _TRAILING_PUNCT_RE = re.compile(r"[.!?]+$")

    _GREETING_RE = re.compile(
        r"^(hi|hello|hey|good\s+morning|good\s+afternoon|good\s+evening|kamusta|kumusta|musta|yo|sup|hello\s+po|hi\s+po)$",
        re.IGNORECASE,
    )
    _THANKS_RE = re.compile(
        r"^(thanks|thank\s+you|thank\s+you\s+po|salamat|salamat\s+po|ty|tnx|thx)$",
        re.IGNORECASE,
    )
    _TICKET_RE = re.compile(
        r"^(please\s+)?((can|could)\s+you\s+)?(create|make|open|file|raise|submit)\s+(a\s+)?(ticket|request)(\s+.*)?$|^(please\s+)?(gawa|gumawa)\s+(ng\s+)?ticket(\s+.*)?$|^ticket\s+please$",
        re.IGNORECASE,
    )
    _RESOLVED_RE = re.compile(
        r"^(resolved|fixed|solved|okay\s+na|ok\s+na|goods\s+na|working\s+na|naayos\s+na|ayos\s+na)$",
        re.IGNORECASE,
    )

    def evaluate(
        self,
        user_query: str,
        *,
        session_status: str | None = None,
    ) -> GatekeeperResult:
        normalized = self._normalize(user_query)
        status = (session_status or "").strip()

        if not normalized:
            return self._continue("empty_or_whitespace_query", status)

        if status.lower() in {"resolved", "escalated", "closed"}:
            return self._continue("terminal_session_status", status)

        if self._GREETING_RE.fullmatch(normalized):
            return GatekeeperResult(
                decision=GatekeeperDecision.SKIP_AI,
                reason="standalone_greeting",
                confidence=1.0,
                response="Hi! How can I help you today?",
                action="none",
            )

        if self._THANKS_RE.fullmatch(normalized):
            return GatekeeperResult(
                decision=GatekeeperDecision.SKIP_AI,
                reason="standalone_thanks",
                confidence=1.0,
                response="You're welcome.",
                action="none",
            )

        if self._TICKET_RE.fullmatch(normalized):
            return GatekeeperResult(
                decision=GatekeeperDecision.SHOW_TICKET,
                reason="explicit_ticket_request",
                confidence=1.0,
                response="I can help you create a ticket for this.",
                action="show_ticket",
                resolution_message="Proceed with creating a ticket?",
            )

        if self._RESOLVED_RE.fullmatch(normalized):
            return GatekeeperResult(
                decision=GatekeeperDecision.SHOW_RESOLVE,
                reason="explicit_resolution_confirmation",
                confidence=1.0,
                response="Glad to hear it worked.",
                action="show_resolve",
                resolution_message="Can we mark this chat as resolved?",
            )

        return self._continue("no_deterministic_match", status)

    def _continue(self, reason: str, session_status: str) -> GatekeeperResult:
        status_reason = f"{reason}:session_status={session_status or 'unknown'}"
        return GatekeeperResult(
            decision=GatekeeperDecision.CONTINUE_RAG,
            reason=status_reason,
            confidence=0.0,
        )

    def _normalize(self, user_query: str) -> str:
        normalized = (user_query or "").strip().lower()
        normalized = self._TRAILING_PUNCT_RE.sub("", normalized)
        return self._NORMALIZE_RE.sub(" ", normalized).strip()
