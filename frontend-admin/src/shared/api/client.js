import {
  API_CONFIG,
} from "../config/sqlVariables"

/* ========================================
   CONFIG
======================================== */

const REQUEST_TIMEOUT =
  API_CONFIG.TIMEOUT || 30000

const CACHE_DURATION =
  1000 * 20

/* ========================================
   GLOBAL MEMORY CACHE
======================================== */

const responseCache =
  new Map()

const pendingRequests =
  new Map()

/* ========================================
   BUILD URL
======================================== */

export const buildApiUrl = (
  endpoint,
  params = {}
) => {

  let url =
    `${API_CONFIG.BASE_URL}${endpoint}`

  Object.entries(params).forEach(
    ([key, value]) => {

      url = url.replace(
        `:${key}`,
        encodeURIComponent(
          value
        )
      )
    }
  )

  return url
}

/* ========================================
   CACHE HELPERS
======================================== */

const buildCacheKey =
  ({
    endpoint,
    method,
    body,
  }) => {

    return JSON.stringify({
      endpoint,
      method,
      body,
    })
  }

const getCachedResponse =
  (cacheKey) => {

    const cached =
      responseCache.get(
        cacheKey
      )

    if (!cached) {
      return null
    }

    const isExpired =
      Date.now() -
        cached.timestamp >
      CACHE_DURATION

    if (isExpired) {

      responseCache.delete(
        cacheKey
      )

      return null
    }

    return cached.data
  }

const setCachedResponse =
  (
    cacheKey,
    data
  ) => {

    responseCache.set(
      cacheKey,
      {
        data,
        timestamp:
          Date.now(),
      }
    )
  }

/* ========================================
   INVALIDATE CACHE
======================================== */

export const invalidateApiCache =
  (
    partialKey = ""
  ) => {

    Array.from(
      responseCache.keys()
    ).forEach((key) => {

      if (
        key.includes(
          partialKey
        )
      ) {

        responseCache.delete(
          key
        )
      }
    })
  }

/* ========================================
   PARSE RESPONSE
======================================== */

const parseResponse =
  async (response) => {

    const contentType =
      response.headers.get(
        "content-type"
      ) || ""

    const rawText =
      await response.text()

    console.log(
      "API_RESPONSE",
      rawText
    )

    /* EMPTY RESPONSE */

    if (!rawText) {
      return null
    }

    /* JSON */

    if (
      contentType.includes(
        "application/json"
      )
    ) {

      try {

        return JSON.parse(
          rawText
        )

      } catch {

        throw new Error(
          "Backend returned invalid JSON."
        )
      }
    }

    /* TEXT FALLBACK */

    return rawText
  }

/* ========================================
   REQUEST
======================================== */

const request =
  async ({
    endpoint,
    method = "GET",
    body = null,
    headers = {},
    isFormData = false,
    skipCache = false,
  }) => {

    const cacheKey =
      buildCacheKey({
        endpoint,
        method,
        body,
      })

    /* ========================================
       CACHE HIT
    ======================================== */

    if (
      method === "GET" &&
      !skipCache
    ) {

      const cached =
        getCachedResponse(
          cacheKey
        )

      if (cached) {

        console.log(
          "CACHE_HIT",
          endpoint
        )

        return cached
      }
    }

    /* ========================================
       DEDUPE REQUESTS
    ======================================== */

    if (
      pendingRequests.has(
        cacheKey
      )
    ) {

      return pendingRequests.get(
        cacheKey
      )
    }

    const controller =
      new AbortController()

    const timeout =
      setTimeout(() => {

        controller.abort()

      }, REQUEST_TIMEOUT)

    const requestPromise =
      (async () => {

        try {

          console.log(
            "API_REQUEST",
            {
              method,
              endpoint,
            }
          )

          const requestOptions =
            {
              method,

              signal:
                controller.signal,

              headers:
                isFormData
                  ? headers
                  : {
                      ...API_CONFIG.HEADERS,
                      ...headers,
                    },
            }

          /* BODY */

          if (body) {

            requestOptions.body =
              isFormData
                ? body
                : JSON.stringify(
                    body
                  )
          }

          const response =
            await fetch(
              endpoint,
              requestOptions
            )

          console.log(
            "API_STATUS",
            response.status
          )

          const responseData =
            await parseResponse(
              response
            )

          /* HTTP ERROR */

          if (
            !response.ok
          ) {

            const errorMessage =
              responseData?.error ||
              responseData?.detail ||
              responseData?.message ||
              (
                typeof responseData ===
                "string"
                  ? responseData
                  : null
              ) ||
              `Request failed with status ${response.status}`

            throw new Error(
              errorMessage
            )
          }

          /* ========================================
             CACHE GET RESPONSES
          ======================================== */

          if (
            method === "GET"
          ) {

            setCachedResponse(
              cacheKey,
              responseData
            )
          }

          /* ========================================
             INVALIDATE MUTATIONS
          ======================================== */

          if (
            method !== "GET"
          ) {

            invalidateApiCache()
          }

          return responseData

        } catch (error) {

          /* TIMEOUT */

          if (
            error.name ===
            "AbortError"
          ) {

            throw new Error(
              "Request timeout. Backend took too long to respond."
            )
          }

          /* NETWORK ERROR */

          if (
            error instanceof
            TypeError
          ) {

            throw new Error(
              "Unable to connect to backend server."
            )
          }

          throw error

        } finally {

          clearTimeout(
            timeout
          )

          pendingRequests.delete(
            cacheKey
          )
        }

      })()

    pendingRequests.set(
      cacheKey,
      requestPromise
    )

    return requestPromise
  }

/* ========================================
   METHODS
======================================== */

export const apiClient = {
  get: (
    endpoint,
    options = {}
  ) =>
    request({
      endpoint,
      method: "GET",
      ...options,
    }),

  post: (
    endpoint,
    body,
    options = {}
  ) =>
    request({
      endpoint,
      method: "POST",
      body,
      ...options,
    }),

  put: (
    endpoint,
    body,
    options = {}
  ) =>
    request({
      endpoint,
      method: "PUT",
      body,
      ...options,
    }),

  patch: (
    endpoint,
    body,
    options = {}
  ) =>
    request({
      endpoint,
      method: "PATCH",
      body,
      ...options,
    }),

  delete: (
    endpoint,
    options = {}
  ) =>
    request({
      endpoint,
      method: "DELETE",
      ...options,
    }),

  upload: (
    endpoint,
    formData,
    options = {}
  ) =>
    request({
      endpoint,
      method: "POST",
      body: formData,
      isFormData: true,
      ...options,
    }),
}

export default apiClient