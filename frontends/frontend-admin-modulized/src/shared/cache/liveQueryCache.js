const cacheStore = new Map()
const listenersStore = new Map()
const inflightStore = new Map()
const refreshLocks = new Map()
const CACHE_METADATA = new Map()
const DEFAULT_TTL = 1000 * 60 * 5
const STALE_TIME = 1000 * 15

const safeClone = (value) => {
  try { return structuredClone(value) } catch { try { return JSON.parse(JSON.stringify(value)) } catch { return value } }
}

const isValidCacheEntry = (cache) => Boolean(cache && typeof cache === "object" && "data" in cache && "timestamp" in cache && "expiry" in cache)

const isExpired = (cache) => { if (!isValidCacheEntry(cache)) return true; return Date.now() > cache.expiry }
const isStale = (cache) => { if (!isValidCacheEntry(cache)) return true; return Date.now() - cache.timestamp > STALE_TIME }

export const getCachedData = (key) => {
  const cached = cacheStore.get(key)
  if (!isValidCacheEntry(cached)) return null
  if (isExpired(cached)) { invalidateCache(key); return null }
  return safeClone(cached.data)
}

export const getCacheEntry = (key) => {
  const cache = cacheStore.get(key)
  if (!isValidCacheEntry(cache)) { invalidateCache(key); return null }
  if (isExpired(cache)) { invalidateCache(key); return null }
  return safeClone(cache)
}

export const setCachedData = (key, data, ttl = DEFAULT_TTL) => {
  try {
    const payload = { data: safeClone(data), timestamp: Date.now(), expiry: Date.now() + ttl }
    cacheStore.set(key, payload)
    CACHE_METADATA.set(key, { updatedAt: Date.now() })
    notifySubscribers(key, payload.data)
    try { localStorage.setItem(`cache_${key}`, JSON.stringify(payload)) } catch (e) { console.error("CACHE_PERSIST_ERROR", e) }
  } catch (e) { console.error("SET_CACHE_ERROR", e) }
}

export const hydrateCache = (key) => {
  try {
    const raw = localStorage.getItem(`cache_${key}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!isValidCacheEntry(parsed)) { invalidateCache(key); return null }
    if (isExpired(parsed)) { invalidateCache(key); return null }
    cacheStore.set(key, safeClone(parsed))
    return safeClone(parsed.data)
  } catch (e) { console.error("CACHE_HYDRATE_ERROR", e); invalidateCache(key); return null }
}

export const subscribeCache = (key, callback) => {
  if (!listenersStore.has(key)) listenersStore.set(key, new Set())
  listenersStore.get(key).add(callback)
  return () => listenersStore.get(key)?.delete(callback)
}

const notifySubscribers = (key, data) => {
  const listeners = listenersStore.get(key)
  if (!listeners) return
  requestAnimationFrame(() => listeners.forEach(l => { try { l(safeClone(data)) } catch (e) { console.error("CACHE_SUBSCRIBER_ERROR", e) } }))
}

export const invalidateCache = (key) => {
  cacheStore.delete(key); inflightStore.delete(key); refreshLocks.delete(key)
  CACHE_METADATA.delete(key); localStorage.removeItem(`cache_${key}`)
}

export const clearAllCache = () => {
  cacheStore.clear(); inflightStore.clear(); refreshLocks.clear(); listenersStore.clear(); CACHE_METADATA.clear()
  Object.keys(localStorage).forEach(k => { if (k.startsWith("cache_")) localStorage.removeItem(k) })
}

export const fetchWithCache = async ({ key, fetcher, ttl = DEFAULT_TTL, force = false }) => {
  let cached = getCachedData(key)
  if (!cached) cached = hydrateCache(key)
  if (cached && !force) {
    const fullCache = cacheStore.get(key)
    if (isStale(fullCache)) backgroundRefresh({ key, fetcher, ttl })
    return safeClone(cached)
  }
  if (inflightStore.has(key)) return inflightStore.get(key)
  const promise = (async () => {
    try {
      const data = await fetcher()
      setCachedData(key, data, ttl)
      return safeClone(data)
    } catch (error) { console.error("FETCH_WITH_CACHE_ERROR", error); throw error }
    finally { inflightStore.delete(key) }
  })()
  inflightStore.set(key, promise)
  return promise
}

const backgroundRefresh = async ({ key, fetcher, ttl }) => {
  if (refreshLocks.has(key)) return
  refreshLocks.set(key, true)
  try { const data = await fetcher(); setCachedData(key, data, ttl) }
  catch (e) { console.error("BACKGROUND_REFRESH_ERROR", e) }
  finally { refreshLocks.delete(key) }
}
