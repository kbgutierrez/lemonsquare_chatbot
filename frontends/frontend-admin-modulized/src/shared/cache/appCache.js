const cacheStore = new Map()
const listenersStore = new Map()
const DEFAULT_TTL = 1000 * 60 * 5

export const getCache = (key) => {
  const cached = cacheStore.get(key)
  if (!cached) {
    try {
      const raw = localStorage.getItem(`app_cache_${key}`)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (Date.now() > parsed.expiry) { localStorage.removeItem(`app_cache_${key}`); return null }
      cacheStore.set(key, parsed); return parsed
    } catch { return null }
  }
  if (Date.now() > cached.expiry) { cacheStore.delete(key); localStorage.removeItem(`app_cache_${key}`); return null }
  return cached
}

export const setCache = (key, value, ttl = DEFAULT_TTL) => {
  const payload = { data: value, timestamp: Date.now(), expiry: Date.now() + ttl }
  cacheStore.set(key, payload)
  try { localStorage.setItem(`app_cache_${key}`, JSON.stringify(payload)) } catch {}
  notifySubscribers(key, payload)
}

export const clearCache = (key) => { cacheStore.delete(key); localStorage.removeItem(`app_cache_${key}`) }

export const clearAllCache = () => {
  cacheStore.clear()
  Object.keys(localStorage).forEach(k => { if (k.startsWith("app_cache_")) localStorage.removeItem(k) })
}

export const subscribeAppCache = (key, callback) => {
  if (!listenersStore.has(key)) listenersStore.set(key, new Set())
  listenersStore.get(key).add(callback)
  return () => listenersStore.get(key)?.delete(callback)
}

const notifySubscribers = (key, payload) => {
  const listeners = listenersStore.get(key)
  if (!listeners) return
  requestAnimationFrame(() => listeners.forEach(l => { try { l(payload) } catch (e) { console.error("APP_CACHE_SUBSCRIBER_ERROR", e) } }))
}

export default { getCache, setCache, clearCache, clearAllCache, subscribeAppCache }
