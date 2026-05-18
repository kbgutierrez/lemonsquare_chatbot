import {
  API_CONFIG,
  API_ENDPOINTS,
  buildApiUrl,
} from "../../config/sqlVariables"

/* ========================================
   API REQUEST
======================================== */

const apiRequest =
  async ({
    endpoint,
    method = "GET",
    body,
    headers = {},
  }) => {

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
        }
      )

    let data = null

    try {

      data =
        await response.json()

    } catch {

      data = null
    }

    if (
      !response.ok
    ) {

      throw new Error(
        data?.detail ||
        data?.message ||
        "Request failed."
      )
    }

    return data
  }

/* ========================================
   GENERATE TICKET NUMBER
======================================== */

const generateTicketNumber =
  () => {

    return `CHAT-${Date.now()}`
  }

/* ========================================
   NORMALIZE MESSAGE
======================================== */

const getMessageContent =
  (message) => {

    return (
      message?.content ||
      message?.text ||
      message?.MessageContent ||
      ""
    )
  }

const getMessageRole =
  (message) => {

    return (
      message?.role ||
      message?.sender ||
      message?.SenderRole ||
      ""
    )
  }

/* ========================================
   EXTRACT SUMMARY
======================================== */

const extractConversationSummary =
  (messages = []) => {

    const userMessages =
      messages.filter(
        (message) => {

          const role =
            getMessageRole(
              message
            )

          return (
            role === "user"
          )
        }
      )

    const assistantMessages =
      messages.filter(
        (message) => {

          const role =
            getMessageRole(
              message
            )

          return (
            role === "assistant" ||
            role === "agent" ||
            role === "ai"
          )
        }
      )

    const firstUserMessage =
      getMessageContent(
        userMessages[0]
      ) ||
      "User issue"

    const latestAssistantMessage =
      getMessageContent(
        assistantMessages[
          assistantMessages.length - 1
        ]
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

    console.log(
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

    console.log(
      "SYNC_PAYLOAD",
      payload
    )

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.TICKET_SYNC
      )

    console.log(
      "SYNC_ENDPOINT",
      endpoint
    )

    const response =
      await apiRequest({
        endpoint,
        method: "POST",
        body: payload,
      })

    console.log(
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
   GET ESCALATION DRAFT
======================================== */

const getEscalationDraft =
  async (
    sessionId
  ) => {

    const endpoint =
      buildApiUrl(
        `/chat/escalate/draft/${sessionId}`
      )

    console.log(
      "ESCALATION_DRAFT_ENDPOINT",
      endpoint
    )

    const response =
      await apiRequest({
        endpoint,
        method: "GET",
      })

    console.log(
      "ESCALATION_DRAFT_RESPONSE",
      response
    )

    return response
  }

/* ========================================
   SUBMIT ESCALATION
======================================== */

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

    console.log(
      "ESCALATION_SUBMIT_PAYLOAD",
      payload
    )

    const endpoint =
      buildApiUrl(
        "/chat/escalate/submit"
      )

    console.log(
      "ESCALATION_SUBMIT_ENDPOINT",
      endpoint
    )

    const response =
      await apiRequest({
        endpoint,
        method: "POST",
        body: payload,
      })

    console.log(
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