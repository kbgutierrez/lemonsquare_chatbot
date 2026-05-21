const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000/ws",
  APP_ENV: import.meta.env.MODE || "development",
}

export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL.replace(/\/$/, ""),
  TIMEOUT: 300000,
  CACHE_DURATION: 1000 * 20,
  POLLING_INTERVAL: 1000 * 15,
  SILENT_REFRESH: true,
  ENABLE_CACHE: true,
  HEADERS: { "Content-Type": "application/json" },
}

export const WS_CONFIG = {
  BASE_URL: ENV.WS_BASE_URL.replace(/\/$/, ""),
  RECONNECT_INTERVAL: 3000,
  MAX_RETRIES: 10,
}

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

if (ENV.APP_ENV === "development") {
  console.log("API_BASE_URL:", API_CONFIG.BASE_URL)
}
