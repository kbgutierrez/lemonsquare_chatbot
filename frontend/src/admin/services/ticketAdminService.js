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
    limit = 50,
  } = {}) => {

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.TICKETS
      )

    const params =
      new URLSearchParams({
        search:
          search.trim(),

        limit:
          String(limit),
      })

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

    const endpoint =
      `${buildApiUrl(
        API_ENDPOINTS.TICKETS
      )}/${encodeURIComponent(
        ticketNumber
      )}`

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