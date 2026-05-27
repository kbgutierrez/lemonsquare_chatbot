export const API_ENDPOINTS = {
  /* ====================================
     AUTH
  ==================================== */

  AUTH_VERIFY:
    "/api/auth/verify",

  LSBIZPORTAL_LOGIN:
    "/api/admin/login",

  /* ====================================
     ANALYTICS
  ==================================== */

  ANALYTICS_SUMMARY:
    "/api/analytics/summary",

  /* ====================================
     DOCUMENTS
  ==================================== */

  DOCUMENTS:
    "/api/documents",

  DOCUMENT_UPLOAD:
    "/api/documents/upload",

  DOCUMENT_UPLOAD_STATUS:
    "/api/documents/upload/status/:jobId",

  DOCUMENT_DELETE:
    "/api/documents/:documentId",

  DOCUMENT_RESTORE:
    "/api/documents/:documentId/restore",

  DOCUMENT_DEBUG_PIPELINE:
    "/api/documents/debug/full-pipeline",

  DOCUMENT_MANUAL_ENTRY:
    "/api/documents/manual",

  DOCUMENT_MANUAL_ENTRY_UPDATE:
    "/api/documents/manual/:entryId",

  DOCUMENT_MANUAL_ENTRY_DELETE:
    "/api/documents/manual/:entryId",

  DOCUMENT_MANUAL_ENTRY_RESTORE:
    "/api/documents/manual/:entryId/restore",

  /* ====================================
     KNOWLEDGE EXPLORER
  ==================================== */

  KNOWLEDGE_EXPLORE:
    "/api/knowledge/explore",

  /* ====================================
     CHAT
  ==================================== */

  CHAT_SEND:
    "/api/chat",

  CHAT_HISTORY:
    "/api/chat/history/:sessionId",

  CHAT_USER_SESSIONS:
    "/api/chat/user-sessions/:requesterId",

  CHAT_RESOLVE:
    "/api/chat/resolve/:sessionId",

  /* ====================================
     SELF KNOWLEDGE
  ==================================== */

  SELF_KNOWLEDGE_UPDATE:
    "/api/self_knowledge/chats/:sessionId",

  SELF_KNOWLEDGE_DELETE:
    "/api/self_knowledge/chats/:sessionId",

  SELF_KNOWLEDGE_RESTORE:
    "/api/self_knowledge/chats/:sessionId/restore",

  /* ====================================
     TICKETS
  ==================================== */

  TICKETS:
    "/api/tickets",

  TICKET_DELETE:
    "/api/tickets/:ticketNumber",

  TICKET_SYNC:
    "/api/tickets/sync",

  TICKET_WHITELIST:
    "/api/tickets/:ticketNumber/whitelist",

  /* ====================================
     AI SETTINGS
  ==================================== */

  AI_SETTINGS:
    "/api/settings",

  MODELS_GROQ:
    "/api/models/groq",
}

export default API_ENDPOINTS