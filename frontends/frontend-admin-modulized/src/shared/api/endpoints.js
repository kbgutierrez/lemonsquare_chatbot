export const API_ENDPOINTS = {
  AUTH_VERIFY: "/api/auth/verify",

  LSBIZPORTAL_LOGIN:
    "/api/admin/login",

  ANALYTICS_SUMMARY:
    "/api/analytics/summary",

  DOCUMENTS:
    "/api/documents",

  DOCUMENT_UPLOAD:
    "/api/documents/upload",

  DOCUMENT_DELETE:
    "/api/documents/:documentId",

  DOCUMENT_DEBUG_PIPELINE:
    "/api/documents/debug/full-pipeline",

  DOCUMENT_MANUAL_ENTRY:
    "/api/documents/manual",

  DOCUMENT_MANUAL_ENTRY_UPDATE:
    "/api/documents/manual/:entryId",

  DOCUMENT_MANUAL_ENTRY_DELETE:
    "/api/documents/manual/:entryId",

  KNOWLEDGE_EXPLORE:
    "/api/knowledge/explore",

  CHAT_SEND:
    "/api/chat",

  CHAT_HISTORY:
    "/api/chat/history/:sessionId",

  CHAT_USER_SESSIONS:
    "/api/chat/user-sessions/:requesterId",

  CHAT_RESOLVE:
    "/api/chat/resolve/:sessionId",

  CHAT_DELETE_SESSION:
    "/api/chat/sessions/:sessionId",

  CHAT_CLEAR_ALL:
    "/api/chat/users/:requesterId/sessions",

  SELF_KNOWLEDGE_UPDATE:
    "/api/self_knowledge/chats/:sessionId",

  SELF_KNOWLEDGE_DELETE:
    "/api/self_knowledge/chats/:sessionId",

  TICKETS:
    "/api/tickets",

  TICKET_DELETE:
    "/api/tickets/:ticketNumber",

  TICKET_SYNC:
    "/api/tickets/sync",

  TICKET_WHITELIST:
    "/api/tickets/:ticketNumber/whitelist",

  AI_SETTINGS:
    "/api/settings",
}

export default API_ENDPOINTS