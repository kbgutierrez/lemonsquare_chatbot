const cacheStore =
  new Map()

const listenersStore =
  new Map()

const DEFAULT_TTL =
  1000 * 60 * 5

/* ========================================
   GET
======================================== */

export const getCache =
  (key) => {

    const cached =
      cacheStore.get(key)

    if (!cached) {

      try {

        const raw =
          localStorage.getItem(
            `app_cache_${key}`
          )

        if (!raw) {
          return null
        }

        const parsed =
          JSON.parse(raw)

        if (
          Date.now() >
          parsed.expiry
        ) {

          localStorage.removeItem(
            `app_cache_${key}`
          )

          return null
        }

        cacheStore.set(
          key,
          parsed
        )

        return parsed

      } catch {

        return null
      }
    }

    if (
      Date.now() >
      cached.expiry
    ) {

      cacheStore.delete(
        key
      )

      localStorage.removeItem(
        `app_cache_${key}`
      )

      return null
    }

    return cached
  }

/* ========================================
   SET
======================================== */

export const setCache =
  (
    key,
    value,
    ttl = DEFAULT_TTL
  ) => {

    const payload = {
      data: value,

      timestamp:
        Date.now(),

      expiry:
        Date.now() + ttl,
    }

    cacheStore.set(
      key,
      payload
    )

    try {

      localStorage.setItem(
        `app_cache_${key}`,
        JSON.stringify(
          payload
        )
      )

    } catch {}

    notifySubscribers(
      key,
      payload
    )
  }

/* ========================================
   CLEAR
======================================== */

export const clearCache =
  (key) => {

    cacheStore.delete(
      key
    )

    localStorage.removeItem(
      `app_cache_${key}`
    )
  }

/* ========================================
   CLEAR ALL
======================================== */

export const clearAllCache =
  () => {

    cacheStore.clear()

    Object.keys(
      localStorage
    ).forEach(
      (key) => {

        if (
          key.startsWith(
            "app_cache_"
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
   SUBSCRIBE
======================================== */

export const subscribeAppCache =
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
    payload
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

            listener(payload)

          } catch (error) {

            console.error(
              "APP_CACHE_SUBSCRIBER_ERROR",
              error
            )
          }
        }
      )
    })
  }

/* ========================================
   EXPORT
======================================== */

export default {
  getCache,
  setCache,
  clearCache,
  clearAllCache,
  subscribeAppCache,
}