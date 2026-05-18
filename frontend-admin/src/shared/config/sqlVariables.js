/*
  CENTRALIZED APP CONFIG

  Future-safe for:
  - SQL Server
  - REST API
  - WebSockets
  - RAG
  - AI Models
  - Admin Dashboard
*/

/* ========================================
   ENVIRONMENT
======================================== */

const ENV = {
  API_BASE_URL:
    import.meta.env
      .VITE_API_BASE_URL ||
    "/api",

  WS_BASE_URL:
    import.meta.env
      .VITE_WS_BASE_URL ||
    "/ws",

  APP_ENV:
    import.meta.env.MODE ||
    "development",
}

/* ========================================
   API CONFIG
======================================== */

export const API_CONFIG = {
  BASE_URL:
    ENV.API_BASE_URL.replace(
      /\/$/,
      ""
    ),

  TIMEOUT: 30000,

  /* ========================================
     REALTIME / CACHE
  ======================================== */

  CACHE_DURATION:
    1000 * 20,

  POLLING_INTERVAL:
    1000 * 15,

  SILENT_REFRESH:
    true,

  ENABLE_CACHE:
    true,

  ENABLE_REQUEST_DEDUPE:
    true,

  ENABLE_BACKGROUND_SYNC:
    true,

  HEADERS: {
    "Content-Type":
      "application/json",
  },
}

/* ========================================
   WEBSOCKET CONFIG
======================================== */

export const WS_CONFIG = {
  BASE_URL:
    ENV.WS_BASE_URL.replace(
      /\/$/,
      ""
    ),

  RECONNECT_INTERVAL:
    3000,

  MAX_RETRIES: 10,
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
   PERFORMANCE FLAGS
======================================== */

export const PERFORMANCE_CONFIG =
  {
    ENABLE_MEMOIZATION:
      true,

    ENABLE_PERSISTENCE:
      true,

    ENABLE_OPTIMISTIC_UPDATES:
      true,

    ENABLE_SILENT_REFRESH:
      true,

    ENABLE_BACKGROUND_SYNC:
      true,

    LIST_VIRTUALIZATION_THRESHOLD:
      100,
  }

/* ========================================
   DEBUG LOGGING
======================================== */

if (
  ENV.APP_ENV ===
  "development"
) {

  console.log(
    "API_BASE_URL:",
    API_CONFIG.BASE_URL
  )

  console.log(
    "APP_ENV:",
    ENV.APP_ENV
  )

  console.log(
    "CACHE_DURATION:",
    API_CONFIG.CACHE_DURATION
  )

  console.log(
    "POLLING_INTERVAL:",
    API_CONFIG.POLLING_INTERVAL
  )
}