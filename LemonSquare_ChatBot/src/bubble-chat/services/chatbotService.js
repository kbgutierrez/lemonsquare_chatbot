import {
  API_ENDPOINTS,
  AI_DEFAULTS,
  SESSION_DEFAULTS,
  buildApiUrl,
} from "../../config/sqlVariables"

/*
  CHATBOT SERVICE

  FUTURE SAFE:
  - OpenAI
  - Groq
  - Ollama
  - RAG
  - streaming
  - embeddings
  - reranking
  - reformulation
  - websocket support
  - SQL logging
*/

/* SEND MESSAGE */
const sendMessage =
  async ({
    SessionID,

    SenderRole = "user",

    MessageContent,

    ActiveModel = AI_DEFAULTS.ActiveModel,

    Temperature = AI_DEFAULTS.Temperature,

    UseReformulator = AI_DEFAULTS.UseReformulator,

    UseReranker = AI_DEFAULTS.UseReranker,
  }) => {

    const payload = {
      SessionID,

      SenderRole,

      MessageContent,

      CreatedAt:
        new Date().toISOString(),

      /* AI SETTINGS */
      ActiveModel,

      Temperature,

      UseReformulator,

      UseReranker,
    }

    console.log(
      "SEND_MESSAGE_PAYLOAD",
      payload
    )

    console.log(
      "API_ENDPOINT",
      buildApiUrl(
        API_ENDPOINTS.CHAT_SEND
      )
    )

    /*
      FUTURE:
      return await fetch(...)
    */

    return {
      success: true,

      response:
        "PLACEHOLDER_AI_RESPONSE",

      payload,
    }
  }

/* LOAD SESSION */
const loadSession =
  async (SessionID) => {

    console.log(
      "LOAD_SESSION",
      {
        SessionID,
      }
    )

    console.log(
      "API_ENDPOINT",
      buildApiUrl(
        API_ENDPOINTS.CHAT_HISTORY,
        {
          sessionId:
            SessionID,
        }
      )
    )

    return {
      success: true,

      session: {
        SessionID,

        SessionStatus:
          SESSION_DEFAULTS.SessionStatus,

        IsActive:
          SESSION_DEFAULTS.IsActive,
      },
    }
  }

/* CLEAR SESSION */
const clearSession =
  async (SessionID) => {

    console.log(
      "CLEAR_SESSION",
      {
        SessionID,
      }
    )

    console.log(
      "API_ENDPOINT",
      buildApiUrl(
        API_ENDPOINTS.CHAT_RESOLVE,
        {
          sessionId:
            SessionID,
        }
      )
    )

    return {
      success: true,
    }
  }

/* LOAD AI SETTINGS */
const loadAISettings =
  async () => {

    console.log(
      "LOAD_AI_SETTINGS"
    )

    console.log(
      "API_ENDPOINT",
      buildApiUrl(
        API_ENDPOINTS.AI_SETTINGS
      )
    )

    return {
      success: true,

      settings:
        AI_DEFAULTS,
    }
  }

const chatbotService = {
  sendMessage,

  loadSession,

  clearSession,

  loadAISettings,
}

export default chatbotService