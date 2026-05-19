import apiClient, {
  buildApiUrl,
} from "../../shared/api/client"

import {
  API_ENDPOINTS,
} from "../../shared/api/endpoints"

/* ========================================
   GET ALL TICKETS (AUTO PAGINATED)
======================================== */

const PAGE_SIZE = 50

const getTickets =
  async ({
    search = "",
  } = {}) => {

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.TICKETS
      )

    let skip = 0

    let hasMore = true

    let allTickets = []

    while (hasMore) {

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
        String(PAGE_SIZE)
      )

      const finalUrl =
        `${endpoint}?${params.toString()}`

      console.log(
        "GET_TICKETS_BATCH_URL",
        finalUrl
      )

      const batch =
        await apiClient.get(
          finalUrl
        )

      const safeBatch =
        Array.isArray(batch)
          ? batch
          : []

      allTickets = [
        ...allTickets,
        ...safeBatch,
      ]

      /*
        If returned rows are smaller
        than requested limit,
        we reached the end.
      */

      if (
        safeBatch.length <
        PAGE_SIZE
      ) {

        hasMore = false

      } else {

        skip += PAGE_SIZE
      }
    }

    console.log(
      "TOTAL_TICKETS_FETCHED",
      allTickets.length
    )

    return allTickets
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