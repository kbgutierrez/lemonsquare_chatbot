"""
Build routing dataset.
"""

from __future__ import annotations

import sys
from pathlib import Path

# IMPORTANT:
# expose backend/ as import root
sys.path.insert(
    0,
    str(Path(__file__).resolve().parent.parent)
)

import csv
import json
import logging
from dataclasses import asdict, dataclass
from typing import Any

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

logger = logging.getLogger(__name__)

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "data" / "routing"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

JSONL_PATH = OUTPUT_DIR / "routing_dataset.jsonl"
CSV_PATH = OUTPUT_DIR / "routing_dataset.csv"
STATS_PATH = OUTPUT_DIR / "routing_dataset_stats.json"

DEPARTMENTS_API = (
    "https://lsbizportal.lemonsquare.com.ph/helpdesk-dev/api/chatbot/fetch/departments"
)
SUBCATEGORIES_API = (
    "https://lsbizportal.lemonsquare.com.ph/helpdesk-dev/api/chatbot/fetch/subcategories"
)


@dataclass
class RoutingExample:
    ticket_number: str
    summary: str
    description: str
    department_id: str
    department_name: str
    department_short_name: str
    subcategory_id: str
    subcategory_name: str
    priority_id: str | None
    requester_id: str | None
    company_id: str | None
    created_date: str | None
    resolved_date: str | None


def normalize_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def fetch_live_taxonomy() -> dict[str, dict[str, Any]]:
    """
    Fetch departments and their subcategories from BizPortal.
    Returns:
        {
          "29": {
              "department_name": "...",
              "department_short_name": "...",
              "subcategories": {
                  "11187": "SAP",
                  ...
              }
          }
        }
    """
    import requests

    logger.info("Fetching live departments...")
    dep_res = requests.get(DEPARTMENTS_API, timeout=60)
    dep_res.raise_for_status()
    dep_data = dep_res.json()

    if dep_data.get("status") != "success":
        raise RuntimeError(f"Department API failed: {dep_data}")

    taxonomy: dict[str, dict[str, Any]] = {}

    for dept in dep_data.get("data", []):
        dept_id = str(dept["department_id"])
        dept_name = dept.get("department_decode") or dept.get("short_name") or "Unknown"
        dept_short = dept.get("short_name") or ""

        logger.info("Fetching subcategories for %s (%s)", dept_name, dept_id)
        sub_res = requests.get(
            SUBCATEGORIES_API,
            params={"department_id": dept_id},
            timeout=60,
        )
        sub_res.raise_for_status()
        sub_data = sub_res.json()

        sub_map: dict[str, str] = {}
        if sub_data.get("status") == "success":
            for sub in sub_data.get("data", []):
                sub_id = str(sub.get("id"))
                sub_name = (
                    sub.get("sub_category")
                    or sub.get("subcategory_decode")
                    or sub.get("subcategory_name")
                    or "Unknown"
                )
                sub_map[sub_id] = sub_name

        taxonomy[dept_id] = {
            "department_name": dept_name,
            "department_short_name": dept_short,
            "subcategories": sub_map,
        }

    return taxonomy


def get_db_session():
    engine = create_engine(settings.HELPDESK_DB_CONN, fast_executemany=True, future=True)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    return SessionLocal()


def fetch_ticket_rows(db) -> list[dict[str, Any]]:
    """
    Pull training rows from your ticket header table.
    Adjust the WHERE clause if you want only fully resolved/closed tickets.
    """
    sql = text(
        """
        SELECT
            id,
            ticket_number,
            summary,
            description,
            department_id,
            subcategory_id,
            priority_id,
            requester_id,
            company_id,
            created_date,
            resolved_date,
            status_code
        FROM dbo.tbl_ticket_header
        WHERE department_id IS NOT NULL
          AND subcategory_id IS NOT NULL
          AND summary IS NOT NULL
          AND description IS NOT NULL
        """
    )

    rows = db.execute(sql).mappings().all()
    return [dict(r) for r in rows]


def build_examples(rows: list[dict[str, Any]], taxonomy: dict[str, dict[str, Any]]) -> list[RoutingExample]:
    examples: list[RoutingExample] = []

    for row in rows:
        dept_id = normalize_text(row.get("department_id"))
        subcat_id = normalize_text(row.get("subcategory_id"))

        dept_info = taxonomy.get(dept_id, {})
        dept_name = dept_info.get("department_name", "Unknown")
        dept_short = dept_info.get("department_short_name", "")
        sub_name = dept_info.get("subcategories", {}).get(subcat_id, "Unknown")

        examples.append(
            RoutingExample(
                ticket_number=normalize_text(row.get("ticket_number")),
                summary=normalize_text(row.get("summary")),
                description=normalize_text(row.get("description")),
                department_id=dept_id,
                department_name=dept_name,
                department_short_name=dept_short,
                subcategory_id=subcat_id,
                subcategory_name=sub_name,
                priority_id=normalize_text(row.get("priority_id")) or None,
                requester_id=normalize_text(row.get("requester_id")) or None,
                company_id=normalize_text(row.get("company_id")) or None,
                created_date=str(row.get("created_date")) if row.get("created_date") else None,
                resolved_date=str(row.get("resolved_date")) if row.get("resolved_date") else None,
            )
        )

    return examples


def save_jsonl(path: Path, examples: list[RoutingExample]) -> None:
    with path.open("w", encoding="utf-8") as f:
        for ex in examples:
            payload = asdict(ex)
            payload["text"] = f"{ex.summary}\n{ex.description}".strip()
            f.write(json.dumps(payload, ensure_ascii=False) + "\n")


def save_csv(path: Path, examples: list[RoutingExample]) -> None:
    if not examples:
        return

    fieldnames = list(asdict(examples[0]).keys()) + ["text"]
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for ex in examples:
            row = asdict(ex)
            row["text"] = f"{ex.summary}\n{ex.description}".strip()
            writer.writerow(row)


def save_stats(path: Path, examples: list[RoutingExample]) -> None:
    dept_counts: dict[str, int] = {}
    sub_counts: dict[str, int] = {}

    for ex in examples:
        dept_key = f"{ex.department_id}::{ex.department_name}"
        sub_key = f"{ex.department_id}::{ex.subcategory_id}::{ex.subcategory_name}"
        dept_counts[dept_key] = dept_counts.get(dept_key, 0) + 1
        sub_counts[sub_key] = sub_counts.get(sub_key, 0) + 1

    stats = {
        "total_examples": len(examples),
        "departments": dept_counts,
        "subcategories": sub_counts,
    }

    path.write_text(json.dumps(stats, indent=2, ensure_ascii=False), encoding="utf-8")


def main() -> None:
    logger.info("Starting routing dataset build...")

    db = get_db_session()
    try:
        taxonomy = fetch_live_taxonomy()
        rows = fetch_ticket_rows(db)
        examples = build_examples(rows, taxonomy)

        logger.info("Loaded %d ticket rows", len(rows))
        logger.info("Built %d labeled routing examples", len(examples))

        save_jsonl(JSONL_PATH, examples)
        save_csv(CSV_PATH, examples)
        save_stats(STATS_PATH, examples)

        logger.info("Saved JSONL: %s", JSONL_PATH)
        logger.info("Saved CSV:   %s", CSV_PATH)
        logger.info("Saved stats: %s", STATS_PATH)

    finally:
        db.close()


if __name__ == "__main__":
    main()