import {
  API_CONFIG,
  API_ENDPOINTS,
  buildApiUrl,
  getRuntimeConfig,
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

const REQUEST_TIMEOUT =
  API_CONFIG.TIMEOUT

const DEV_MODE =
  import.meta.env.DEV

const DEV_USER_TOKEN =
  import.meta.env
    .VITE_DEV_USER_TOKEN ||
  "11318"

/* ========================================
   LOCKED SESSION STATUSES
======================================== */

const LOCKED_SESSION_STATUSES =
  new Set([
    "resolved",
    "escalated",
    "drafting_ticket",
    "closed",
    "locked",
  ])

/* ========================================
   HELPERS
======================================== */

const parseJsonSafely =
  async (response) => {

    try {
      return await response.json()
    } catch {
      return null
    }
  }

const formatTime = (date) =>
  date.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  )

const normalizeDate = (
  value
) =>
  value
    ? new Date(value)
    : new Date()

const isValidToken = (
  token
) =>
  token &&
  token !== "null" &&
  token !== "undefined"

const normalizeStatus =
  status =>
    String(status || "")
      .trim()
      .toLowerCase()

const isLockedStatus =
  status =>
    LOCKED_SESSION_STATUSES.has(
      normalizeStatus(status)
    )

/* ========================================
   API REQUEST
======================================== */

const apiRequest = async ({
  endpoint,
  method = "GET",
  body,
  headers = {},
}) => {

  const controller =
    new AbortController()

  const timeoutId =
    setTimeout(
      () =>
        controller.abort(),
      REQUEST_TIMEOUT
    )

  try {

    const response =
      await fetch(
        endpoint,
        {
          method,

          headers: {
            ...API_CONFIG.HEADERS,
            ...headers,
          },

          body:
            body
              ? JSON.stringify(
                  body
                )
              : undefined,

          signal:
            controller.signal,
        }
      )

    const data =
      await parseJsonSafely(
        response
      )

    if (!response.ok) {

      throw new Error(
        data?.detail ||
        data?.message ||
        "API request failed."
      )
    }

    return data

  } catch (error) {

    if (
      error.name ===
      "AbortError"
    ) {

      throw new Error(
        "Request timeout exceeded."
      )
    }

    throw error

  } finally {

    clearTimeout(
      timeoutId
    )
  }
}

/* ========================================
   USER TOKEN
======================================== */

const getUserToken =
  () => {

    const runtimeToken =
      getRuntimeConfig()
        ?.userToken

    if (
      isValidToken(
        runtimeToken
      )
    ) {
      return runtimeToken
    }

    const globalToken =
      window
        ?.LemonSquareChatConfig
        ?.userToken

    if (
      isValidToken(
        globalToken
      )
    ) {
      return globalToken
    }

    const localToken =
      localStorage.getItem(
        "user_token"
      )

    if (
      isValidToken(
        localToken
      )
    ) {
      return localToken
    }

    if (
      DEV_MODE &&
      DEV_USER_TOKEN
    ) {
      return DEV_USER_TOKEN
    }

    throw new Error(
      "User authentication token not found."
    )
  }

/* ========================================
   REQUESTER ID
======================================== */

const resolveRequesterId =
  (authToken) => {

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

      const maybeId =
        authToken
          .split("_")
          .at(-1)

      if (
        /^\d+$/.test(
          maybeId
        )
      ) {

        return Number(
          maybeId
        )
      }
    }

    return /^\d+$/.test(
      authToken
    )
      ? Number(authToken)
      : authToken
  }

/* ========================================
   VALIDATION
======================================== */

const validateChatResponse =
  (response) => {

    if (
      !response ||
      typeof response !==
      "object"
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

      showResolutionPrompt:
        Boolean(response.show_resolution_prompt),

      allowTicketSubmission:
        Boolean(response.allow_ticket_submission),

      conversationStatus:
        response.conversation_status || "active",

      resolutionAction:
        response.resolution_action || "active",

      resolutionConfidence:
        typeof response.resolution_confidence === "number"
          ? response.resolution_confidence
          : 0.0,

      resolutionMessage:
        response.resolution_message || null,
    }
  }

/* ========================================
   NORMALIZERS
======================================== */

