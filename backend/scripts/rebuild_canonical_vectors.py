"""
Rebuild canonical ticket vectors only.

This script is a thin wrapper around the existing canonical ticket ingestion
script and is useful when you only want to recompute canonical clusters and
their vectors (no PDFs, no manual entries).

Usage:
    cd backend
    python -m scripts.rebuild_canonical_vectors --batch 50
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Allow imports from the app package when running as a script.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.ingest_tickets import run_ingestion


def main(batch_size: int = 20):
    run_ingestion(batch_size)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", type=int, default=20, help="Batch size for uploads")
    args = parser.parse_args()
    main(batch_size=args.batch)
