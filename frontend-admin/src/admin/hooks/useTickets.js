import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import ticketAdminService from "../services/ticketAdminService"
import useLiveQuery from "../../shared/hooks/useLiveQuery"
import { invalidateCache, setCachedData } from "../../shared/cache/liveQueryCache"

const ITEMS_PER_PAGE = 10
const SEARCH_DEBOUNCE = 400
const CACHE_KEY = "tickets_cache"
const POLL_INTERVAL = 15000

export const useTickets = () => {
  const mountedRef = useRef(true)
  const debounceRef = useRef(null)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  /* ========================================
     CLEANUP
  ======================================== */
  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      clearTimeout(debounceRef.current)
    }
  }, [])

  /* ========================================
     SEARCH DEBOUNCE
  ======================================== */
  useEffect(() => {
    setCurrentPage(1)
    clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setDebouncedSearch(search)
      }
    }, SEARCH_DEBOUNCE)
  }, [search])

  /* ========================================
     QUERY KEY
  ======================================== */
  const queryKey = `${CACHE_KEY}_${debouncedSearch}`

  /* ========================================
     FETCHER
  ======================================== */
  const fetchTickets = useCallback(async () => {
    const response = await ticketAdminService.getTickets({
      search: debouncedSearch,
    })

    if (Array.isArray(response)) return response
    if (Array.isArray(response?.data)) return response.data

    console.warn("INVALID_TICKETS_RESPONSE", response)
    return []
  }, [debouncedSearch])

  /* ========================================
     LIVE QUERY
  ======================================== */
  const { data: tickets, loading, refresh } = useLiveQuery({
    queryKey,
    queryFn: fetchTickets,
    initialData: [],
    refetchInterval: POLL_INTERVAL,
    staleWhileRevalidate: true,
  })

  /* ========================================
     SAFE ARRAY
  ======================================== */
  const safeTickets = useMemo(() => {
    return Array.isArray(tickets) ? tickets : []
  }, [tickets])

  /* ========================================
     BLOCK / UNBLOCK (OPTIMISTIC UPDATE)
  ======================================== */
  const blockTicket = useCallback(
    async (ticketNumber) => {
      const previous = [...safeTickets]

      const target = safeTickets.find(
        (t) => t.ticket_number === ticketNumber
      )

      if (!target) return

      const nextStatus = !target.is_blacklisted

      const optimistic = safeTickets.map((t) => {
        if (t.ticket_number === ticketNumber) {
          return {
            ...t,
            is_blacklisted: nextStatus,
          }
        }
        return t
      })

      setCachedData(queryKey, optimistic)

      try {
        await ticketAdminService.toggleTicketWhitelist(ticketNumber)

        invalidateCache(queryKey)
        await refresh()
      } catch (error) {
        console.error("TOGGLE_TICKET_ERROR", error)
        setCachedData(queryKey, previous)
      }
    },
    [safeTickets, queryKey, refresh]
  )

  /* ========================================
     FOCUS REFRESH
  ======================================== */
  useEffect(() => {
    const handleFocus = () => refresh()

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [refresh])

  /* ========================================
     PAGINATION
  ======================================== */
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(safeTickets.length / ITEMS_PER_PAGE))
  }, [safeTickets])

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return safeTickets.slice(start, start + ITEMS_PER_PAGE)
  }, [safeTickets, currentPage])

  return {
    loading,

    search,
    setSearch,

    tickets: safeTickets,
    paginatedTickets,

    currentPage,
    setCurrentPage,

    totalPages,

    blockTicket,

    refreshTickets: refresh,
  }
}