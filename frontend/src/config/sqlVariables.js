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
    import.meta.env.VITE_API_BASE_URL ||
    "/api",

  WS_BASE_URL:
    import.meta.env.VITE_WS_BASE_URL ||
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
}

/* ========================================
   ENDPOINTS
======================================== */

export const API_ENDPOINTS = {

  /* ====================================
     DOCUMENTS
  ==================================== */

  DOCUMENTS:
    "/documents",

  DOCUMENT_UPLOAD:
    "/documents/upload",

  DOCUMENT_DELETE:
    "/documents/:documentId",

  DOCUMENT_TEST_SEARCH:
    "/documents/test-search",

  DOCUMENT_DEBUG_PIPELINE:
    "/documents/debug/full-pipeline",

  /* ====================================
     CHAT
  ==================================== */

  CHAT_SEND:
    "/chat",

  CHAT_HISTORY:
    "/chat/history/:sessionId",

  CHAT_DEBUG:
    "/chat/debug",

  /* ====================================
     TICKETS
  ==================================== */

  TICKETS:
    "/tickets",

  TICKET_DELETE:
    "/tickets/:ticketNumber",

  TICKET_SYNC:
    "/tickets/sync",

  /* ====================================
     AI SETTINGS
  ==================================== */

  AI_SETTINGS:
    "/settings",
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
   BUILD API URL
======================================== */

export const buildApiUrl = (
  endpoint,
  params = {}
) => {

  let url =
    `${API_CONFIG.BASE_URL}${endpoint}`

  Object.entries(params).forEach(
    ([key, value]) => {

      url = url.replace(
        `:${key}`,
        encodeURIComponent(
          value
        )
      )
    }
  )

  return url
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
}