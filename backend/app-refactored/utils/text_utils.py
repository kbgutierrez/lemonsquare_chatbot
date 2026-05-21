"""
Text normalization utilities.
Extracted from consolidator.py and ingestion pipelines.
Provides deterministic text processing for clustering and comparison.
"""
import hashlib
import re


def normalize_text(value) -> str:
    """
    Normalize text for semantic comparison.
    Lowercases, removes punctuation, collapses whitespace.
    """
    if value is None:
        return ""
    text = str(value).strip().lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def stable_text(value) -> str:
    """
    Convert value to stable string representation.
    Returns 'None' for empty/null values.
    """
    if value is None:
        return "None"
    text = str(value).strip()
    return text if text else "None"


def sha256_hash(text: str) -> str:
    """Compute SHA-256 hex digest of a string."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()
