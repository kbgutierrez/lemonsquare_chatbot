/*
  AI MODEL CONFIGURATION

  SQL READY:
  - ActiveModel
  - EmbeddingModel
  - ReformulatorModel
  - RerankerModel

  FUTURE SAFE:
  - OpenAI
  - Groq
  - Ollama
  - RAG
  - reranking
  - reformulation
  - streaming
  - analytics
*/

export const aiModels = [
  {
    /* UI */
    id: "openai-gpt-oss-120b",

    name:
      "openai/gpt-oss-120b",

    description:
      "Open-weight flagship reasoning model with strong coding, tool use, and advanced reasoning capabilities.",

    /*
      SQL READY
    */
    ActiveModel:
      "openai/gpt-oss-120b",

    EmbeddingModel:
      "text-embedding-3-large",

    ReformulatorModel:
      "openai/gpt-oss-20b",

    RerankerModel:
      "bge-reranker-large",

    /*
      PROVIDER
    */
    Provider:
      "OpenAI",

    /*
      FEATURES
    */
    SupportsRAG: true,

    SupportsTools: true,

    SupportsStreaming: true,

    SupportsVision: false,

    /*
      PERFORMANCE
    */
    ContextWindow:
      128000,

    RecommendedTemperature:
      0.3,
  },

  {
    id: "llama-3-3-70b-versatile",

    name:
      "llama-3.3-70b-versatile",

    description:
      "Versatile 70B model from Meta Llama 3.3 with strong all-around performance across diverse tasks.",

    ActiveModel:
      "llama-3.3-70b-versatile",

    EmbeddingModel:
      "bge-large-en-v1.5",

    ReformulatorModel:
      "llama-3.1-8b-instruct",

    RerankerModel:
      "bge-reranker-large",

    Provider: "Groq",

    SupportsRAG: true,

    SupportsTools: true,

    SupportsStreaming: true,

    SupportsVision: false,

    ContextWindow:
      128000,

    RecommendedTemperature:
      0.4,
  },

  {
    id: "deepseek-r1-distill-qwen-32b",

    name:
      "deepseek-r1-distill-qwen-32b",

    description:
      "DeepSeek R1 reasoning model distilled for Qwen architecture with 32B parameters.",

    ActiveModel:
      "deepseek-r1-distill-qwen-32b",

    EmbeddingModel:
      "multilingual-e5-large",

    ReformulatorModel:
      "qwen/qwen3-32b",

    RerankerModel:
      "bge-reranker-large",

    Provider: "Groq",

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
    id: "qwen-qwen3-32b",

    name:
      "qwen/qwen3-32b",

    description:
      "Alibaba Qwen3 32B model with multilingual support and strong reasoning capabilities.",

    ActiveModel:
      "qwen/qwen3-32b",

    EmbeddingModel:
      "multilingual-e5-large",

    ReformulatorModel:
      "qwen/qwen3-32b",

    RerankerModel:
      "bge-reranker-large",

    Provider: "Alibaba",

    SupportsRAG: true,

    SupportsTools: true,

    SupportsStreaming: true,

    SupportsVision: false,

    ContextWindow:
      128000,

    RecommendedTemperature:
      0.4,
  },

  {
    id: "gemma2-9b-it",

    name:
      "gemma2-9b-it",

    description:
      "Google Gemma 2 9B model with instruction-tuning for improved instruction-following capabilities.",

    ActiveModel:
      "gemma2-9b-it",

    EmbeddingModel:
      "bge-small-en-v1.5",

    ReformulatorModel:
      "gemma2-9b-it",

    RerankerModel:
      "bge-reranker-base",

    Provider: "Google",

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

/*
  ADMIN SETTINGS PLACEHOLDER

  Mirrors SQL:
  AIChatbotSettings
*/

export const defaultAISettings =
  {
    ActiveModel:
      "llama-3.3-70b-versatile",

    SystemPrompt:
      "You are a helpful AI support assistant.",

    Temperature: 0.4,

    IsActive: true,

    CreatedDate:
      new Date().toISOString(),

    UpdatedBy:
      "ADMIN_PLACEHOLDER",

    EmbeddingModel:
      "multilingual-e5-large",

    TopK_Tickets: 5,

    ReformulatorModel:
      "llama-3.1-8b-instruct",

    ReformulatorPrompt:
      "Rewrite the user's question for retrieval accuracy.",

    ConfidenceThreshold:
      0.72,

    RerankerModel:
      "bge-reranker-large",

    UseReformulator: true,

    UseReranker: true,
  }