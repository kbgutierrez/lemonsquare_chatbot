import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_chatbot_db, get_ingestion_service
from app.schemas.routing import RoutingRequest, RoutingResponse
from app.services.routing_service import suggest_route

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/routing", tags=["Routing Engine"])

@router.post("/suggest", response_model=RoutingResponse, summary="Predict ticket routing via RAC")
async def predict_ticket_route(
    request: RoutingRequest,
    db: Session = Depends(get_chatbot_db),
    ingestion_service = Depends(get_ingestion_service) 
):
    """
    Analyzes a new ticket's title and description, compares it against the historical 
    Qdrant database, and uses an LLM to predict the correct Department and Subcategory.
    """
    # We reuse the ingestion service's Qdrant and Embeddings objects 
    # because they are already loaded into memory perfectly.
    response = await suggest_route(
        request=request,
        db=db,
        qdrant=ingestion_service.qdrant,
        embeddings=ingestion_service.embeddings,
        collection_name=ingestion_service.collection_name
    )
    
    return response