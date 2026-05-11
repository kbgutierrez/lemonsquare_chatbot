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

/* ========================================
   TEMP USER TOKEN
   Replace later with real auth token
======================================== */

const USER_TOKEN =
  localStorage.getItem(
    "user_token"
  ) || "TEST_USER_1"

/* ========================================
   SEND MESSAGE
======================================== */

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

      user_token:
        USER_TOKEN,
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

    /* ERROR */
    if (!response.ok) {

      let errorMessage =
        "Failed to send message"

      try {

        const error =
          await response.json()

        errorMessage =
          error.detail ||
          errorMessage

      } catch {

        console.error(
          "FAILED_TO_PARSE_ERROR_RESPONSE"
        )
      }

      throw new Error(
        errorMessage
      )
    }

    return response.json()
  }

/* ========================================
   LOAD SESSION
======================================== */

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

    const finalUrl =
      `${endpoint}?user_token=${USER_TOKEN}`

    console.log(
      "LOAD_SESSION",
      {
        SessionID,
      }
    )

    console.log(
      "API_ENDPOINT",
      finalUrl
    )

    const response =
      await fetch(
        finalUrl
      )

    /* ERROR */
    if (!response.ok) {

      let errorMessage =
        "Failed to load session"

      try {

        const error =
          await response.json()

        errorMessage =
          error.detail ||
          errorMessage

      } catch {

        console.error(
          "FAILED_TO_PARSE_ERROR_RESPONSE"
        )
      }

      throw new Error(
        errorMessage
      )
    }

    return response.json()
  }

/* ========================================
   CLEAR SESSION
======================================== */

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

/* ========================================
   LOAD AI SETTINGS
======================================== */

const loadAISettings =
  async () => {

    return {
      success: true,
    }
  }

/* ========================================
   EXPORT
======================================== */

const chatbotService = {
  sendMessage,

  loadSession,

  clearSession,

  loadAISettings,
}

export default chatbotService