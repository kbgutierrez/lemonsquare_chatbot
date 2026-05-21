"""
Ticket routing engine — REFACTORED.
Uses centralized prompts, LLM client, and JSON utilities.
"""
import json
import logging
from sqlalchemy.orm import Session
from app.models.chatbot import TicketRoutingLog
from app.schemas.routing import RoutingRequest, RoutingResponse, RoutingSuggestion
from app.services.llm_client import create_llm
from app.services.prompts import build_routing_prompt
from app.core.config import settings
from app.services.taxonomy.taxonomy_service import get_live_taxonomy
from app.utils.json_utils import clean_llm_json_output

logger = logging.getLogger(__name__)

# Safe fallback IDs
FALLBACK_DEPT_ID = 29
FALLBACK_SUBCAT_ID = 11200


async def suggest_route(
    request: RoutingRequest,
    db: Session,
    qdrant,
    embeddings,
    collection_name: str,
) -> RoutingResponse:
    """
    RAC pipeline: Retrieve → Augment → Classify for ticket routing.
    """
    logger.info("Starting RAC routing for new ticket: '%s'", request.summary)

    # ── PHASE 1: RETRIEVAL ────────────────────────────────────
    import asyncio
    search_text = f"ISSUE: {request.summary}\nDETAILS: {request.description}"
    query_vector = await asyncio.to_thread(embeddings.embed_query, search_text)

    routing_collection = getattr(settings, "QDRANT_ROUTING_COLLECTION", "helpdesk_routing_v1")
    search_results = qdrant.query_points(
        collection_name=routing_collection,
        query=query_vector,
        with_payload=True,
        limit=5,
    )

    retrieved_context = ""
    for idx, hit in enumerate(search_results.points, 1):
        content = hit.payload.get("page_content", "No content")
        score = hit.score
        retrieved_context += f"--- HISTORICAL MATCH {idx} (Similarity: {score:.2f}) ---\n{content}\n\n"

    # ── PHASE 2: REASONING ────────────────────────────────────
    valid_taxonomy_json = await get_live_taxonomy()
    prompt = build_routing_prompt(
        summary=request.summary,
        description=request.description,
        taxonomy_json=valid_taxonomy_json,
        retrieved_context=retrieved_context,
    )

    llm = create_llm(model="llama-3.1-8b-instant", temperature=0.0)

    try:
        llm_result = await llm.ainvoke(prompt)
        raw_output = clean_llm_json_output(llm_result.content)
        parsed_routing = json.loads(raw_output)

        predicted_dept_id = int(parsed_routing.get("department_id", FALLBACK_DEPT_ID))
        predicted_subcat_id = int(parsed_routing.get("subcategory_id", FALLBACK_SUBCAT_ID))
        predicted_dept_name = parsed_routing.get("department_name", parsed_routing.get("department", "ICT"))
        predicted_subcat_name = parsed_routing.get("subcategory_name", parsed_routing.get("subcategory", "OTHERS"))
        confidence = float(parsed_routing.get("confidence", 0.0))
        reasoning = parsed_routing.get("reasoning", "Parsed successfully but reasoning missing.")

    except json.JSONDecodeError as e:
        logger.error("Failed to parse LLM JSON: %s\nRaw: %s", e, raw_output)
        predicted_dept_id, predicted_subcat_id = FALLBACK_DEPT_ID, FALLBACK_SUBCAT_ID
        predicted_dept_name, predicted_subcat_name = "System_Error", "Parsing_Failed"
        confidence, reasoning = 0.0, "AI evaluation failed to produce valid JSON."
    except Exception as e:
        logger.error("Unexpected routing error: %s", e)
        predicted_dept_id, predicted_subcat_id = FALLBACK_DEPT_ID, FALLBACK_SUBCAT_ID
        predicted_dept_name, predicted_subcat_name = "System_Error", "API_Failed"
        confidence, reasoning = 0.0, str(e)

    # ── PHASE 3: TELEMETRY ────────────────────────────────────
    routing_log = TicketRoutingLog(
        InputSummary=request.summary,
        InputDescription=request.description,
        PredictedDepartment=predicted_dept_name,
        PredictedSubcategory=predicted_subcat_name,
        ConfidenceScore=confidence,
        LLMReasoning=reasoning,
    )
    db.add(routing_log)
    db.commit()
    db.refresh(routing_log)

    logger.info("Routing complete [LogID: %s] | Dept ID: %d -> Subcat ID: %d",
                routing_log.LogID, predicted_dept_id, predicted_subcat_id)

    return RoutingResponse(
        status="success",
        log_id=routing_log.LogID,
        suggestion=RoutingSuggestion(
            department_id=predicted_dept_id,
            subcategory_id=predicted_subcat_id,
            department_name=predicted_dept_name,
            subcategory_name=predicted_subcat_name,
            confidence_score=confidence,
            reasoning=reasoning,
        )
    )
