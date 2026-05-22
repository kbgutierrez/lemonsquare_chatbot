"""
Centralized prompt templates.
Single source of truth for all LLM prompts.
Previously scattered across orchestrator.py, chat_service.py, routing_service.py,
and conversation_resolution_service.py.
"""

# =========================================================
# REFORMULATOR
# =========================================================
DEFAULT_REFORMULATOR_PROMPT = (
    "You are a technical search assistant. Read the chat history and the user's "
    "latest message. If the latest message is vague, rewrite it into a specific "
    "IT search query based on the history. Otherwise, return it exactly as written.\n"
    "DO NOT answer the user. ONLY output the rewritten search string.\n"
    "History: {chat_history}\n"
    "Latest Message: {user_query}\n"
    "Rewritten Search Query:"
)

# =========================================================
# ESCALATION DRAFTING
# =========================================================
ESCALATION_DRAFT_PROMPT = (
    "You are an expert Helpdesk Dispatcher.\n"
    "Read the chat transcript and extract the issue into a clean operational ticket.\n\n"
    "You MUST output EXACTLY a valid JSON object with these keys:\n"
    "- summary\n"
    "- description\n\n"
    "Rules for summary:\n"
    "- 3 to 8 words only\n"
    "- Operational issue title\n"
    "- No punctuation spam\n\n"
    "Rules for description:\n"
    "- Extremely concise\n"
    "- Neutral technician-style wording\n"
    "- Mention reported issue\n"
    "- Mention attempted troubleshooting if present\n"
    "- 1 to 5 sentences maximum\n"
    "- Match transcript language naturally\n"
    "- NEVER use first-person pronouns\n\n"
    "Do NOT include markdown.\n"
    "Output RAW JSON ONLY.\n\n"
    "Transcript:\n{transcript}\n\n"
    "JSON Output:"
)

# =========================================================
# ROUTING
# =========================================================
def build_routing_prompt(summary: str,description: str,taxonomy_json: str,retrieved_context: str,prompt_template: str | None = None,) -> str:
    template = prompt_template or (
        "You are an expert IT Helpdesk Dispatcher. Route the NEW TICKET to the correct "
        "Department and Subcategory.\n\n"
        "CRITICAL RULES:\n"
        "1. You MUST select a department_id and subcategory_id from the VALID TAXONOMY MAP below.\n"
        "2. Do NOT invent IDs. If unsure, use the 'OTHERS' subcategory_id for the most likely "
        "department.\n"
        "3. Output EXACTLY a valid JSON object. No markdown block quotes. No extra text.\n\n"
        "VALID TAXONOMY MAP:\n{taxonomy_json}\n\n"
        "REQUIRED JSON SCHEMA:\n"
        "{{\n"
        '  "department_id": integer,\n'
        '  "subcategory_id": integer,\n'
        '  "department_name": "string",\n'
        '  "subcategory_name": "string",\n'
        '  "confidence": float (0.0 to 1.0),\n'
        '  "reasoning": "string" (1-sentence technical explanation)\n'
        "}}\n\n"
        "NEW TICKET:\nTITLE: {summary}\nDESC: {description}\n\n"
        "HISTORICAL TICKETS FOR CONTEXT:\n{retrieved_context}\n\n"
        "JSON OUTPUT:"
    )

    return template.format(summary=summary,description=description,taxonomy_json=taxonomy_json,retrieved_context=retrieved_context)

# =========================================================
# CONVERSATION RESOLUTION
# =========================================================
CONVERSATION_RESOLUTION_PROMPT = """
You are a conversation resolution analyzer for an IT Helpdesk AI assistant.
Your job is to determine the current state of the troubleshooting session based on:
- the latest user message
- the AI response
- recent conversation history

You MUST return ONLY valid JSON.
Rules:
1. Be conservative.
2. Only mark "conversation_status" as "resolved_candidate" if the user strongly implies:
  - satisfaction, completion, success, or gratitude after a solution.
3. Set "show_resolution_prompt" to true ONLY if "conversation_status" is "resolved_candidate".
4. Set "allow_ticket_submission" to true if:
  - the issue is still ongoing and unsolved.
  - AND ESPECIALLY if the AI response indicates a dead end or advises the user to contact IT (e.g., "pa-check sa IT", "kailangan ma-check ng Helpdesk").
  Set it to false if the issue is completely resolved.

Return EXACTLY this JSON schema:
{{
  "show_resolution_prompt": boolean,
  "allow_ticket_submission": boolean,
  "conversation_status": "active" | "resolved_candidate",
  "resolution_confidence": float
}}

Conversation History:
{chat_history}

Latest User Message:
{user_query}

AI Response:
{ai_response}

JSON Output:
"""

# =========================================================
# KNOWLEDGE CONSOLIDATION
# =========================================================
def build_consolidation_prompt(cluster_payloads: list[str]) -> str:
    combined = "\n\n---\n\n".join(cluster_payloads)
    return (
        "You are an Expert IT Knowledge Base Editor. Read the following similar IT "
        "support tickets. "
        "Merge them into a single, comprehensive 'Master Troubleshooting Guide'.\n"
        "Extract the core issue, the common root cause, and the definitive resolution "
        "steps.\n"
        "Output ONLY the finalized guide text. Do not use markdown blocks.\n\n"
        f"TICKETS TO MERGE:\n{combined}"
    )


def build_document_classifier_prompt(snippet: str,allowed_categories: str,) -> str:
        return (
            "You are an IT categorization AI. "
            "Read this document snippet:\n\n"
            "{snippet}\n\n"
            "Categorize it into EXACTLY ONE of these categories:\n"
            "{allowed_categories}\n\n"
            "Reply with ONLY the exact category name. "
            "Do not add punctuation or extra words."
        ).format(
            snippet=snippet,
            allowed_categories=allowed_categories,
        )
