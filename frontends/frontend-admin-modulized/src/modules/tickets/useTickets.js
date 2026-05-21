import { useState, useMemo } from "react"
import useLiveQuery from "../../shared/hooks/useLiveQuery.js"
import { useDebounce } from "../../shared/hooks/useDebounce.js"
import { usePagination } from "../../shared/hooks/usePagination.js"
import { normalizeData } from "../../shared/utils/normalize.js"

const FALLBACK = { tickets: [] }

export const useTickets = () => {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)

  const { data: rawData, loading, error, refresh } = useLiveQuery({
    queryKey: "tickets",
    queryFn: async () => {
      const res = await fetch("/api/tickets", { headers: { "Accept": "application/json" } })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      return normalizeData(json, FALLBACK)
    },
    initialData: FALLBACK,
  })

  const allTickets = useMemo(() => {
    const tickets = Array.isArray(rawData) ? rawData : (rawData?.tickets || [])
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) return tickets
    return tickets.filter(t =>
      String(t.ticket_number || "").toLowerCase().includes(q) ||
      String(t.subject || "").toLowerCase().includes(q) ||
      String(t.requester_email || "").toLowerCase().includes(q) ||
      String(t.status || "").toLowerCase().includes(q) ||
      String(t.priority || "").toLowerCase().includes(q)
    )
  }, [rawData, debouncedQuery])

  const pagination = usePagination({ items: allTickets, itemsPerPage: 10, resetDeps: [debouncedQuery] })

  return { allTickets, loading, error, refresh, query, setQuery, ...pagination }
}

export default useTickets
