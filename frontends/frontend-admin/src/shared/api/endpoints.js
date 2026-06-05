export const API_ENDPOINTS = {
  /* ====================================
     AUTH
  ==================================== */

  AUTH_VERIFY:
    "/auth/verify",

  LSBIZPORTAL_LOGIN:
    "/admin/login",

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

  DOCUMENT_UPLOAD_STATUS:
    "/documents/upload/status/:jobId",

  DOCUMENT_DELETE:
    "/documents/:documentId",

  DOCUMENT_RESTORE:
    "/documents/:documentId/restore",

  DOCUMENT_DEBUG_PIPELINE:
    "/documents/debug/full-pipeline",

  DOCUMENT_MANUAL_ENTRY:
    "/documents/manual",

  DOCUMENT_MANUAL_ENTRY_UPDATE:
    "/documents/manual/:entryId",

  DOCUMENT_MANUAL_ENTRY_DELETE:
    "/documents/manual/:entryId",

  DOCUMENT_MANUAL_ENTRY_HARD_DELETE:
    "/documents/manual/hard/:entryId",

  DOCUMENT_MANUAL_ENTRY_RESTORE:
    "/documents/manual/:entryId/restore",

  DOCUMENT_HARD_DELETE:
    "/documents/hard/:documentId",  
    
  MAINTENANCE_WIPE_ALL:
    "/maintenance/wipe-all",  

  /* ====================================
     KNOWLEDGE EXPLORER
  ==================================== */

  KNOWLEDGE_EXPLORE:
    "/knowledge/explore",
  
  KNOWLEDGE_EXPORT_LEARNED_CHATS:
  "/knowledge/export/learned-chats",  

  KNOWLEDGE_EXPORT_LEARNED_CHATS:
    "/knowledge/export/learned-chats",  

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

  SELF_KNOWLEDGE_RESTORE:
    "/self_knowledge/chats/:sessionId/restore",

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

  AI_FACTORY_DEFAULTS:
    "/settings/factory-defaults",

  MODELS_GROQ:
    "/models/groq",
}

export default API_ENDPOINTS