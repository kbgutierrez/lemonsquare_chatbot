from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.langchain_agent import get_chat_response

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        answer = get_chat_response(request.message)
        return {"response": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))