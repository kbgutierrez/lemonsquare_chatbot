import httpx
import logging
import json

logger = logging.getLogger(__name__)

# In-memory cache so we don't hit the BizPortal API on every single ticket
_TAXONOMY_CACHE = None

async def get_live_taxonomy() -> str:
    """
    Fetches the live taxonomy from BizPortal and formats it as a clean JSON string 
    for the LLM Prompt.
    """
    global _TAXONOMY_CACHE
    if _TAXONOMY_CACHE:
        return _TAXONOMY_CACHE

    dept_url = "https://lsbizportal.lemonsquare.com.ph/helpdesk-dev/api/chatbot/fetch/departments"
    base_subcat_url = "https://lsbizportal.lemonsquare.com.ph/helpdesk-dev/api/chatbot/fetch/subcategories?department_id="
    
    taxonomy = []
    
    try:
        async with httpx.AsyncClient(verify=False) as client:
            # 1. Fetch Departments
            dept_res = await client.get(dept_url)
            dept_res.raise_for_status()
            departments = dept_res.json().get("data", [])
            
            # 2. Fetch Subcategories for each Department
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
                
        # Cache as a compact JSON string to save LLM tokens
        _TAXONOMY_CACHE = json.dumps(taxonomy, separators=(',', ':'))
        return _TAXONOMY_CACHE
        
    except Exception as e:
        logger.error(f"Failed to fetch live taxonomy: {e}")
        # Fallback to empty if BizPortal is down
        return "[]"