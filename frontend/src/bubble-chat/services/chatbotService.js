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

/*
  DEVELOPMENT MODE

  TEMPORARY:
  Uses TEST_USER_1 until
  real BizPortal auth exists.
*/
const DEV_MODE = true

/* ========================================
   GET USER TOKEN
======================================== */

const getUserToken = () => {

  /*
    DEVELOPMENT TOKEN
  */
  if (DEV_MODE) {

    return "TEST_USER_1"
  }

  /*
    PRODUCTION TOKEN
  */
  const token =
    localStorage.getItem(
      "user_token"
    )

  if (
    !token ||
    token === "null" ||
    token === "undefined"
  ) {

    throw new Error(
      "User authentication token not found."
    )
  }

  return token
}

const resolveRequesterId = (
  authToken
) => {

  if (
    typeof authToken !==
    "string"
  ) {
    return authToken
  }

  if (
    DEV_MODE &&
    authToken.startsWith(
      "TEST_USER_"
    )
  ) {
    const parts =
      authToken.split("_")

    const maybeId =
      parts[parts.length - 1]

    if (/^\d+$/.test(maybeId)) {
      return maybeId
    }
  }

  if (/^\d+$/.test(authToken)) {
    return authToken
  }

  return authToken
}

/* ========================================
   RESPONSE VALIDATION
======================================== */

const validateChatResponse = (
  response
) => {

  if (
    !response ||
    typeof response !== "object"
  ) {

    throw new Error(
      "Invalid backend response."
    )
  }

  if (
    typeof response.session_id !==
    "string"
  ) {

    throw new Error(
      "Backend response missing session_id."
    )
  }

  if (
    typeof response.response !==
    "string"
  ) {

    throw new Error(
      "Backend response missing AI message."
    )
  }

  return {
    sessionId:
      response.session_id,

    message:
      response.response,

    ticketIds:
      Array.isArray(
        response.ticket_ids_used
      )
        ? response.ticket_ids_used
        : [],
  }
}

/* ========================================
   NORMALIZE HISTORY MESSAGE
======================================== */

const normalizeHistoryMessage = (
  message,
  index
) => {

  const createdAt =
    message?.CreatedAt
      ? new Date(
          message.CreatedAt
        )
      : new Date()

  return {
    id:
      message?.MessageID ||
      `${index}-${createdAt.toISOString()}`,

    sender:
      message?.SenderRole ===
      "user"
        ? "user"
        : "agent",

    text:
      message?.MessageContent || "",

    time:
      createdAt.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),

    createdAt:
      createdAt.toISOString(),
  }
}

/* ========================================
   NORMALIZE SESSION METADATA
======================================== */

const normalizeSession = (
  session,
  index
) => {

  const createdAt =
    session?.created_at
      ? new Date(
          session.created_at
        )
      : new Date()

  return {
    id:
      session?.session_id ||
      `session-${index}`,

    /*
      Backend does NOT provide
      title/preview.

      These are hydrated later
      from REAL backend history.
    */
    title: null,

    preview: null,

    createdAt:
      createdAt.toISOString(),

    updatedAt:
      createdAt.toISOString(),

    messageCount:
      Number(
        session?.message_count || 0
      ),

    /*
      BACKEND STATUS IS SOURCE OF TRUTH
    */
    resolved:
      String(
        session?.status || ""
      ).toLowerCase() ===
      "resolved",

    resolvedAt:
      String(
        session?.status || ""
      ).toLowerCase() ===
      "resolved"
        ? createdAt.toISOString()
        : null,
  }
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

    const rawText =
      await response.text()

    console.log(
      "RAW_RESPONSE_TEXT",
      rawText
    )

    let responseData =
      null

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

    if (
      error.name ===
      "AbortError"
    ) {

      throw new Error(
        "Request timeout. Backend took too long to respond."
      )
    }

    if (
      error instanceof TypeError &&
      error.message === "Failed to fetch"
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

    const userToken =
      getUserToken()

    const payload = {
      session_id:
        SessionID || null,

      message:
        MessageContent,

      user_token:
        userToken,
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
      await apiRequest({
        endpoint,
        method: "POST",
        body: payload,
      })

    return validateChatResponse(
      response
    )
  }

/* ========================================
   LOAD SESSION
======================================== */

const loadSession =
  async (
    SessionID
  ) => {

    const userToken =
      getUserToken()

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
        userToken
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

    const response =
      await apiRequest({
        endpoint:
          finalUrl,
      })

    /*
      IMPORTANT:
      Backend history endpoint
      is ONLY for messages.

      Resolved state comes from:
      GET /chat/user-sessions/:requesterId

      Backend session registry
      is the source of truth.
    */

    return {
      sessionId:
        response?.session_id ||
        SessionID,

      messages:
        Array.isArray(
          response?.messages
        )
          ? response.messages.map(
              normalizeHistoryMessage
            )
          : [],
    }
  }

/* ========================================
   LOAD USER SESSIONS
======================================== */

const loadUserSessions =
  async () => {

    const userToken =
      getUserToken()

    const requesterId =
      resolveRequesterId(
        userToken
      )

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.CHAT_USER_SESSIONS,
        {
          requesterId,
        }
      )

    console.log(
      "LOAD_USER_SESSIONS",
      {
        userToken,
        requesterId,
      }
    )

    console.log(
      "API_ENDPOINT",
      endpoint
    )

    const response =
      await apiRequest({
        endpoint,
      })

    const sessions =
      Array.isArray(
        response
      )
        ? response
        : response?.sessions || []

    return sessions.map(
      normalizeSession
    )
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
   RESOLVE CONVERSATION
======================================== */

const resolveConversation =
  async (
    SessionID
  ) => {

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.CHAT_RESOLVE,
        {
          sessionId:
            SessionID,
        }
      )

    console.log(
      "RESOLVE_CONVERSATION",
      {
        SessionID,
      }
    )

    console.log(
      "API_ENDPOINT",
      endpoint
    )

    return await apiRequest({
      endpoint,
      method: "POST",
    })
  }


/* ========================================
   EXPORT
======================================== */

const chatbotService = {
  sendMessage,

  loadSession,

  loadUserSessions,

  clearSession,

  resolveConversation,

  loadAISettings,
}

export default chatbotService