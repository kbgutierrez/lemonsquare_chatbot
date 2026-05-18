import apiClient, {
  buildApiUrl,
} from "../../shared/api/client"

import {
  API_ENDPOINTS,
} from "../../shared/api/endpoints"

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

    return apiClient.get(
      finalUrl
    )
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

    return apiClient.delete(
      endpoint
    )
  }

/* ========================================
   TOGGLE WHITELIST / BLACKLIST
======================================== */

const toggleTicketWhitelist =
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
        API_ENDPOINTS.TICKET_WHITELIST,
        {
          ticketNumber,
        }
      )

    console.log(
      "TOGGLE_TICKET_WHITELIST_URL",
      endpoint
    )

    return apiClient.post(
      endpoint
    )
  }

/* ========================================
   EXPORT
======================================== */

const ticketAdminService = {
  getTickets,
  deleteTicket,
  toggleTicketWhitelist,
}

export default ticketAdminService