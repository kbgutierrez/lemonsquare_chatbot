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
   CONFIG
======================================== */

const REQUEST_TIMEOUT = 30000

/* ========================================
   GET USER TOKEN
======================================== */

const getUserToken = () => {

  return (
    localStorage.getItem(
      "user_token"
    ) || "TEST_USER_1"
  )
}

/* ========================================
   REQUEST HELPER
======================================== */

const apiRequest = async ({
  endpoint,
  method = "GET",
  body = null,
}) => {

  const controller =
    new AbortController()

  const timeout =
    setTimeout(() => {

      controller.abort()

    }, REQUEST_TIMEOUT)

  try {

    const response =
      await fetch(
        endpoint,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            body
              ? JSON.stringify(
                  body
                )
              : null,

          signal:
            controller.signal,
        }
      )

    console.log(
      "RAW_RESPONSE_STATUS",
      response.status
    )

    /* ========================================
       READ RAW TEXT FIRST
    ======================================== */

    const rawText =
      await response.text()

    console.log(
      "RAW_RESPONSE_TEXT",
      rawText
    )

    let responseData =
      null

    /* ========================================
       SAFE JSON PARSE
    ======================================== */

    try {

      responseData =
        rawText
          ? JSON.parse(
              rawText
            )
          : null

    } catch (parseError) {

      console.error(
        "JSON_PARSE_ERROR",
        parseError
      )

      throw new Error(
        "Backend returned invalid JSON."
      )
    }

    /* ========================================
       HTTP ERROR
    ======================================== */

    if (!response.ok) {

      const errorMessage =
        responseData?.detail ||
        responseData?.message ||
        responseData?.error ||
        `Request failed with status ${response.status}`

      throw new Error(
        errorMessage
      )
    }

    return responseData

  } catch (error) {

    /* ========================================
       TIMEOUT
    ======================================== */

    if (
      error.name ===
      "AbortError"
    ) {

      throw new Error(
        "Request timeout. Backend took too long to respond."
      )
    }

    /* ========================================
       NETWORK ERROR
    ======================================== */

    if (
      error instanceof
      TypeError
    ) {

      throw new Error(
        "Unable to connect to backend server."
      )
    }

    throw error

  } finally {

    clearTimeout(
      timeout
    )
  }
}

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
        getUserToken(),
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

    return apiRequest({
      endpoint,
      method: "POST",
      body: payload,
    })
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
      `${endpoint}?user_token=${encodeURIComponent(
        getUserToken()
      )}`

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

    return apiRequest({
      endpoint:
        finalUrl,
    })
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
      message:
        "Clear session endpoint not yet connected.",
    }
  }

/* ========================================
   LOAD AI SETTINGS
======================================== */

const loadAISettings =
  async () => {

    return {
      success: true,
      message:
        "AI settings endpoint not yet connected.",
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