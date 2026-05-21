import { useCallback, useEffect, useRef, useState } from "react"
import { fetchWithCache, getCachedData, hydrateCache, subscribeCache } from "../cache/liveQueryCache.js"
import { normalizeData } from "../utils/normalize.js"

const useLiveQuery = ({ queryKey, queryFn, ttl, enabled = true, refetchInterval = null, staleWhileRevalidate = true, keepPreviousData = true, initialData = null }) => {
  const mountedRef = useRef(true)
  const pollingRef = useRef(null)
  const fetchingRef = useRef(false)
  const initialDataRef = useRef(structuredClone(initialData))

  const getInitialData = () => {
    const memory = getCachedData(queryKey)
    if (memory !== undefined && memory !== null) return normalizeData(memory, initialDataRef.current)
    const hydrated = hydrateCache(queryKey)
    return normalizeData(hydrated, initialDataRef.current)
  }

  const [data, setData] = useState(getInitialData)
  const [loading, setLoading] = useState(() => { const cached = getCachedData(queryKey); return cached === undefined || cached === null })
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { return () => { mountedRef.current = false; if (pollingRef.current) clearInterval(pollingRef.current) } }, [])

  useEffect(() => {
    const unsubscribe = subscribeCache(queryKey, (updated) => { if (!mountedRef.current) return; setData(normalizeData(updated, initialDataRef.current)) })
    return unsubscribe
  }, [queryKey])

  const execute = useCallback(async ({ force = false, silent = false } = {}) => {
    if (!enabled || fetchingRef.current) return data
    fetchingRef.current = true; setError(null)
    if (!silent) { const existing = getCachedData(queryKey); if (!existing && !keepPreviousData) setData(structuredClone(initialDataRef.current)); if (!existing) setLoading(true) }
    else setRefreshing(true)
    try {
      const result = await fetchWithCache({ key: queryKey, fetcher: queryFn, ttl, force })
      const normalized = normalizeData(result, initialDataRef.current)
      if (mountedRef.current) setData(normalized)
      return normalized
    } catch (err) {
      console.error("LIVE_QUERY_ERROR", err)
      if (mountedRef.current) { setError(err?.message || "Failed to fetch data."); setData(structuredClone(initialDataRef.current)) }
      return structuredClone(initialDataRef.current)
    } finally {
      fetchingRef.current = false
      if (mountedRef.current) { setLoading(false); setRefreshing(false) }
    }
  }, [enabled, keepPreviousData, queryFn, queryKey, ttl])

  useEffect(() => { if (!enabled) return; execute({ silent: staleWhileRevalidate }) }, [enabled, queryKey, staleWhileRevalidate, execute])

  useEffect(() => {
    if (!enabled || !refetchInterval) return
    pollingRef.current = setInterval(() => execute({ silent: true, force: true }), refetchInterval)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [enabled, refetchInterval, execute])

  useEffect(() => {
    if (!enabled) return
    const handleFocus = () => execute({ force: true, silent: true })
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [enabled, execute])

  const refresh = useCallback(() => execute({ force: true, silent: true }), [execute])

  return { data, loading, refreshing, error, refresh }
}

export default useLiveQuery
