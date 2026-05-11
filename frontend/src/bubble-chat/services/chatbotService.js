import {
  API_ENDPOINTS,
  buildApiUrl,
} from "../../config/sqlVariables"

/*
  CHATBOT SERVICE

  CONNECTED TO:
  - FastAPI
  - SQL Server
  - AI Orchestrator
  - Qdrant
*/

const sendMessage =
  async ({
    SessionID,

    MessageContent,
  }) => {

    const payload = {
      session_id:
        SessionID,

      message:
        MessageContent,
    }

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.CHAT_SEND
      )

    console.log(
      "SEND_MESSAGE_PAYLOAD",
      payload
    )

    console.log(
      "API_ENDPOINT",
      endpoint
    )

    const response =
      await fetch(
        endpoint,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              payload
            ),
        }
      )

    if (!response.ok) {

      const error =
        await response.json()

      throw new Error(
        error.detail ||
        "Failed to send message"
      )
    }

    return response.json()
  }

/* LOAD SESSION */
const loadSession =
  async (
    SessionID
  ) => {

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.CHAT_HISTORY,
        {
          sessionId:
            SessionID,
        }
      )

    console.log(
      "LOAD_SESSION",
      {
        SessionID,
      }
    )

    console.log(
      "API_ENDPOINT",
      endpoint
    )

    const response =
      await fetch(
        endpoint
      )

    if (!response.ok) {

      throw new Error(
        "Failed to load session"
      )
    }

    return response.json()
  }

/* CLEAR SESSION */
const clearSession =
  async (
    SessionID
  ) => {

    console.log(
      "CLEAR_SESSION",
      {
        SessionID,
      }
    )

    return {
      success: true,
    }
  }

/* LOAD AI SETTINGS */
const loadAISettings =
  async () => {

    return {
      success: true,
    }
  }

const chatbotService = {
  sendMessage,

  loadSession,

  clearSession,

  loadAISettings,
}

export default chatbotService