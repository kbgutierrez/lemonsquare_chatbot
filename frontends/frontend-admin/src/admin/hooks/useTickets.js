import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import ticketAdminService from "../services/ticketAdminService"

import useLiveQuery from "../../shared/hooks/useLiveQuery"

import {
  invalidateCache,
  setCachedData,
  abortActiveRequest,
} from "../../shared/cache/liveQueryCache"

const ITEMS_PER_PAGE = 10
const SEARCH_DEBOUNCE = 400
const CACHE_KEY = "tickets_cache"

/*
  IMPORTANT:

  Polling removed intentionally.

  Tickets now refresh ONLY via:
  - manual refresh button
  - explicit refresh()
  - search changes

  This prevents:
  - continuous background refetches
  - unnecessary pagination refetch loops
  - bandwidth waste
  - hidden tab refresh churn
  - remount fetches
*/

export const useTickets = () => {
  const mountedRef =
    useRef(true)

  const debounceRef =
    useRef(null)

  const [
    search,
    setSearch,
  ] = useState("")

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("")

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)

  /* ========================================
     QUERY KEY
  ======================================== */

  const queryKey =
    `${CACHE_KEY}_${debouncedSearch}`

  /* ========================================
     CLEANUP
  ======================================== */

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false

      clearTimeout(
        debounceRef.current
      )

      /*
        IMPORTANT:
        Abort inflight fetches
        on navigation/unmount.
      */

      abortActiveRequest(
        queryKey
      )
    }
  }, [queryKey])

  /* ========================================
     SEARCH DEBOUNCE
  ======================================== */

  useEffect(() => {
    setCurrentPage(1)

    clearTimeout(
      debounceRef.current
    )

    debounceRef.current =
      setTimeout(() => {
        if (
          mountedRef.current
        ) {
          setDebouncedSearch(
            search
          )
        }
      }, SEARCH_DEBOUNCE)
  }, [search])

  /* ========================================
     FETCHER
  ======================================== */

  const fetchTickets =
    useCallback(async () => {
      const response =
        await ticketAdminService.getTickets(
          {
            search:
              debouncedSearch,

            cacheKey:
              queryKey,

            progressive: true,
          }
        )

      if (
        Array.isArray(response)
      ) {
        return response
      }

      if (
        Array.isArray(
          response?.data
        )
      ) {
        return response.data
      }

      console.warn(
        "INVALID_TICKETS_RESPONSE",
        response
      )

      return []
    }, [
      debouncedSearch,
      queryKey,
    ])

  /* ========================================
     LIVE QUERY
  ======================================== */

  const {
    data: tickets,
    loading,
    refreshing,
    refresh,
  } = useLiveQuery({
    queryKey,

    queryFn:
      fetchTickets,

    initialData: [],

    /*
      IMPORTANT:
      TRUE CACHE-FIRST MODE
    */

    staleWhileRevalidate: false,

    /*
      IMPORTANT:
      No polling.
    */

    refetchInterval:
      null,

    /*
      IMPORTANT:
      Preserve visible data.
    */

    keepPreviousData: true,

    /*
      IMPORTANT:
      Disable automatic
      focus refreshes.
    */

    refreshOnFocus: false,

    /*
      IMPORTANT:
      Allow initial fetch ONLY
      when cache doesn't exist.
    */

    fetchOnMount: true,
  })

  /* ========================================
     SAFE ARRAY
  ======================================== */

  const safeTickets =
    useMemo(() => {
      return Array.isArray(
        tickets
      )
        ? tickets
        : []
    }, [tickets])

  /* ========================================
     BLOCK / UNBLOCK
     (OPTIMISTIC UPDATE)
  ======================================== */

  const blockTicket =
    useCallback(
      async (
        ticketNumber
      ) => {
        const previous =
          [...safeTickets]

        const target =
          safeTickets.find(
            (t) =>
              t.ticket_number ===
              ticketNumber
          )

        if (!target) {
          return
        }

        const nextStatus =
          !target.is_blacklisted

        const optimistic =
          safeTickets.map(
            (t) => {
              if (
                t.ticket_number ===
                ticketNumber
              ) {
                return {
                  ...t,
                  is_blacklisted:
                    nextStatus,
                }
              }

              return t
            }
          )

        /*
          IMPORTANT:
          Instant UI update.
        */

        setCachedData(
          queryKey,
          optimistic
        )

        try {
          await ticketAdminService.toggleTicketWhitelist(
            ticketNumber
          )

          /*
            IMPORTANT:
            DO NOT invalidate cache.
            Keep UI hot.
          */

          await refresh()
        } catch (error) {
          console.error(
            "TOGGLE_TICKET_ERROR",
            error
          )

          /*
            IMPORTANT:
            Rollback optimistic update.
          */

          setCachedData(
            queryKey,
            previous
          )
        }
      },
      [
        safeTickets,
        queryKey,
        refresh,
      ]
    )

  /* ========================================
     PAGINATION
  ======================================== */

  const totalPages =
    useMemo(() => {
      return Math.max(
        1,
        Math.ceil(
          safeTickets.length /
            ITEMS_PER_PAGE
        )
      )
    }, [safeTickets])

  const paginatedTickets =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE

      return safeTickets.slice(
        start,
        start +
          ITEMS_PER_PAGE
      )
    }, [
      safeTickets,
      currentPage,
    ])

  return {
    loading,
    refreshing,

    search,
    setSearch,

    tickets:
      safeTickets,

    paginatedTickets,

    currentPage,
    setCurrentPage,

    totalPages,

    blockTicket,

    refreshTickets:
      refresh,
  }
}