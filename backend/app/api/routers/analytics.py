"""
Analytics router — REFACTORED.
All aggregation logic moved to AnalyticsService.
"""
import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_chatbot_db, get_helpdesk_db
from app.services.analytics.analytics_service import AnalyticsService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", summary="Get KPI Dashboard Metrics")
def get_analytics_summary(
    db_chatbot: Session = Depends(get_chatbot_db),
    db_helpdesk: Session = Depends(get_helpdesk_db),
):
    return AnalyticsService(db_chatbot, db_helpdesk).get_summary()
