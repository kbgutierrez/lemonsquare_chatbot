const cacheStore =
  new Map()

const listenersStore =
  new Map()

const inflightStore =
  new Map()

const refreshTimers =
  new Map()

const CACHE_METADATA =
  new Map()

const DEFAULT_TTL =
  1000 * 60 * 5

const STALE_TIME =
  1000 * 15

/* ========================================
   SAFE CLONE
======================================== */

const safeClone =
  (value) => {

    try {

      return structuredClone(
        value
      )

    } catch {

      try {

        return JSON.parse(
          JSON.stringify(value)
        )

      } catch {

        return value
      }
    }
  }

/* ========================================
   VALIDATE CACHE ENTRY
======================================== */

const isValidCacheEntry =
  (cache) => {

    return Boolean(
      cache &&
      typeof cache ===
        "object" &&
      "data" in cache &&
      "timestamp" in cache &&
      "expiry" in cache
    )
  }

/* ========================================
   HELPERS
======================================== */

const isExpired =
  (cache) => {

    if (
      !isValidCacheEntry(
        cache
      )
    ) {

      return true
    }

    return (
      Date.now() >
      cache.expiry
    )
  }

const isStale =
  (cache) => {

    if (
      !isValidCacheEntry(
        cache
      )
    ) {

      return true
    }

    return (
      Date.now() -
      cache.timestamp >
      STALE_TIME
    )
  }

/* ========================================
   GET CACHE
======================================== */

export const getCachedData =
  (key) => {

    const cached =
      cacheStore.get(key)

    if (
      !isValidCacheEntry(
        cached
      )
    ) {

      return null
    }

    if (
      isExpired(cached)
    ) {

      invalidateCache(key)

      return null
    }

    return safeClone(
      cached.data
    )
  }

/* ========================================
   GET FULL CACHE
======================================== */

export const getCacheEntry =
  (key) => {

    const cache =
      cacheStore.get(key)

    if (
      !isValidCacheEntry(
        cache
      )
    ) {

      invalidateCache(key)

      return null
    }

    if (
      isExpired(cache)
    ) {

      invalidateCache(key)

      return null
    }

    return safeClone(
      cache
    )
  }

/* ========================================
   SET CACHE
======================================== */

export const setCachedData =
  (
    key,
    data,
    ttl = DEFAULT_TTL
  ) => {

    try {

      const safeData =
        safeClone(data)

      const payload = {
        data:
          safeData,

        timestamp:
          Date.now(),

        expiry:
          Date.now() + ttl,
      }

      cacheStore.set(
        key,
        payload
      )

      CACHE_METADATA.set(
        key,
        {
          updatedAt:
            Date.now(),
        }
      )

      notifySubscribers(
        key,
        safeClone(
          safeData
        )
      )

      try {

        localStorage.setItem(
          `cache_${key}`,

          JSON.stringify(
            payload
          )
        )

      } catch (error) {

        console.error(
          "CACHE_PERSIST_ERROR",
          error
        )
      }

    } catch (error) {

      console.error(
        "SET_CACHE_ERROR",
        error
      )
    }
  }

/* ========================================
   HYDRATE CACHE
======================================== */

export const hydrateCache =
  (key) => {

    try {

      const raw =
        localStorage.getItem(
          `cache_${key}`
        )

      if (!raw) {
        return null
      }

      const parsed =
        JSON.parse(raw)

      if (
        !isValidCacheEntry(
          parsed
        )
      ) {

        console.warn(
          "INVALID_CACHE_STRUCTURE",
          key
        )

        invalidateCache(key)

        return null
      }

      if (
        isExpired(parsed)
      ) {

        invalidateCache(key)

        return null
      }

      cacheStore.set(
        key,
        safeClone(
          parsed
        )
      )

      return safeClone(
        parsed.data
      )

    } catch (error) {

      console.error(
        "CACHE_HYDRATE_ERROR",
        error
      )

      invalidateCache(key)

      return null
    }
  }

/* ========================================
   SUBSCRIBE
======================================== */

