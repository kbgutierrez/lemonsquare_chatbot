"""
Logging configuration for the application.

WHY this replaces print():
  print() has no log levels, no timestamps, no caller context, and
  cannot be redirected to log aggregators (Datadog, CloudWatch, etc.)
  without extra tooling. stdlib logging solves all of this.

  This module configures:
  - A human-readable format for development.
  - Log level from environment (defaults to INFO).
  - Suppression of noisy library loggers (SQLAlchemy queries, httpx).
"""

import logging
import sys


def configure_logging(level: str = "INFO") -> None:
    """
    Set up the root logger.

    Call this once, early in application startup (before any other import
    that uses logging), so all subsequent loggers inherit this configuration.
    """
    log_level = getattr(logging, level.upper(), logging.INFO)

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Avoid adding duplicate handlers if called multiple times (e.g., in tests).
    if not root_logger.handlers:
        root_logger.addHandler(handler)

    # ── Quiet down noisy third-party loggers ──────────────────────────────
    # SQLAlchemy logs every SQL query at DEBUG level — useful for debugging
    # but overwhelming in normal operation.
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    # Sentence-transformers / HuggingFace logs model loading progress.
    # Keep at WARNING to suppress the download progress bars in prod.
    logging.getLogger("sentence_transformers").setLevel(logging.WARNING)
    logging.getLogger("transformers").setLevel(logging.WARNING)
