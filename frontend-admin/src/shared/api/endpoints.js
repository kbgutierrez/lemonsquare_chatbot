export const API_ENDPOINTS = {
  /* ====================================
     AUTH
  ==================================== */

  AUTH_VERIFY:
    "/auth/verify",

  /* ====================================
     ANALYTICS
  ==================================== */

  ANALYTICS_SUMMARY:
    "/analytics/summary",

  /* ====================================
     DOCUMENTS
  ==================================== */

  DOCUMENTS:
    "/documents",

  DOCUMENT_UPLOAD:
    "/documents/upload",

  DOCUMENT_DELETE:
    "/documents/:documentId",

  DOCUMENT_DEBUG_PIPELINE:
    "/documents/debug/full-pipeline",

  DOCUMENT_MANUAL_ENTRY:
    "/documents/manual",

  DOCUMENT_MANUAL_ENTRY_UPDATE:
    "/documents/manual/:entryId",

  DOCUMENT_MANUAL_ENTRY_DELETE:
    "/documents/manual/:entryId",

  /* ====================================
     KNOWLEDGE EXPLORER
  ==================================== */

  KNOWLEDGE_EXPLORE:
    "/knowledge/explore",

  /* ====================================
     CHAT
  ==================================== */

  CHAT_SEND:
    "/chat",

  CHAT_HISTORY:
    "/chat/history/:sessionId",

  CHAT_USER_SESSIONS:
    "/chat/user-sessions/:requesterId",

  CHAT_RESOLVE:
    "/chat/resolve/:sessionId",

  /* ====================================
     SELF KNOWLEDGE
  ==================================== */

  SELF_KNOWLEDGE_UPDATE:
    "/self_knowledge/chats/:sessionId",

  SELF_KNOWLEDGE_DELETE:
    "/self_knowledge/chats/:sessionId",

  /* ====================================
     TICKETS
  ==================================== */

  TICKETS:
    "/tickets",

  TICKET_DELETE:
    "/tickets/:ticketNumber",

  TICKET_SYNC:
    "/tickets/sync",

  TICKET_WHITELIST:
    "/tickets/:ticketNumber/whitelist",

  /* ====================================
     AI SETTINGS
  ==================================== */

  AI_SETTINGS:
    "/settings",
}

export default API_ENDPOINTS