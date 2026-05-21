import logging
import json
import asyncio
from sqlalchemy.orm import Session
from qdrant_client.http import models as qdrant_models
from langchain_groq import ChatGroq

from app.models.chatbot import TicketRoutingLog
from app.schemas.routing import RoutingRequest, RoutingSuggestion, RoutingResponse
from app.core.config import settings
from app.services.taxonomy_service import get_live_taxonomy

logger = logging.getLogger(__name__)

async def suggest_route(request: RoutingRequest, db: Session, qdrant, embeddings, collection_name: str) -> RoutingResponse:
    logger.info("Starting RAC routing for new ticket: '%s'", request.summary)
    
    # ---------------------------------------------------------
    # PHASE 1: RETRIEVAL (Vector Search)
    # ---------------------------------------------------------
    # ---------------------------------------------------------
    # PHASE 1: RETRIEVAL (Vector Search)
    # ---------------------------------------------------------
    search_text = f"ISSUE: {request.summary}\nDETAILS: {request.description}"
    query_vector = await asyncio.to_thread(embeddings.embed_query, search_text)
    
    # Grab the new collection name from settings
    routing_collection = getattr(settings, "QDRANT_ROUTING_COLLECTION", "helpdesk_routing_v1")
    
    # Notice we removed the query_filter completely! Much faster.
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

    # ---------------------------------------------------------
    # PHASE 2: REASONING (LLM Evaluation)
    # ---------------------------------------------------------
    valid_taxonomy_json = await get_live_taxonomy()

    prompt = (
        "You are an expert IT Helpdesk Dispatcher. Route the NEW TICKET to the correct Department and Subcategory.\n\n"
        "CRITICAL RULES:\n"
        "1. You MUST select a department_id and subcategory_id from the VALID TAXONOMY MAP below.\n"
        "2. Do NOT invent IDs. If unsure, use the 'OTHERS' subcategory_id for the most likely department.\n"
        "3. Output EXACTLY a valid JSON object. No markdown block quotes. No extra text.\n\n"
        f"VALID TAXONOMY MAP:\n{valid_taxonomy_json}\n\n"
        "REQUIRED JSON SCHEMA:\n"
        "{\n"
        '  "department_id": integer,\n'
        '  "subcategory_id": integer,\n'
        '  "department_name": "string",\n'
        '  "subcategory_name": "string",\n'
        '  "confidence": float (0.0 to 1.0),\n'
        '  "reasoning": "string" (1-sentence technical explanation of why this route was chosen)\n'
        "}\n\n"
        f"NEW TICKET:\nTITLE: {request.summary}\nDESC: {request.description}\n\n"
        f"HISTORICAL TICKETS FOR CONTEXT:\n{retrieved_context}\n\n"
        "JSON OUTPUT:"
    )

    llm = ChatGroq(
        model="llama-3.1-8b-instant", 
        temperature=0.0, 
        api_key=settings.GROQ_API_KEY
    )
    
    try:
        llm_result = await llm.ainvoke(prompt)
        raw_output = llm_result.content.strip()
        
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3].strip()
        elif raw_output.startswith("```"):
            raw_output = raw_output[3:-3].strip()
            
        parsed_routing = json.loads(raw_output)
        
        # Hardened Extraction: Grab exact integers, fallback to 29 (ICT) / 11200 (OTHERS)
        predicted_dept_id = int(parsed_routing.get("department_id", 29)) 
        predicted_subcat_id = int(parsed_routing.get("subcategory_id", 11200)) 
        
        # Grab strings, fallback to old key names if the LLM hallucinates
        predicted_dept_name = parsed_routing.get("department_name", parsed_routing.get("department", "ICT"))
        predicted_subcat_name = parsed_routing.get("subcategory_name", parsed_routing.get("subcategory", "OTHERS"))
        
        confidence = float(parsed_routing.get("confidence", 0.0))
        reasoning = parsed_routing.get("reasoning", "Parsed successfully but reasoning missing.")

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM JSON: {e}\nRaw Output: {raw_output}")
        predicted_dept_id, predicted_subcat_id = 29, 11200 
        predicted_dept_name, predicted_subcat_name = "System_Error", "Parsing_Failed"
        confidence = 0.0
        reasoning = "AI evaluation failed to produce valid JSON."
    except Exception as e:
        logger.error(f"Unexpected routing error: {e}")
        predicted_dept_id, predicted_subcat_id = 29, 11200
        predicted_dept_name, predicted_subcat_name = "System_Error", "API_Failed"
        confidence = 0.0
        reasoning = str(e)

    # ---------------------------------------------------------
    # PHASE 3: TELEMETRY (SQL Logging)
    # ---------------------------------------------------------
    routing_log = TicketRoutingLog(
        InputSummary=request.summary,
        InputDescription=request.description,
        PredictedDepartment=predicted_dept_name, 
        PredictedSubcategory=predicted_subcat_name,
        ConfidenceScore=confidence,
        LLMReasoning=reasoning
    )
    db.add(routing_log)
    db.commit()
    db.refresh(routing_log)
    
    logger.info("Routing complete [LogID: %s] | Dept ID: %d -> Subcat ID: %d", 
                routing_log.LogID, predicted_dept_id, predicted_subcat_id)
    
    # Matches the exact Pydantic schema now!
    return RoutingResponse(
        status="success",
        log_id=routing_log.LogID,
        suggestion=RoutingSuggestion(
            department_id=predicted_dept_id,
            subcategory_id=predicted_subcat_id,
            department_name=predicted_dept_name,
            subcategory_name=predicted_subcat_name,
            confidence_score=confidence,
            reasoning=reasoning
        )
    )