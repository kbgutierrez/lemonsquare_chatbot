/**
 * Centralized configuration for future backend API integration
 * All backend references should use these variables
 * This enables easy migration when moving from mock data to live API
 */

export const SQL_VARIABLES = {
  // API Configuration
  API_BASE_URL: "http://localhost:5000/api",
  
  // Upload Endpoints
  UPLOAD_ENDPOINT: "/upload",
  UPLOAD_STATUS_ENDPOINT: "/upload/status",
  
  // Files Endpoints
  FILES_ENDPOINT: "/files",
  FILES_DELETE_ENDPOINT: "/files/:id/delete",
  FILES_BY_CATEGORY_ENDPOINT: "/files/category/:categoryId",
  
  // Categories Endpoints
  CATEGORY_ENDPOINT: "/categories",
  CATEGORY_CREATE_ENDPOINT: "/categories/create",
  CATEGORY_DELETE_ENDPOINT: "/categories/:id/delete",
  
  // Chat Endpoints
  CHAT_SEND_ENDPOINT: "/chat/send",
  CHAT_HISTORY_ENDPOINT: "/chat/history/:sessionId",
  
  // AI Settings Endpoints
  AI_SETTINGS_ENDPOINT: "/settings/ai",
  AI_SETTINGS_UPDATE_ENDPOINT: "/settings/ai/update",
  
  // Database Table Names (for documentation)
  CHAT_SESSION_TABLE: "ChatSession",
  CHAT_MESSAGE_TABLE: "ChatMessage",
  KNOWLEDGE_FILE_TABLE: "KnowledgeFile",
  KNOWLEDGE_CATEGORY_TABLE: "KnowledgeCategory",
  AI_SETTINGS_TABLE: "AIChatbot_Settings"
};

/**
 * Helper function to build full API URLs
 * Usage: buildApiUrl(SQL_VARIABLES.FILES_ENDPOINT, {id: '123'})
 */
export const buildApiUrl = (endpoint, params = {}) => {
  let url = SQL_VARIABLES.API_BASE_URL + endpoint;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });
  return url;
};
