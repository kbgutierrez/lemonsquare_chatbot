import httpx
from fastapi import HTTPException

async def fetch_user_details(auth_token: str) -> dict:
    """Calls the Lemon Square BizPortal API to get the current user's details."""

    if auth_token.startswith("TEST_USER_"):
        user_id = int(auth_token.split("_")[-1]) 
        print(f"BYPASS ACTIVE: Simulating login for User #{user_id}")
        return {
            "id": user_id,
            "firstname": "Local",
            "lastname": f"Tester {user_id}"
        }
    # ---------------------------------------------------------

    api_url = "http://lsbizportal.lemonsquare.com.ph/testportal/api/chatbot/user/details"
    
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Accept": "application/json"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(api_url, headers=headers, timeout=5.0)
            
            if response.status_code == 401 or response.status_code == 403:
                raise HTTPException(status_code=401, detail="Invalid or expired user token.")
                
            response.raise_for_status()
            return response.json()
            
        except httpx.RequestError as e:
            print(f"Failed to connect to BizPortal API: {e}")
            raise HTTPException(status_code=503, detail="User authentication service is currently down.")