import { API_CONFIG } from "../config/sqlVariables"

/*
  FINAL ARCHITECTURE RULE:
  - VITE PROXY handles /api → backend
  - frontend ONLY sends /api/xxx
  - NO double prefixing anywhere
*/

const REQUEST_TIMEOUT =
  API_CONFIG.TIMEOUT || 30000

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

  let url = endpoint

  Object.entries(params)
    .forEach(
      ([key, value]) => {

        url =
          url.replace(
            `:${key}`,
            encodeURIComponent(value)
          )
      }
    )

  return url
}

/* ========================================
   CORE REQUEST
======================================== */

const request =
  async ({
    endpoint,
    method = "GET",
    body,
    headers = {},
    isFormData = false,
  }) => {

    const controller =
      new AbortController()

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        REQUEST_TIMEOUT
      )

    try {

      console.log(
        "API_REQUEST:",
        method,
        endpoint
      )

      const url =
        buildApiUrl(
          endpoint
        )

      const finalHeaders =
        isFormData
          ? headers
          : {
              ...API_CONFIG.HEADERS,
              ...headers,
            }

      const response =
        await fetch(
          url,
          {
            method,

            signal:
              controller.signal,

            headers:
              finalHeaders,

            body:
              body
                ? isFormData
                  ? body
                  : JSON.stringify(
                      body
                    )
                : undefined,
          }
        )

      const rawText =
        await response.text()

      console.log(
        "API_RESPONSE_STATUS:",
        response.status
      )

      console.log(
        "API_RESPONSE_RAW:",
        rawText
      )

      let data = null

      try {

        data =
          rawText
            ? JSON.parse(
                rawText
              )
            : null

      } catch {

        data = rawText
      }

      if (!response.ok) {

        console.error(
          "API_RESPONSE_ERROR:",
          data
        )

        let errorMessage =
          `Request failed (${response.status})`

        /* ========================================
           FASTAPI VALIDATION ARRAY
        ======================================== */

        if (
          Array.isArray(
            data?.detail
          )
        ) {

          errorMessage =
            data.detail
              .map(
                (
                  item
                ) =>
                  item?.msg
              )
              .filter(Boolean)
              .join(", ")

        }

        /* ========================================
           FASTAPI STRING DETAIL
        ======================================== */

        else if (
          typeof data?.detail ===
          "string"
        ) {

          errorMessage =
            data.detail
        }

        /* ========================================
           CUSTOM BACKEND ERROR
        ======================================== */

        else if (
          typeof data?.error ===
          "string"
        ) {

          errorMessage =
            data.error
        }

        /* ========================================
           GENERIC MESSAGE
        ======================================== */

        else if (
          data?.message
        ) {

          errorMessage =
            data.message
        }

        throw new Error(
          errorMessage
        )
      }

      return data

    } catch (err) {

      if (
        err.name ===
        "AbortError"
      ) {

        throw new Error(
          "Request timeout"
        )
      }

      if (
        err instanceof
        TypeError
      ) {

        throw new Error(
          "Unable to connect to backend server"
        )
      }

      throw err

    } finally {

      clearTimeout(
        timeout
      )
    }
  }

/* ========================================
   API CLIENT
======================================== */

export const apiClient = {
  get: (
    endpoint,
    options
  ) =>
    request({
      endpoint,
      method: "GET",
      ...options,
    }),

  post: (
    endpoint,
    body,
    options
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
    options
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
    options
  ) =>
    request({
      endpoint,
      method: "PATCH",
      body,
      ...options,
    }),

  delete: (
    endpoint,
    options
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