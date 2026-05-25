import apiClient, {
  buildApiUrl,
} from "../../shared/api/client"

import {
  API_ENDPOINTS,
} from "../../shared/api/endpoints"

import {
  appendCachedData,
  createAbortController,
  createRequestVersion,
  isLatestRequestVersion,
  setCachedData,
  abortActiveRequest,
} from "../../shared/cache/liveQueryCache"

/* ========================================
   CONFIG
======================================== */

const PAGE_SIZE = 50

const STREAM_DELAY = 0

/* ========================================
   SMALL YIELD
======================================== */

const yieldToMainThread = () =>
  new Promise((resolve) =>
    setTimeout(resolve, STREAM_DELAY)
  )

/* ========================================
   GET ALL TICKETS
   (PROGRESSIVE STREAMING)
======================================== */

const getTickets = async ({
  search = "",
  cacheKey = null,
  progressive = false,
} = {}) => {
  const endpoint =
    buildApiUrl(
      API_ENDPOINTS.TICKETS
    )

  const requestKey =
    cacheKey ||
    `tickets_${search}`

  /*
    IMPORTANT:
    Abort old request before
    creating a new one.
  */

  abortActiveRequest(requestKey)

  const controller =
    createAbortController(
      requestKey
    )

  const requestVersion =
    createRequestVersion(
      requestKey
    )

  let skip = 0

  let hasMore = true

  let allTickets = []

  /*
    IMPORTANT:
    Reset cache only for
    progressive mode.
  */

  if (progressive) {
    setCachedData(
      requestKey,
      []
    )
  }

  try {
    while (
      hasMore &&
      !controller.signal.aborted
    ) {
      /*
        IMPORTANT:
        Prevent stale requests
        from mutating cache.
      */

      if (
        !isLatestRequestVersion(
          requestKey,
          requestVersion
        )
      ) {
        console.warn(
          "STALE_TICKET_REQUEST_DROPPED"
        )

        break
      }

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
          finalUrl,
          {
            signal:
              controller.signal,
          }
        )

      const safeBatch =
        Array.isArray(batch)
          ? batch
          : []

      /*
        IMPORTANT:
        Progressive cache append
        for instant rendering.
      */

      if (
        progressive &&
        safeBatch.length > 0
      ) {
        appendCachedData({
          key: requestKey,
          incoming: safeBatch,
          uniqueKey:
            "ticket_number",
        })
      }

      /*
        IMPORTANT:
        Keep local aggregate
        for final return.
      */

      allTickets = [
        ...allTickets,
        ...safeBatch,
      ]

      /*
        IMPORTANT:
        Yield to browser so UI
        can rerender between batches.
      */

      await yieldToMainThread()

      /*
        End pagination.
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
  } catch (error) {
    if (
      error?.message ===
      "Request aborted"
    ) {
      console.log(
        "TICKET_FETCH_ABORTED"
      )

      return allTickets
    }

    console.error(
      "GET_TICKETS_ERROR",
      error
    )

    throw error
  }
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