export const subscribeCache =
  (
    key,
    callback
  ) => {

    if (
      !listenersStore.has(
        key
      )
    ) {

      listenersStore.set(
        key,
        new Set()
      )
    }

    listenersStore
      .get(key)
      .add(callback)

    return () => {

      listenersStore
        .get(key)
        ?.delete(callback)
    }
  }

/* ========================================
   NOTIFY
======================================== */

const notifySubscribers =
  (
    key,
    data
  ) => {

    const listeners =
      listenersStore.get(
        key
      )

    if (!listeners) {
      return
    }

    requestAnimationFrame(() => {

      listeners.forEach(
        (
          listener
        ) => {

          try {

            listener(
              safeClone(
                data
              )
            )

          } catch (error) {

            console.error(
              "CACHE_SUBSCRIBER_ERROR",
              error
            )
          }
        }
      )
    })
  }

/* ========================================
   INVALIDATE
======================================== */

export const invalidateCache =
  (key) => {

    cacheStore.delete(key)

    inflightStore.delete(key)

    refreshTimers.delete(key)

    CACHE_METADATA.delete(key)

    localStorage.removeItem(
      `cache_${key}`
    )
  }

/* ========================================
   CLEAR ALL
======================================== */

export const clearAllCache =
  () => {

    cacheStore.clear()

    inflightStore.clear()

    refreshTimers.clear()

    listenersStore.clear()

    CACHE_METADATA.clear()

    Object.keys(
      localStorage
    ).forEach(
      (key) => {

        if (
          key.startsWith(
            "cache_"
          )
        ) {

          localStorage.removeItem(
            key
          )
        }
      }
    )
  }

/* ========================================
   PREFETCH
======================================== */

export const prefetchCache =
  async ({
    key,
    fetcher,
    ttl = DEFAULT_TTL,
  }) => {

    try {

      await fetchWithCache({
        key,
        fetcher,
        ttl,
      })

    } catch (error) {

      console.error(
        "PREFETCH_ERROR",
        error
      )
    }
  }

/* ========================================
   FETCH WITH CACHE
======================================== */

export const fetchWithCache =
  async ({
    key,
    fetcher,
    ttl = DEFAULT_TTL,
    force = false,
  }) => {

    let cached =
      getCachedData(key)

    /* HYDRATE */

    if (
      cached === null ||
      cached === undefined
    ) {

      cached =
        hydrateCache(key)
    }

    /* CACHE HIT */

    if (
      cached !== null &&
      cached !== undefined &&
      !force
    ) {

      const fullCache =
        cacheStore.get(key)

      if (
        isStale(fullCache)
      ) {

        backgroundRefresh({
          key,
          fetcher,
          ttl,
        })
      }

      return safeClone(
        cached
      )
    }

    /* DEDUPE */

    if (
      inflightStore.has(key)
    ) {

      return inflightStore.get(
        key
      )
    }

    const promise =
      (async () => {

        try {

          const data =
            await fetcher()

          setCachedData(
            key,
            data,
            ttl
          )

          return safeClone(
            data
          )

        } catch (error) {

          console.error(
            "FETCH_WITH_CACHE_ERROR",
            error
          )

          throw error

        } finally {

          inflightStore.delete(
            key
          )
        }
      })()

    inflightStore.set(
      key,
      promise
    )

    return promise
  }

/* ========================================
   BACKGROUND REFRESH
======================================== */

const backgroundRefresh =
  async ({
    key,
    fetcher,
    ttl,
  }) => {

    if (
      refreshTimers.has(
        key
      )
    ) {
      return
    }

    refreshTimers.set(
      key,
      true
    )

    try {

      const data =
        await fetcher()

      setCachedData(
        key,
        data,
        ttl
      )

    } catch (error) {

      console.error(
        "BACKGROUND_REFRESH_ERROR",
        error
      )

    } finally {

      refreshTimers.delete(
        key
      )
    }
  }

/* ========================================
   CACHE DEBUG
======================================== */

export const getCacheDebugSnapshot =
  () => {

    return {
      cacheKeys:
        Array.from(
          cacheStore.keys()
        ),

      inflightKeys:
        Array.from(
          inflightStore.keys()
        ),

      listenerKeys:
        Array.from(
          listenersStore.keys()
        ),

      refreshKeys:
        Array.from(
          refreshTimers.keys()
        ),
    }
  }