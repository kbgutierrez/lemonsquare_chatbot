"""
Taxonomy fetching service.
Preserves original implementation with in-memory caching.
"""
import logging
import json
import asyncio
import time
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

_TAXONOMY_CACHE: str | None = None
_TAXONOMY_FETCHED_AT = 0.0
_TAXONOMY_LOCK = asyncio.Lock()


async def get_live_taxonomy() -> str:
    """
    Fetches the live taxonomy from BizPortal and formats as compact JSON.
    Uses in-memory cache to avoid repeated API calls.
    """
    global _TAXONOMY_CACHE, _TAXONOMY_FETCHED_AT
    now = time.time()
    ttl = float(getattr(settings, "TAXONOMY_CACHE_TTL_SECONDS", 1800))
    if _TAXONOMY_CACHE and (now - _TAXONOMY_FETCHED_AT) <= ttl:
        return _TAXONOMY_CACHE

    async with _TAXONOMY_LOCK:
        now = time.time()
        if _TAXONOMY_CACHE and (now - _TAXONOMY_FETCHED_AT) <= ttl:
            return _TAXONOMY_CACHE

        dept_url = "https://lsbizportal.lemonsquare.com.ph/helpdesk-dev/api/chatbot/fetch/departments"
        base_subcat_url = "https://lsbizportal.lemonsquare.com.ph/helpdesk-dev/api/chatbot/fetch/subcategories?department_id="
        taxonomy = []

        try:
            timeout = httpx.Timeout(connect=3.0, read=7.0, write=5.0, pool=1.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                dept_res = await client.get(dept_url)
                dept_res.raise_for_status()
                departments = dept_res.json().get("data", [])

                async def fetch_subcategories(dept: dict) -> dict:
                    dept_id = dept["department_id"]
                    try:
                        sub_res = await client.get(f"{base_subcat_url}{dept_id}")
                        subcategories = sub_res.json().get("data", []) if sub_res.status_code == 200 else []
                    except Exception as exc:
                        logger.warning("Failed to fetch subcategories for department=%s: %s", dept_id, exc)
                        subcategories = []
                    return {
                        "department_id": int(dept_id),
                        "department_name": dept["short_name"],
                        "subcategories": [
                            {"id": int(sub["id"]), "name": sub["sub_category"]}
                            for sub in subcategories
                        ]
                    }

                taxonomy = await asyncio.gather(
                    *(fetch_subcategories(dept) for dept in departments)
                )

            _TAXONOMY_CACHE = json.dumps(taxonomy, separators=(',', ':'))
            _TAXONOMY_FETCHED_AT = time.time()
            logger.info("Taxonomy cache refreshed department_count=%d", len(taxonomy))
            return _TAXONOMY_CACHE
        except Exception as e:
            logger.error("Failed to fetch live taxonomy: %s", e)
            if _TAXONOMY_CACHE:
                return _TAXONOMY_CACHE
            return "[]"
