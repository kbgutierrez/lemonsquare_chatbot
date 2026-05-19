export const API_ENDPOINTS = {
  /* ====================================
     AUTH
  ==================================== */

  AUTH_VERIFY:
    "/api/auth/verify",

  // ✅ FIXED
  // Backend route:
  // app.include_router(admin_auth.router, prefix="/api")
  // router.prefix("/admin")
  // final => /api/admin/login
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
    "/self_knowledge/chats/:sessionId",

  SELF_KNOWLEDGE_DELETE:
    "/self_knowledge/chats/:sessionId",

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
}

export default API_ENDPOINTS