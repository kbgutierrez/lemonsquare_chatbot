import {
  API_CONFIG,
  API_ENDPOINTS,
  buildApiUrl,
} from "../../config/sqlVariables"

/* ========================================
   HELPERS
======================================== */

const log = (
  label,
  payload
) =>
  console.log(label, payload)

const parseJsonSafely =
  async (response) => {

    try {
      return await response.json()
    } catch {
      return null
    }
  }

/* ========================================
   API REQUEST
======================================== */

const apiRequest = async ({
  endpoint,
  method = "GET",
  body,
  headers = {},
}) => {

  const response = await fetch(
    endpoint,
    {
      method,

      headers: {
        ...API_CONFIG.HEADERS,
        ...headers,
      },

      body:
        body
          ? JSON.stringify(body)
          : undefined,
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
      "Request failed."
    )
  }

  return data
}

/* ========================================
   MESSAGE HELPERS
======================================== */

const getMessageContent = (
  message
) =>
  message?.content ||
  message?.text ||
  message?.MessageContent ||
  ""

const getMessageRole = (
  message
) =>
  message?.role ||
  message?.sender ||
  message?.SenderRole ||
  ""

const filterMessagesByRoles = (
  messages,
  allowedRoles
) =>
  messages.filter(message =>
    allowedRoles.includes(
      getMessageRole(message)
    )
  )

/* ========================================
   TICKET HELPERS
======================================== */

const generateTicketNumber =
  () =>
    `CHAT-${Date.now()}`

const extractConversationSummary =
  (messages = []) => {

    const userMessages =
      filterMessagesByRoles(
        messages,
        ["user"]
      )

    const assistantMessages =
      filterMessagesByRoles(
        messages,
        [
          "assistant",
          "agent",
          "ai",
        ]
      )

    const firstUserMessage =
      getMessageContent(
        userMessages[0]
      ) || "User issue"

    const latestAssistantMessage =
      getMessageContent(
        assistantMessages.at(-1)
      ) ||
      "Issue resolved."

    return {
      issue_reported:
        firstUserMessage,

      issue_found:
        firstUserMessage,

      issue_cause:
        "Resolved through AI support conversation.",

      work_done:
        latestAssistantMessage,
    }
  }

/* ========================================
   RESOLVE TICKET
======================================== */

const resolveTicket =
  async ({
    sessionId,
    messages,
  }) => {

    log(
      "RESOLVE_MESSAGES",
      messages
    )

    const extracted =
      extractConversationSummary(
        messages
      )

    /*
      IMPORTANT:
      Backend schema typo:
      issue_resported
    */

    const payload = {
      ticket_number:
        generateTicketNumber(),

      issue_resported:
        extracted.issue_reported,

      issue_found:
        extracted.issue_found,

      issue_cause:
        extracted.issue_cause,

      work_done:
        extracted.work_done,
    }

    log(
      "SYNC_PAYLOAD",
      payload
    )

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.TICKET_SYNC
      )

    log(
      "SYNC_ENDPOINT",
      endpoint
    )

    const response =
      await apiRequest({
        endpoint,
        method: "POST",
        body: payload,
      })

    log(
      "SYNC_RESPONSE",
      response
    )

    return {
      success: true,
      sessionId,

      ticketNumber:
        response?.ticket_number,

      response,
    }
  }

/* ========================================
   ESCALATION
======================================== */

const getEscalationDraft =
  async (sessionId) => {

    const endpoint =
      buildApiUrl(
        `/chat/escalate/draft/${sessionId}`
      )

    log(
      "ESCALATION_DRAFT_ENDPOINT",
      endpoint
    )

    const response =
      await apiRequest({
        endpoint,
        method: "GET",
      })

    log(
      "ESCALATION_DRAFT_RESPONSE",
      response
    )

    return response
  }

const submitEscalation =
  async ({
    session_id,
    requester_id,
    company_id,
    summary,
    description,
  }) => {

    const payload = {
      session_id,
      requester_id,
      company_id,
      summary,
      description,
    }

    log(
      "ESCALATION_SUBMIT_PAYLOAD",
      payload
    )

    const endpoint =
      buildApiUrl(
        "/chat/escalate/submit"
      )

    log(
      "ESCALATION_SUBMIT_ENDPOINT",
      endpoint
    )

    const response =
      await apiRequest({
        endpoint,
        method: "POST",
        body: payload,
      })

    log(
      "ESCALATION_SUBMIT_RESPONSE",
      response
    )

    return response
  }

/* ========================================
   EXPORT
======================================== */

const ticketService = {
  resolveTicket,
  getEscalationDraft,
  submitEscalation,
}

export default ticketService