"""
Taxonomy fetching service.
Preserves original implementation with in-memory caching.
"""
import logging
import json
import httpx

logger = logging.getLogger(__name__)

_TAXONOMY_CACHE = None


async def get_live_taxonomy() -> str:
    """
    Fetches the live taxonomy from BizPortal and formats as compact JSON.
    Uses in-memory cache to avoid repeated API calls.
    """
    global _TAXONOMY_CACHE
    if _TAXONOMY_CACHE:
        return _TAXONOMY_CACHE

    dept_url = "https://lsbizportal.lemonsquare.com.ph/helpdesk-dev/api/chatbot/fetch/departments"
    base_subcat_url = "https://lsbizportal.lemonsquare.com.ph/helpdesk-dev/api/chatbot/fetch/subcategories?department_id="
    taxonomy = []

    try:
        async with httpx.AsyncClient(verify=False) as client:
            dept_res = await client.get(dept_url)
            dept_res.raise_for_status()
            departments = dept_res.json().get("data", [])

            for dept in departments:
                dept_id = dept["department_id"]
                sub_res = await client.get(f"{base_subcat_url}{dept_id}")
                subcategories = sub_res.json().get("data", []) if sub_res.status_code == 200 else []
                taxonomy.append({
                    "department_id": int(dept_id),
                    "department_name": dept["short_name"],
                    "subcategories": [
                        {"id": int(sub["id"]), "name": sub["sub_category"]}
                        for sub in subcategories
                    ]
                })

        _TAXONOMY_CACHE = json.dumps(taxonomy, separators=(',', ':'))
        return _TAXONOMY_CACHE
    except Exception as e:
        logger.error("Failed to fetch live taxonomy: %s", e)
        return "[]"
