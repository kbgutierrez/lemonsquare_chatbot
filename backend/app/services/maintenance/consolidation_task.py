"""Safe knowledge-base maintenance tasks.

This module intentionally does not semantically merge or compress knowledge.
It only tracks a lightweight maintenance pass so the public maintenance
endpoint remains compatible without mutating raw ticket-level retrieval.
"""
import logging

logger = logging.getLogger(__name__)

LIVE_STATUS = {
    "is_running": False,
    "progress_message": "Idle",
    "clusters_merged": 0,
    "freed_space": 0,
    "current_merge_details": None,
}


async def run_safe_maintenance() -> None:
    global LIVE_STATUS
    LIVE_STATUS["is_running"] = True
    LIVE_STATUS["clusters_merged"] = 0
    LIVE_STATUS["freed_space"] = 0
    LIVE_STATUS["current_merge_details"] = None
    try:
        LIVE_STATUS["progress_message"] = "Safe maintenance completed. Semantic consolidation is disabled."
        logger.info("Safe maintenance completed; no vectors were merged or deleted.")
    finally:
        LIVE_STATUS["is_running"] = False
