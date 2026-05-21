import { useState, useMemo } from "react"
import useLiveQuery from "../../shared/hooks/useLiveQuery.js"
import { useDebounce } from "../../shared/hooks/useDebounce.js"
import { usePagination } from "../../shared/hooks/usePagination.js"
import { normalizeData } from "../../shared/utils/normalize.js"

const FALLBACK = { manualEntries: [] }

export const useManualEntries = () => {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)

  const { data: rawData, loading, error, refresh } = useLiveQuery({
    queryKey: "manual_entries",
    queryFn: async () => {
      const res = await fetch("/api/knowledge/explore", { headers: { "Accept": "application/json" } })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      return normalizeData(json, FALLBACK)
    },
    initialData: FALLBACK,
  })

  const allEntries = useMemo(() => {
    const entries = rawData?.manualEntries || []
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(e =>
      String(e.title || "").toLowerCase().includes(q) ||
      String(e.category || "").toLowerCase().includes(q) ||
      String(e.content || "").toLowerCase().includes(q)
    )
  }, [rawData, debouncedQuery])

  const pagination = usePagination({ items: allEntries, itemsPerPage: 10, resetDeps: [debouncedQuery] })

  return { allEntries, loading, error, refresh, query, setQuery, ...pagination }
}

export default useManualEntries
