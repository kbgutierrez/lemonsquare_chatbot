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

/* API */
export const API_CONFIG = {
  BASE_URL:
    "http://localhost:5000/api",

  TIMEOUT: 30000,
}

/* ENDPOINTS */
export const API_ENDPOINTS = {
  /* Upload */
  UPLOAD:
    "/upload",

  UPLOAD_STATUS:
    "/upload/status",

  /* Files */
  FILES:
    "/files",

  FILE_DELETE:
    "/files/:id/delete",

  FILES_BY_CATEGORY:
    "/files/category/:categoryId",

  /* Categories */
  CATEGORIES:
    "/categories",

  CATEGORY_CREATE:
    "/categories/create",

  CATEGORY_DELETE:
    "/categories/:id/delete",

  /* Chat */
  CHAT_SEND:
    "/chat/send",

  CHAT_HISTORY:
    "/chat/history/:sessionId",

  CHAT_RESOLVE:
    "/chat/resolve/:sessionId",

  /* Tickets */
  TICKETS:
    "/tickets",

  TICKET_CREATE:
    "/tickets/create",

  TICKET_UPDATE:
    "/tickets/:id/update",

  /* AI SETTINGS */
  AI_SETTINGS:
    "/settings/ai",

  AI_SETTINGS_UPDATE:
    "/settings/ai/update",
}

/* SQL TABLES */
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

/* AI DEFAULTS */
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

/* SESSION DEFAULTS */
export const SESSION_DEFAULTS = {
  SessionStatus:
    "active",

  IsActive: true,
}

/* URL BUILDER */
export const buildApiUrl = (
  endpoint,
  params = {}
) => {

  let url =
    API_CONFIG.BASE_URL +
    endpoint

  Object.entries(params).forEach(
    ([key, value]) => {

      url = url.replace(
        `:${key}`,
        value
      )
    }
  )

  return url
}