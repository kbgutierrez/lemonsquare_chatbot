const ENV = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    "/bot/api",

  WS_BASE_URL:
    import.meta.env.VITE_WS_BASE_URL ||
    "/ws",

  APP_ENV:
    import.meta.env.MODE ||
    "development",
}

/* ========================================
   HELPERS
======================================== */

const cleanUrl = (
  url,
  fallback
) =>
  (url || fallback).replace(
    /\/$/,
    ""
  )

const getGlobalConfig = () =>
  typeof window === "undefined"
    ? {}
    : window.LemonSquareChatConfig ||
      {}

/* ========================================
   SDK RUNTIME CONFIG
======================================== */

const SDK_RUNTIME_CONFIG = {
  apiBaseUrl:
    ENV.API_BASE_URL,

  wsBaseUrl:
    ENV.WS_BASE_URL,

  userToken: null,

  environment:
    ENV.APP_ENV,
}

Object.assign(
  SDK_RUNTIME_CONFIG,
  getGlobalConfig()
)

/* ========================================
   RUNTIME CONFIG
======================================== */

export const getRuntimeConfig =
  () => ({
    ...SDK_RUNTIME_CONFIG,
  })

export const updateRuntimeConfig =
  (nextConfig = {}) => {

    Object.assign(
      SDK_RUNTIME_CONFIG,
      nextConfig
    )

    console.log(
      "[Bubble SDK] Runtime config updated",
      SDK_RUNTIME_CONFIG
    )
  }

/* ========================================
   API / WS CONFIG
======================================== */

export const API_CONFIG = {
  get BASE_URL() {
    return cleanUrl(
      SDK_RUNTIME_CONFIG.apiBaseUrl,
      "/api"
    )
  },

  TIMEOUT: 30000,

  HEADERS: {
    "Content-Type":
      "application/json",
  },
}

export const WS_CONFIG = {
  get BASE_URL() {
    return cleanUrl(
      SDK_RUNTIME_CONFIG.wsBaseUrl,
      "/ws"
    )
  },
}

/* ========================================
   ENDPOINTS
======================================== */

export const API_ENDPOINTS = {
  /* DOCUMENTS */
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

  /* KNOWLEDGE */
  KNOWLEDGE_EXPLORE:
    "/knowledge/explore",

  /* CHAT */
  CHAT_SEND:
    "/chat",

  CHAT_HISTORY:
    "/chat/history/:sessionId",

  CHAT_USER_SESSIONS:
    "/chat/user-sessions/:requesterId",

  CHAT_RESOLVE:
    "/chat/resolve/:sessionId",

  CHAT_CHECK_RESOLUTION:
    "/chat/:sessionId/check-resolution",

  CHAT_DELETE_SESSION:
    "/chat/sessions/:sessionId",

  CHAT_CLEAR_ALL:
    "/chat/users/:requesterId/sessions",

  /* AUTH */
  AUTH_VERIFY:
    "/auth/verify",

  /* SELF KNOWLEDGE */
  SELF_KNOWLEDGE_UPDATE:
    "/self_knowledge/chats/:sessionId",

  SELF_KNOWLEDGE_DELETE:
    "/self_knowledge/chats/:sessionId",

  /* TICKETS */
  TICKETS:
    "/tickets",

  TICKET_DELETE:
    "/tickets/:ticketNumber",

  TICKET_SYNC:
    "/tickets/sync",

  TICKET_WHITELIST:
    "/tickets/:ticketNumber/whitelist",

  /* SETTINGS */
  AI_SETTINGS:
    "/settings",

  THEME_GET:
    "/settings/theme",

  THEME_UPDATE:
    "/settings/theme",
}

/* ========================================
   SQL TABLES
======================================== */

export const SQL_TABLES = {
  CHAT_SESSION:
    "ChatSession",

  CHAT_MESSAGE:
    "ChatMessage",

  KNOWLEDGE_FILE:
    "KnowledgeFile",

  KNOWLEDGE_CATEGORY:
    "KnowledgeCategory",

  AI_SETTINGS:
    "AIChatbot_Settings",
}

/* ========================================
   AI DEFAULTS
======================================== */

export const AI_DEFAULTS = {
  ActiveModel:
    "llama-3.3-70b-versatile",

  EmbeddingModel:
    "multilingual-e5-large",

  ReformulatorModel:
    "llama-3.1-8b-instruct",

  RerankerModel:
    "bge-reranker-large",

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
  SessionStatus:
    "active",

  IsActive: true,
}

/* ========================================
   URL BUILDER
======================================== */

export const buildApiUrl = (
  endpoint,
  params = {}
) =>
  Object.entries(params).reduce(
    (url, [key, value]) =>
      url.replace(
        `:${key}`,
        encodeURIComponent(value)
      ),

    `${API_CONFIG.BASE_URL}${endpoint}`
  )

/* ========================================
   CHAT WIDGET CONFIG
======================================== */

export const CHAT_WIDGET_CONFIG = {
  STORAGE_KEY:
    "lemonsquare_chatbot",

  DEFAULT_Z_INDEX: 9999,

  DEFAULT_POSITION: {
    bottom: 24,
    right: 24,
  },
}

/* ========================================
   DEBUG LOGGING
======================================== */

if (
  ENV.APP_ENV ===
  "development"
) {

  console.log(
    "[Bubble SDK] API_BASE_URL:",
    API_CONFIG.BASE_URL
  )

  console.log(
    "[Bubble SDK] APP_ENV:",
    ENV.APP_ENV
  )

  console.log(
    "[Bubble SDK] SDK_RUNTIME_CONFIG:",
    SDK_RUNTIME_CONFIG
  )
}