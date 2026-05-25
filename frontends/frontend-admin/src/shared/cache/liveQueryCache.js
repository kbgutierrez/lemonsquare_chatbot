const cacheStore = new Map()
const listenersStore = new Map()
const inflightStore = new Map()
const refreshLocks = new Map()
const abortControllers = new Map()
const requestVersionStore = new Map()
const CACHE_METADATA = new Map()

const DEFAULT_TTL = 1000 * 60 * 5
const STALE_TIME = 1000 * 15

/* ========================================
   SAFE CLONE
======================================== */

const safeClone = (value) => {
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
   VALIDATION
======================================== */

const isValidCacheEntry = (cache) => {
  return Boolean(
    cache &&
      typeof cache === "object" &&
      "data" in cache &&
      "timestamp" in cache &&
      "expiry" in cache
  )
}

/* ========================================
   HELPERS
======================================== */

const isExpired = (cache) => {
  if (!isValidCacheEntry(cache)) return true
  return Date.now() > cache.expiry
}

const isStale = (cache) => {
  if (!isValidCacheEntry(cache)) return true
  return Date.now() - cache.timestamp > STALE_TIME
}

/* ========================================
   DEDUPE ARRAY
======================================== */

const dedupeArray = (items = [], uniqueKey = "id") => {
  const map = new Map()

  for (const item of items) {
    if (!item || typeof item !== "object") continue

    const key =
      item?.[uniqueKey] ??
      item?.ticket_number ??
      item?.id

    if (key === undefined || key === null) continue

    map.set(key, item)
  }

  return Array.from(map.values())
}

/* ========================================
   REQUEST VERSIONING
======================================== */

export const createRequestVersion = (key) => {
  const version = Date.now() + Math.random()

  requestVersionStore.set(key, version)

  return version
}

export const isLatestRequestVersion = (key, version) => {
  return requestVersionStore.get(key) === version
}

/* ========================================
   ABORT MANAGEMENT
======================================== */

export const createAbortController = (key) => {
  abortActiveRequest(key)

  const controller = new AbortController()

  abortControllers.set(key, controller)

  return controller
}

export const getAbortSignal = (key) => {
  return abortControllers.get(key)?.signal
}

export const abortActiveRequest = (key) => {
  const controller = abortControllers.get(key)

  if (controller) {
    try {
      controller.abort()
    } catch (error) {
      console.error("ABORT_REQUEST_ERROR", error)
    }
  }

  abortControllers.delete(key)
  inflightStore.delete(key)
}

/* ========================================
   GET CACHE
======================================== */

export const getCachedData = (key) => {
  const cached = cacheStore.get(key)

  if (!isValidCacheEntry(cached)) return null

  if (isExpired(cached)) {
    invalidateCache(key)
    return null
  }

  return safeClone(cached.data)
}

/* ========================================
   GET FULL ENTRY
======================================== */

export const getCacheEntry = (key) => {
  const cache = cacheStore.get(key)

  if (!isValidCacheEntry(cache)) {
    invalidateCache(key)
    return null
  }

  if (isExpired(cache)) {
    invalidateCache(key)
    return null
  }

  return safeClone(cache)
}

/* ========================================
   INTERNAL WRITE
======================================== */

const writeCacheEntry = ({
  key,
  data,
  ttl = DEFAULT_TTL,
}) => {
  const payload = {
    data: safeClone(data),
    timestamp: Date.now(),
    expiry: Date.now() + ttl,
  }

  cacheStore.set(key, payload)

  CACHE_METADATA.set(key, {
    updatedAt: Date.now(),
  })

  notifySubscribers(key, payload.data)

  try {
    localStorage.setItem(
      `cache_${key}`,
      JSON.stringify(payload)
    )
  } catch (error) {
    console.error("CACHE_PERSIST_ERROR", error)
  }
}

/* ========================================
   SET CACHE
======================================== */

export const setCachedData = (
  key,
  data,
  ttl = DEFAULT_TTL
) => {
  try {
    writeCacheEntry({
      key,
      data,
      ttl,
    })
  } catch (error) {
    console.error("SET_CACHE_ERROR", error)
  }
}

/* ========================================
   APPEND CACHE
======================================== */

export const appendCachedData = ({
  key,
  incoming,
  uniqueKey = "ticket_number",
  ttl = DEFAULT_TTL,
}) => {
  try {
    const existing = getCachedData(key)

    const existingArray = Array.isArray(existing)
      ? existing
      : []

    const incomingArray = Array.isArray(incoming)
      ? incoming
      : []

    const merged = dedupeArray(
      [...existingArray, ...incomingArray],
      uniqueKey
    )

    writeCacheEntry({
      key,
      data: merged,
      ttl,
    })

    return safeClone(merged)
  } catch (error) {
    console.error("APPEND_CACHE_ERROR", error)
    return []
  }
}

/* ========================================
   HYDRATE CACHE
======================================== */

export const hydrateCache = (key) => {
  try {
    const raw = localStorage.getItem(`cache_${key}`)

    if (!raw) return null

    const parsed = JSON.parse(raw)

    if (!isValidCacheEntry(parsed)) {
      invalidateCache(key)
      return null
    }

    if (isExpired(parsed)) {
      invalidateCache(key)
      return null
    }

    cacheStore.set(key, safeClone(parsed))

    return safeClone(parsed.data)
  } catch (error) {
    console.error("CACHE_HYDRATE_ERROR", error)

    invalidateCache(key)

    return null
  }
}

/* ========================================
   SUBSCRIBE
======================================== */

export const subscribeCache = (
  key,
  callback
) => {
  if (!listenersStore.has(key)) {
    listenersStore.set(key, new Set())
  }

  listenersStore.get(key).add(callback)

  return () => {
    listenersStore.get(key)?.delete(callback)
  }
}

/* ========================================
   NOTIFY
======================================== */

const notifySubscribers = (
  key,
  data
) => {
  const listeners =
    listenersStore.get(key)

  if (!listeners) return

  requestAnimationFrame(() => {
    listeners.forEach((listener) => {
      try {
        listener(safeClone(data))
      } catch (error) {
        console.error(
          "CACHE_SUBSCRIBER_ERROR",
          error
        )
      }
    })
  })
}

/* ========================================
   INVALIDATE
======================================== */

export const invalidateCache = (
  key
) => {
  cacheStore.delete(key)
  inflightStore.delete(key)
  refreshLocks.delete(key)
  requestVersionStore.delete(key)

  abortActiveRequest(key)

  CACHE_METADATA.delete(key)

  localStorage.removeItem(
    `cache_${key}`
  )
}

/* ========================================
   CLEAR ALL
======================================== */

export const clearAllCache = () => {
  cacheStore.clear()
  inflightStore.clear()
  refreshLocks.clear()
  listenersStore.clear()
  CACHE_METADATA.clear()
  requestVersionStore.clear()

  abortControllers.forEach(
    (controller) => {
      try {
        controller.abort()
      } catch {}
    }
  )

  abortControllers.clear()

  Object.keys(localStorage).forEach(
    (key) => {
      if (key.startsWith("cache_")) {
        localStorage.removeItem(key)
      }
    }
  )
}

/* ========================================
   FETCH WITH CACHE
======================================== */

export const fetchWithCache = async ({
  key,
  fetcher,
  ttl = DEFAULT_TTL,
  force = false,
}) => {
  let cached = getCachedData(key)

  if (!cached) {
    cached = hydrateCache(key)
  }

  if (cached && !force) {
    const fullCache =
      cacheStore.get(key)

    if (isStale(fullCache)) {
      backgroundRefresh({
        key,
        fetcher,
        ttl,
      })
    }

    return safeClone(cached)
  }

  if (inflightStore.has(key)) {
    return inflightStore.get(key)
  }

  const promise = (async () => {
    try {
      const data =
        await fetcher()

      setCachedData(
        key,
        data,
        ttl
      )

      return safeClone(data)
    } catch (error) {
      console.error(
        "FETCH_WITH_CACHE_ERROR",
        error
      )

      throw error
    } finally {
      inflightStore.delete(key)
    }
  })()

  inflightStore.set(key, promise)

  return promise
}

/* ========================================
   BACKGROUND REFRESH
======================================== */

const backgroundRefresh = async ({
  key,
  fetcher,
  ttl,
}) => {
  if (refreshLocks.has(key)) {
    return
  }

  refreshLocks.set(key, true)

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
    refreshLocks.delete(key)
  }
}

/* ========================================
   DEBUG
======================================== */

export const getCacheDebugSnapshot =
  () => {
    return {
      cacheKeys:
        Array.from(cacheStore.keys()),

      inflightKeys:
        Array.from(inflightStore.keys()),

      listenerKeys:
        Array.from(listenersStore.keys()),

      refreshKeys:
        Array.from(refreshLocks.keys()),

      abortKeys:
        Array.from(abortControllers.keys()),
    }
  }