const normalizeHistoryMessage =
  (
    message,
    index
  ) => {

    const createdAt =
      normalizeDate(
        message?.CreatedAt
      )

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
        message?.MessageContent ||
        "",

      time:
        formatTime(createdAt),

      createdAt:
        createdAt.toISOString(),
    }
  }

const normalizeSession =
  (
    session,
    index
  ) => {

    const createdAt =
      normalizeDate(
        session?.created_at
      )

    const normalizedStatus =
      normalizeStatus(
        session?.status
      )

    const locked =
      isLockedStatus(
        normalizedStatus
      )

    const resolved =
      normalizedStatus ===
      "resolved"

    const escalated =
      normalizedStatus ===
        "escalated" ||
      normalizedStatus ===
        "drafting_ticket"

    return {
      id:
        session?.session_id ||
        `session-${index}`,

      title: null,
      preview: null,

      createdAt:
        createdAt.toISOString(),

      updatedAt:
        createdAt.toISOString(),

      messageCount:
        Number(
          session?.message_count ||
          0
        ),

      status:
        normalizedStatus,

      locked,

      resolved,

      escalated,

      ticketSubmitted:
        escalated,

      resolvedAt:
        resolved
          ? createdAt.toISOString()
          : null,
    }
  }

/* ========================================
   API METHODS
======================================== */

const sendMessage =
  async ({
    SessionID,
    MessageContent,
  }) => {

    const response =
      await apiRequest({
        endpoint:
          buildApiUrl(
            API_ENDPOINTS.CHAT_SEND
          ),

        method: "POST",

        body: {
          session_id:
            SessionID || null,

          message:
            MessageContent,

          user_token:
            getUserToken(),
        },
      })

    return validateChatResponse(
      response
    )
  }

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

    const response =
      await apiRequest({
        endpoint:
          `${endpoint}?user_token=${encodeURIComponent(
            getUserToken()
          )}`,
      })

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

const loadUserSessions =
  async () => {

    const requesterId =
      resolveRequesterId(
        getUserToken()
      )

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.CHAT_USER_SESSIONS,
        {
          requesterId,
        }
      )

    const response =
      await apiRequest({
        endpoint,
      })

    const sessions =
      Array.isArray(response)
        ? response
        : response?.sessions ||
          []

    return sessions.map(
      normalizeSession
    )
  }

const deleteConversation =
  async (
    SessionID
  ) =>
    apiRequest({
      endpoint:
        buildApiUrl(
          API_ENDPOINTS.CHAT_DELETE_SESSION,
          {
            sessionId:
              SessionID,
          }
        ),

      method: "DELETE",
    })

const clearAllSessions =
  async () => {

    const requesterId =
      resolveRequesterId(
        getUserToken()
      )

    return apiRequest({
      endpoint:
        buildApiUrl(
          API_ENDPOINTS.CHAT_CLEAR_ALL,
          {
            requesterId,
          }
        ),

      method: "DELETE",
    })
  }

const resolveConversation =
  async (
    SessionID
  ) =>
    apiRequest({
      endpoint:
        buildApiUrl(
          API_ENDPOINTS.CHAT_RESOLVE,
          {
            sessionId:
              SessionID,
          }
        ),

      method: "POST",
    })

const checkResolution =
  async (
    SessionID
  ) =>
    apiRequest({
      endpoint:
        buildApiUrl(
          API_ENDPOINTS.CHAT_CHECK_RESOLUTION,
          {
            sessionId:
              SessionID,
          }
        ),

      method: "GET",
    })

const verifyUserToken =
  async () => {

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.AUTH_VERIFY
      )

    return apiRequest({
      endpoint:
        `${endpoint}?user_token=${encodeURIComponent(
          getUserToken()
        )}`,
    })
  }

/* ========================================
   PLACEHOLDER
======================================== */

const loadAISettings =
  async () => ({
    success: true,

    message:
      "AI settings endpoint not yet connected.",
  })

/* ========================================
   EXPORT
======================================== */

const chatbotService = {
  sendMessage,
  loadSession,
  loadUserSessions,
  deleteConversation,
  clearAllSessions,
  resolveConversation,
  checkResolution,
  loadAISettings,
  verifyUserToken,
  getUserToken,
  resolveRequesterId,
}

export default chatbotService