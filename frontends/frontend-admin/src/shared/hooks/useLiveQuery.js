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
  createRequestVersion,
  isLatestRequestVersion,
  abortActiveRequest,
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

const normalizeData = (
  value,
  fallback
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return cloneData(fallback)
  }

  if (
    Array.isArray(fallback)
  ) {
    return Array.isArray(value)
      ? cloneData(value)
      : cloneData(fallback)
  }

  if (
    typeof fallback ===
      "object" &&
    fallback !== null &&
    !Array.isArray(fallback)
  ) {
    if (
      typeof value !==
        "object" ||
      value === null ||
      Array.isArray(value)
    ) {
      return cloneData(
        fallback
      )
    }

    return {
      ...cloneData(
        fallback
      ),

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
  staleWhileRevalidate = false,
  keepPreviousData = true,
  initialData = null,

  /*
    NEW:
    Enterprise cache-first mode.

    If cache exists:
    - NO automatic fetch
    - render cache instantly
    - wait for manual refresh
  */

  fetchOnMount = true,

  /*
    NEW:
    Disable focus refresh if needed.
  */

  refreshOnFocus = false,
}) => {
  const mountedRef =
    useRef(true)

  const pollingRef =
    useRef(null)

  const fetchingRef =
    useRef(false)

  const dataRef =
    useRef(initialData)

  const requestVersionRef =
    useRef(null)

  const initialDataRef =
    useRef(
      cloneData(initialData)
    )

  /*
    IMPORTANT:
    Detect existing cache once.
  */

  const hasInitialCacheRef =
    useRef(false)

  /* ========================================
     INITIAL DATA
  ======================================== */

  const getInitialData =
    () => {
      const memory =
        getCachedData(
          queryKey
        )

      if (
        memory !==
          undefined &&
        memory !== null
      ) {
        hasInitialCacheRef.current =
          true

        return normalizeData(
          memory,
          initialDataRef.current
        )
      }

      const hydrated =
        hydrateCache(
          queryKey
        )

      if (
        hydrated !==
          undefined &&
        hydrated !== null
      ) {
        hasInitialCacheRef.current =
          true
      }

      return normalizeData(
        hydrated,
        initialDataRef.current
      )
    }

  const [data, setData] =
    useState(
      getInitialData
    )

  const [
    loading,
    setLoading,
  ] = useState(() => {
    return !hasInitialCacheRef.current
  })

  const [
    error,
    setError,
  ] = useState(null)

  const [
    refreshing,
    setRefreshing,
  ] = useState(false)

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

      if (
        pollingRef.current
      ) {
        clearInterval(
          pollingRef.current
        )
      }

      abortActiveRequest(
        queryKey
      )
    }
  }, [queryKey])

  /* ========================================
     CACHE SUBSCRIPTION
  ======================================== */

  useEffect(() => {
    const unsubscribe =
      subscribeCache(
        queryKey,
        (
          updatedData
        ) => {
          if (
            !mountedRef.current
          ) {
            return
          }

          setData(
            normalizeData(
              updatedData,
              initialDataRef.current
            )
          )

          setLoading(false)
        }
      )

    return unsubscribe
  }, [queryKey])

  /* ========================================
     EXECUTE
  ======================================== */

  const execute =
    useCallback(
      async ({
        force = false,
        silent = false,
      } = {}) => {
        if (
          !enabled
        ) {
          return dataRef.current
        }

        /*
          IMPORTANT:
          CACHE-FIRST SHORT CIRCUIT

          If cache exists and:
          - not forced
          - not stale refresh
          - not manual refresh

          THEN:
          skip network entirely.
        */

        const existingCache =
          getCachedData(
            queryKey
          )

        if (
          existingCache &&
          !force
        ) {
          return existingCache
        }

        if (
          fetchingRef.current
        ) {
          return dataRef.current
        }

        fetchingRef.current = true

        const requestVersion =
          createRequestVersion(
            queryKey
          )

        requestVersionRef.current =
          requestVersion

        try {
          setError(null)

          const existing =
            getCachedData(
              queryKey
            )

          if (
            !existing &&
            !silent
          ) {
            setLoading(true)
          }

          if (
            existing &&
            silent
          ) {
            setRefreshing(true)
          }

          if (
            !existing &&
            !keepPreviousData
          ) {
            setData(
              cloneData(
                initialDataRef.current
              )
            )
          }

          const result =
            await fetchWithCache(
              {
                key: queryKey,

                fetcher:
                  queryFn,

                ttl,

                force,
              }
            )

          if (
            !isLatestRequestVersion(
              queryKey,
              requestVersion
            )
          ) {
            console.warn(
              "STALE_QUERY_RESULT_DROPPED"
            )

            return dataRef.current
          }

          const normalized =
            normalizeData(
              result,
              initialDataRef.current
            )

          const latestCache =
            getCachedData(
              queryKey
            )

          if (
            mountedRef.current
          ) {
            if (
              latestCache &&
              Array.isArray(
                latestCache
              ) &&
              latestCache.length >
                0
            ) {
              setData(
                normalizeData(
                  latestCache,
                  initialDataRef.current
                )
              )
            } else {
              setData(
                normalized
              )
            }
          }

          return normalized
        } catch (err) {
          if (
            err?.message ===
            "Request aborted"
          ) {
            console.log(
              "LIVE_QUERY_ABORTED"
            )

            return dataRef.current
          }

          console.error(
            "LIVE_QUERY_ERROR",
            err
          )

          if (
            mountedRef.current
          ) {
            setError(
              err?.message ||
                "Failed to fetch data."
            )
          }

          return dataRef.current
        } finally {
          fetchingRef.current = false

          if (
            mountedRef.current
          ) {
            setLoading(false)
            setRefreshing(false)
          }
        }
      },
      [
        enabled,
        keepPreviousData,
        queryFn,
        queryKey,
        ttl,
      ]
    )

  /* ========================================
     INITIAL FETCH
  ======================================== */

  useEffect(() => {
    if (!enabled) {
      return
    }

    /*
      IMPORTANT:
      TRUE CACHE-FIRST MODE

      If cache already exists:
      DO NOT fetch again.
    */

    if (
      hasInitialCacheRef.current &&
      !staleWhileRevalidate
    ) {
      return
    }

    if (!fetchOnMount) {
      return
    }

    execute({
      silent:
        staleWhileRevalidate,
    })
  }, [
    enabled,
    queryKey,
    staleWhileRevalidate,
    execute,
    fetchOnMount,
  ])

  /* ========================================
     POLLING
  ======================================== */

  useEffect(() => {
    if (
      !enabled ||
      !refetchInterval
    ) {
      return
    }

    pollingRef.current =
      setInterval(() => {
        execute({
          silent: true,
          force: true,
        })
      }, refetchInterval)

    return () => {
      if (
        pollingRef.current
      ) {
        clearInterval(
          pollingRef.current
        )
      }
    }
  }, [
    enabled,
    refetchInterval,
    execute,
  ])

  /* ========================================
     FOCUS REFRESH
  ======================================== */

  useEffect(() => {
    if (
      !enabled ||
      !refreshOnFocus
    ) {
      return
    }

    const handleFocus =
      () => {
        execute({
          force: true,
          silent: true,
        })
      }

    window.addEventListener(
      "focus",
      handleFocus
    )

    return () =>
      window.removeEventListener(
        "focus",
        handleFocus
      )
  }, [
    enabled,
    execute,
    refreshOnFocus,
  ])

  /* ========================================
     MANUAL REFRESH
  ======================================== */

  const refresh =
    useCallback(() => {
      return execute({
        force: true,
        silent: true,
      })
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