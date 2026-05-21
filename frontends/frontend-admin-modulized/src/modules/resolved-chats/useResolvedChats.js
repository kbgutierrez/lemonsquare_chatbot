import { useState, useMemo } from "react"
import useLiveQuery from "../../shared/hooks/useLiveQuery.js"
import { useDebounce } from "../../shared/hooks/useDebounce.js"
import { usePagination } from "../../shared/hooks/usePagination.js"
import { normalizeData } from "../../shared/utils/normalize.js"

const FALLBACK = { resolvedChats: [] }

export const useResolvedChats = () => {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)

  const { data: rawData, loading, error, refresh } = useLiveQuery({
    queryKey: "resolved_chats",
    queryFn: async () => {
      const res = await fetch("/api/knowledge/explore", { headers: { "Accept": "application/json" } })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      return normalizeData(json, FALLBACK)
    },
    initialData: FALLBACK,
  })

  const allChats = useMemo(() => {
    const chats = rawData?.resolvedChats || []
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) return chats
    return chats.filter(c =>
      String(c.session_id || "").toLowerCase().includes(q) ||
      String(c.topic || "").toLowerCase().includes(q) ||
      String(c.user_email || "").toLowerCase().includes(q) ||
      String(c.resolution || "").toLowerCase().includes(q)
    )
  }, [rawData, debouncedQuery])

  const pagination = usePagination({ items: allChats, itemsPerPage: 10, resetDeps: [debouncedQuery] })

  return { allChats, loading, error, refresh, query, setQuery, ...pagination }
}

export default useResolvedChats
