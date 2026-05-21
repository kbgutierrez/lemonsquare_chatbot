import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

import {
  fetchWithCache,
  getCachedData,
  hydrateCache,
  subscribeCache,
} from "../cache/liveQueryCache"

/* ========================================
   SAFE CLONE
======================================== */

const cloneData = (value) => {
  try {
    return structuredClone(value)
  } catch {
    try {
      return JSON.parse(JSON.stringify(value))
    } catch {
      return value
    }
  }
}

/* ========================================
   NORMALIZE DATA
======================================== */

const normalizeData = (value, fallback) => {
  if (value === undefined || value === null) {
    return cloneData(fallback)
  }

  if (Array.isArray(fallback)) {
    return Array.isArray(value) ? cloneData(value) : cloneData(fallback)
  }

  if (
    typeof fallback === "object" &&
    fallback !== null &&
    !Array.isArray(fallback)
  ) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return cloneData(fallback)
    }

    return {
      ...cloneData(fallback),
      ...cloneData(value),
    }
  }

  return cloneData(value)
}

const useLiveQuery = ({
  queryKey,
  queryFn,
  ttl,
  enabled = true,
  refetchInterval = null,
  staleWhileRevalidate = true,
  keepPreviousData = true,
  initialData = null,
}) => {
  const mountedRef = useRef(true)
  const pollingRef = useRef(null)
  const fetchingRef = useRef(false)
  const dataRef = useRef(initialData)
  const initialDataRef = useRef(cloneData(initialData))

  /* ========================================
     INITIAL DATA
  ======================================== */
  const getInitialData = () => {
    const memory = getCachedData(queryKey)

    if (memory !== undefined && memory !== null) {
      return normalizeData(memory, initialDataRef.current)
    }

    const hydrated = hydrateCache(queryKey)
    return normalizeData(hydrated, initialDataRef.current)
  }

  const [data, setData] = useState(getInitialData)

  const [loading, setLoading] = useState(() => {
    const cached = getCachedData(queryKey)
    return cached === undefined || cached === null
  })

  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  /* ========================================
     SYNC REF
  ======================================== */
  useEffect(() => {
    dataRef.current = data
  }, [data])

  /* ========================================
     MOUNT
  ======================================== */
  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  /* ========================================
     CACHE SUBSCRIPTION
  ======================================== */
  useEffect(() => {
    const unsubscribe = subscribeCache(queryKey, (updatedData) => {
      if (!mountedRef.current) return

      setData(normalizeData(updatedData, initialDataRef.current))
    })

    return unsubscribe
  }, [queryKey])

  /* ========================================
     EXECUTE
  ======================================== */
  const execute = useCallback(
    async ({ force = false, silent = false } = {}) => {
      if (!enabled || fetchingRef.current) {
        return dataRef.current
      }

      try {
        fetchingRef.current = true
        setError(null)

        if (silent) {
          setRefreshing(true)
        } else {
          const existing = getCachedData(queryKey)

          if (!existing && !keepPreviousData) {
            setData(cloneData(initialDataRef.current))
          }

          if (!existing) setLoading(true)
        }

        const result = await fetchWithCache({
          key: queryKey,
          fetcher: queryFn,
          ttl,
          force,
        })

        const normalized = normalizeData(result, initialDataRef.current)

        if (mountedRef.current) {
          setData(normalized)
        }

        return normalized
      } catch (err) {
        console.error("LIVE_QUERY_ERROR", err)

        if (mountedRef.current) {
          setError(err?.message || "Failed to fetch data.")
          setData(cloneData(initialDataRef.current))
        }

        return cloneData(initialDataRef.current)
      } finally {
        fetchingRef.current = false

        if (mountedRef.current) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    },
    [enabled, keepPreviousData, queryFn, queryKey, ttl]
  )

  /* ========================================
     INITIAL FETCH
  ======================================== */
  useEffect(() => {
    if (!enabled) return

    execute({ silent: staleWhileRevalidate })
  }, [enabled, queryKey, staleWhileRevalidate, execute])

  /* ========================================
     POLLING
  ======================================== */
  useEffect(() => {
    if (!enabled || !refetchInterval) return

    pollingRef.current = setInterval(() => {
      execute({ silent: true, force: true })
    }, refetchInterval)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [enabled, refetchInterval, execute])

  /* ========================================
     FOCUS REFRESH
  ======================================== */
  useEffect(() => {
    if (!enabled) return

    const handleFocus = () => {
      execute({ force: true, silent: true })
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [enabled, execute])

  /* ========================================
     MANUAL REFRESH
  ======================================== */
  const refresh = useCallback(() => {
    return execute({ force: true, silent: true })
  }, [execute])

  return {
    data,
    loading,
    refreshing,
    error,
    refresh,
  }
}

export default useLiveQuery