import { useState, useMemo, useCallback } from "react"
import useLiveQuery from "../../shared/hooks/useLiveQuery.js"
import { useDebounce } from "../../shared/hooks/useDebounce.js"
import { usePagination } from "../../shared/hooks/usePagination.js"

export const useKnowledgeFiles = () => {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)

  const { data: rawData, loading, error, refresh } = useLiveQuery({
    queryKey: "knowledge_files",
    queryFn: async () => {
      const res = await fetch("/api/knowledge/explore", { headers: { "Accept": "application/json" } })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      return Array.isArray(json) ? json : json?.files || []
    },
    initialData: [],
  })

  const allFiles = useMemo(() => {
    const files = Array.isArray(rawData) ? rawData : []
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) return files
    return files.filter(f =>
      String(f.filename || f.name || "").toLowerCase().includes(q) ||
      String(f.title || "").toLowerCase().includes(q) ||
      String(f.status || "").toLowerCase().includes(q)
    )
  }, [rawData, debouncedQuery])

  const pagination = usePagination({ items: allFiles, itemsPerPage: 10, resetDeps: [debouncedQuery] })

  const deleteFile = useCallback(async (documentId) => {
    const res = await fetch(`/api/documents/${documentId}`, { method: "DELETE" })
    if (!res.ok) throw new Error(await res.text())
    refresh()
  }, [refresh])

  const updateFile = useCallback(async (documentId, title, status) => {
    const res = await fetch(`/api/documents/${documentId}`, {
      method: "PUT", headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ title, status }),
    })
    if (!res.ok) throw new Error(await res.text())
    refresh()
  }, [refresh])

  return { allFiles, loading, error, refresh, deleteFile, updateFile, query, setQuery, ...pagination }
}

export default useKnowledgeFiles
