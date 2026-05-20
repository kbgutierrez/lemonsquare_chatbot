/*
  CENTRALIZED APP CONFIG

  Production-safe configuration layer
*/

const ENV = {
  // 🚨 IMPORTANT FIX:  
  // REMOVE /api from BASE URL to prevent /api/api duplication
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8000", // ✅ FIXED (NO /api HERE)

  WS_BASE_URL:
    import.meta.env.VITE_WS_BASE_URL ||
    "ws://localhost:8000/ws",

  APP_ENV:
    import.meta.env.MODE ||
    "development",
}

/* ========================================
   API CONFIG
======================================== */

export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL.replace(/\/$/, ""),

  TIMEOUT: 300000,

  CACHE_DURATION: 1000 * 20,
  POLLING_INTERVAL: 1000 * 15,

  SILENT_REFRESH: true,
  ENABLE_CACHE: true,
  ENABLE_REQUEST_DEDUPE: true,
  ENABLE_BACKGROUND_SYNC: true,

  HEADERS: {
    "Content-Type": "application/json",
  },
}

/* ========================================
   API ENDPOINTS
======================================== */

export const API_ENDPOINTS = {
  /* AUTH */
  AUTH_VERIFY: "/auth/verify",

  // Admin login (FastAPI proxy → /api/admin/login)
  LSBIZPORTAL_LOGIN: "/admin/login",

  /* ANALYTICS */
  ANALYTICS_SUMMARY: "/analytics/summary",

  /* DOCUMENTS */
  DOCUMENTS: "/documents",
  DOCUMENT_UPLOAD: "/documents/upload",
  DOCUMENT_DELETE: "/documents/:documentId",
  DOCUMENT_DEBUG_PIPELINE: "/documents/debug/full-pipeline",
  DOCUMENT_MANUAL_ENTRY: "/documents/manual",
  DOCUMENT_MANUAL_ENTRY_UPDATE: "/documents/manual/:entryId",
  DOCUMENT_MANUAL_ENTRY_DELETE: "/documents/manual/:entryId",

  /* KNOWLEDGE */
  KNOWLEDGE_EXPLORE: "/knowledge/explore",

  /* CHAT */
  CHAT_SEND: "/chat",
  CHAT_HISTORY: "/chat/history/:sessionId",
  CHAT_USER_SESSIONS: "/chat/user-sessions/:requesterId",
  CHAT_RESOLVE: "/chat/resolve/:sessionId",
  CHAT_DELETE_SESSION: "/chat/sessions/:sessionId",
  CHAT_CLEAR_ALL: "/chat/users/:requesterId/sessions",

  /* SELF KNOWLEDGE */
  SELF_KNOWLEDGE_UPDATE: "/self_knowledge/chats/:sessionId",
  SELF_KNOWLEDGE_DELETE: "/self_knowledge/chats/:sessionId",

  /* TICKETS */
  TICKETS: "/tickets",
  TICKET_DELETE: "/tickets/:ticketNumber",
  TICKET_SYNC: "/tickets/sync",
  TICKET_WHITELIST: "/tickets/:ticketNumber/whitelist",

  /* AI SETTINGS */
  AI_SETTINGS: "/settings",
}

/* ========================================
   WEBSOCKET CONFIG
======================================== */

export const WS_CONFIG = {
  BASE_URL:
    ENV.WS_BASE_URL.replace(/\/$/, ""),

  RECONNECT_INTERVAL: 3000,
  MAX_RETRIES: 10,
}

/* ========================================
   AI DEFAULTS
======================================== */

export const AI_DEFAULTS = {
  ActiveModel: "llama-3.3-70b-versatile",
  EmbeddingModel: "multilingual-e5-large",
  ReformulatorModel: "llama-3.1-8b-instruct",
  RerankerModel: "bge-reranker-large",

  Temperature: 0.7,
  TopK_Tickets: 5,
  ConfidenceThreshold: 0.75,

  UseReformulator: true,
  UseReranker: true,
}

/* ========================================
   SESSION DEFAULTS
======================================== */

export const SESSION_DEFAULTS = {
  SessionStatus: "active",
  IsActive: true,
}

/* ========================================
   DEBUG
======================================== */

if (ENV.APP_ENV === "development") {
  console.log("API_BASE_URL:", API_CONFIG.BASE_URL)
  console.log("APP_ENV:", ENV.APP_ENV)
}