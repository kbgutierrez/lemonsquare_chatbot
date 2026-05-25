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
  setCachedData,
  abortActiveRequest,
} from "../../shared/cache/liveQueryCache"

const ITEMS_PER_PAGE = 10
const SEARCH_DEBOUNCE = 400
const CACHE_KEY = "tickets_cache"

export const useTickets = () => {
  const mountedRef =
    useRef(true)

  const debounceRef =
    useRef(null)

  /*
    IMPORTANT:
    Prevent overlapping mutations.
  */

  const mutationRef =
    useRef(false)

  /*
    IMPORTANT:
    Master local dataset.

    Search/filtering now happens
    entirely client-side without
    refetching.
  */

  const allTicketsRef =
    useRef([])

  const [
    search,
    setSearch,
  ] = useState("")

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)

  /* ========================================
     QUERY KEY
  ======================================== */

  const queryKey =
    CACHE_KEY

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

      abortActiveRequest(
        queryKey
      )
    }
  }, [queryKey])

  /* ========================================
     SEARCH DEBOUNCE
  ======================================== */

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("")

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
      /*
        IMPORTANT:
        Never refetch during mutations.
      */

      if (
        mutationRef.current
      ) {
        return (
          allTicketsRef.current
        )
      }

      const response =
        await ticketAdminService.getTickets(
          {
            cacheKey:
              queryKey,

            progressive: true,
          }
        )

      let normalized = []

      if (
        Array.isArray(response)
      ) {
        normalized = response
      } else if (
        Array.isArray(
          response?.data
        )
      ) {
        normalized =
          response.data
      }

      /*
        IMPORTANT:
        Persist full dataset locally.
      */

      allTicketsRef.current =
        normalized

      return normalized
    }, [queryKey])

  /* ========================================
     LIVE QUERY
  ======================================== */

  const {
    data: tickets,
    loading,
    refreshing,
  } = useLiveQuery({
    queryKey,

    queryFn:
      fetchTickets,

    initialData: [],

    staleWhileRevalidate: false,

    refetchInterval:
      null,

    keepPreviousData: true,

    refreshOnFocus: false,

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
     CLIENT-SIDE SEARCH
     (NO REFETCH)
  ======================================== */

  const filteredTickets =
    useMemo(() => {
      /*
        IMPORTANT:
        Always filter from
        master dataset.
      */

      const dataset =
        allTicketsRef.current
          .length > 0
          ? allTicketsRef.current
          : safeTickets

      const trimmed =
        debouncedSearch
          .trim()
          .toLowerCase()

      if (!trimmed) {
        return dataset
      }

      return dataset.filter(
        (ticket) => {
          return [
            ticket.ticket_number,
            ticket.issue_reported,
            ticket.work_done,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(trimmed)
            )
        }
      )
    }, [
      debouncedSearch,
      safeTickets,
    ])

  /* ========================================
     DELETE / UNBLOCK
     (OPTIMISTIC UPDATE)
  ======================================== */

  const blockTicket =
    useCallback(
      async (
        ticketNumber,
        isBlocked = false
      ) => {
        if (
          mutationRef.current
        ) {
          return
        }

        mutationRef.current = true

        const previous = [
          ...allTicketsRef.current,
        ]

        const target =
          allTicketsRef.current.find(
            (t) =>
              t.ticket_number ===
              ticketNumber
          )

        if (!target) {
          mutationRef.current = false
          return
        }

        try {
          /*
            ====================================
            UNBLOCK FLOW
            ====================================
          */

          if (isBlocked) {
            const optimistic =
              allTicketsRef.current.map(
                (t) => {
                  if (
                    t.ticket_number ===
                    ticketNumber
                  ) {
                    return {
                      ...t,
                      is_blacklisted:
                        false,
                    }
                  }

                  return t
                }
              )

            allTicketsRef.current =
              optimistic

            setCachedData(
              queryKey,
              optimistic
            )

            await ticketAdminService.toggleTicketWhitelist(
              ticketNumber
            )
          } else {
            /*
              ====================================
              DELETE FLOW
              ====================================
            */

            const optimistic =
              allTicketsRef.current.filter(
                (t) =>
                  t.ticket_number !==
                  ticketNumber
              )

            allTicketsRef.current =
              optimistic

            setCachedData(
              queryKey,
              optimistic
            )

            await ticketAdminService.deleteTicket(
              ticketNumber
            )
          }
        } catch (error) {
          console.error(
            "TICKET_MUTATION_ERROR",
            error
          )

          /*
            IMPORTANT:
            Rollback safely.
          */

          allTicketsRef.current =
            previous

          setCachedData(
            queryKey,
            previous
          )

          throw error
        } finally {
          setTimeout(() => {
            mutationRef.current =
              false
          }, 250)
        }
      },
      [queryKey]
    )

  /* ========================================
     MANUAL REFRESH
  ======================================== */

  const refreshTickets =
    useCallback(async () => {
      if (
        mutationRef.current
      ) {
        return
      }

      const fresh =
        await fetchTickets()

      allTicketsRef.current =
        fresh

      setCachedData(
        queryKey,
        fresh
      )
    }, [
      fetchTickets,
      queryKey,
    ])

  /* ========================================
     PAGINATION
  ======================================== */

  const totalPages =
    useMemo(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredTickets.length /
            ITEMS_PER_PAGE
        )
      )
    }, [filteredTickets])

  const paginatedTickets =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE

      return filteredTickets.slice(
        start,
        start +
          ITEMS_PER_PAGE
      )
    }, [
      filteredTickets,
      currentPage,
    ])

  return {
    loading,
    refreshing:
      refreshing &&
      !mutationRef.current,

    search,
    setSearch,

    tickets:
      filteredTickets,

    paginatedTickets,

    currentPage,
    setCurrentPage,

    totalPages,

    blockTicket,

    refreshTickets,
  }
}