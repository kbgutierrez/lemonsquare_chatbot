/*
  AI MODEL CONFIGURATION

  SAFE FOR:
  - SQL
  - Groq
  - HuggingFace
  - Qdrant
  - LangChain
  - RAG Pipelines
*/

/* ========================================
   MAIN AI MODELS
======================================== */

export const aiModels = [
  {
    id:
      "llama-3-3-70b-versatile",

    name:
      "llama-3.3-70b-versatile",

    description:
      "Meta Llama 3.3 70B versatile reasoning model with strong all-around performance.",

    Provider:
      "Groq",

    ActiveModel:
      "llama-3.3-70b-versatile",

    EmbeddingModel:
      "intfloat/multilingual-e5-large",

    ReformulatorModel:
      "llama-3.1-8b-instant",

    RerankerModel:
      "BAAI/bge-reranker-v2-m3",

    SupportsRAG: true,

    SupportsTools: true,

    SupportsStreaming: true,

    SupportsVision: false,

    ContextWindow:
      128000,

    RecommendedTemperature:
      0.3,
  },

  {
    id:
      "llama-3-1-8b-instant",

    name:
      "llama-3.1-8b-instant",

    description:
      "Fast lightweight Groq model optimized for quick inference and reformulation tasks.",

    Provider:
      "Groq",

    ActiveModel:
      "llama-3.1-8b-instant",

    EmbeddingModel:
      "intfloat/multilingual-e5-large",

    ReformulatorModel:
      "llama-3.1-8b-instant",

    RerankerModel:
      "BAAI/bge-reranker-v2-m3",

    SupportsRAG: true,

    SupportsTools: true,

    SupportsStreaming: true,

    SupportsVision: false,

    ContextWindow:
      128000,

    RecommendedTemperature:
      0.2,
  },

  {
    id:
      "mixtral-8x7b-32768",

    name:
      "mixtral-8x7b-32768",

    description:
      "Mixture-of-experts model with long context support and balanced reasoning.",

    Provider:
      "Groq",

    ActiveModel:
      "mixtral-8x7b-32768",

    EmbeddingModel:
      "intfloat/multilingual-e5-large",

    ReformulatorModel:
      "llama-3.1-8b-instant",

    RerankerModel:
      "BAAI/bge-reranker-v2-m3",

    SupportsRAG: true,

    SupportsTools: true,

    SupportsStreaming: true,

    SupportsVision: false,

    ContextWindow:
      32768,

    RecommendedTemperature:
      0.4,
  },

  {
    id:
      "gemma2-9b-it",

    name:
      "gemma2-9b-it",

    description:
      "Google Gemma 2 instruction-tuned model optimized for lightweight assistant tasks.",

    Provider:
      "Google",

    ActiveModel:
      "gemma2-9b-it",

    EmbeddingModel:
      "intfloat/multilingual-e5-large",

    ReformulatorModel:
      "gemma2-9b-it",

    RerankerModel:
      "BAAI/bge-reranker-v2-m3",

    SupportsRAG: true,

    SupportsTools: false,

    SupportsStreaming: true,

    SupportsVision: false,

    ContextWindow:
      32000,

    RecommendedTemperature:
      0.5,
  },
]

/* ========================================
   DROPDOWN OPTIONS
======================================== */

export const llmOptions =
  aiModels.map((model) => ({
    label:
      model.name,

    value:
      model.name,
  }))

/* ========================================
   EMBEDDING MODELS
======================================== */

export const embeddingModels = [
  {
    label:
      "intfloat/multilingual-e5-large",

    value:
      "intfloat/multilingual-e5-large",
  },

  {
    label:
      "BAAI/bge-large-en-v1.5",

    value:
      "BAAI/bge-large-en-v1.5",
  },

  {
    label:
      "BAAI/bge-small-en-v1.5",

    value:
      "BAAI/bge-small-en-v1.5",
  },
]

/* ========================================
   RERANKER MODELS
======================================== */

export const rerankerModels = [
  {
    label:
      "BAAI/bge-reranker-v2-m3",

    value:
      "BAAI/bge-reranker-v2-m3",
  },

  {
    label:
      "BAAI/bge-reranker-large",

    value:
      "BAAI/bge-reranker-large",
  },

  {
    label:
      "BAAI/bge-reranker-base",

    value:
      "BAAI/bge-reranker-base",
  },
]

/* ========================================
   DEFAULT SETTINGS
======================================== */

export const defaultAISettings =
  {
    ActiveModel:
      "llama-3.3-70b-versatile",

    SystemPrompt:
      "You are a helpful AI support assistant.",

    Temperature: 0.3,

    IsActive: true,

    CreatedDate:
      new Date().toISOString(),

    UpdatedBy:
      "ADMIN",

    EmbeddingModel:
      "intfloat/multilingual-e5-large",

    TopK_Tickets: 5,

    ReformulatorModel:
      "llama-3.1-8b-instant",

    ReformulatorPrompt:
      "Rewrite the user's question for retrieval accuracy.",

    ConfidenceThreshold:
      0.72,

    RerankerModel:
      "BAAI/bge-reranker-v2-m3",

    UseReformulator: true,

    UseReranker: true,

    AllowedCategories:
      "",
  }