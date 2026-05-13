import {
  API_CONFIG,
  API_ENDPOINTS,
  buildApiUrl,
} from "../../config/sqlVariables"

const REQUEST_TIMEOUT =
  API_CONFIG.TIMEOUT ||
  30000

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

    console.log(
      "TICKET_API_REQUEST",
      method,
      endpoint
    )

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
      "TICKET_API_STATUS",
      response.status
    )

    const rawText =
      await response.text()

    console.log(
      "TICKET_API_RESPONSE",
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
        "TICKET_PARSE_ERROR",
        parseError
      )

      throw new Error(
        "Backend returned invalid JSON."
      )
    }

    /* HTTP ERROR */

    if (!response.ok) {

      const errorMessage =
        responseData?.error ||
        responseData?.detail ||
        responseData?.message ||
        `Request failed with status ${response.status}`

      throw new Error(
        errorMessage
      )
    }

    return responseData

  } catch (error) {

    /* TIMEOUT */

    if (
      error.name ===
      "AbortError"
    ) {

      throw new Error(
        "Request timeout. Backend took too long to respond."
      )
    }

    /* NETWORK ERROR */

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
   GET TICKETS
======================================== */

const getTickets =
  async ({
    search = "",
    skip = 0,
    limit = 50,
  } = {}) => {

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.TICKETS
      )

    const params =
      new URLSearchParams()

    if (
      search?.trim()
    ) {

      params.append(
        "search",
        search.trim()
      )
    }

    params.append(
      "skip",
      String(skip)
    )

    params.append(
      "limit",
      String(limit)
    )

    const finalUrl =
      `${endpoint}?${params.toString()}`

    console.log(
      "GET_TICKETS_URL",
      finalUrl
    )

    return apiRequest({
      endpoint:
        finalUrl,
    })
  }

/* ========================================
   DELETE TICKET
======================================== */

const deleteTicket =
  async (
    ticketNumber
  ) => {

    if (
      !ticketNumber
    ) {

      throw new Error(
        "Ticket number is required."
      )
    }

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.TICKET_DELETE,
        {
          ticketNumber,
        }
      )

    console.log(
      "DELETE_TICKET_URL",
      endpoint
    )

    return apiRequest({
      endpoint,
      method:
        "DELETE",
    })
  }

/* ========================================
   EXPORT
======================================== */

const ticketAdminService = {
  getTickets,
  deleteTicket,
}

export default ticketAdminService