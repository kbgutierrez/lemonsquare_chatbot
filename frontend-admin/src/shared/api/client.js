import { API_CONFIG } from "../config/sqlVariables"

/*
  FINAL ARCHITECTURE RULE:
  - VITE PROXY handles /api → backend
  - frontend ONLY sends /api/xxx
  - NO double prefixing anywhere
*/

const REQUEST_TIMEOUT = API_CONFIG.TIMEOUT || 30000

const responseCache = new Map()
const pendingRequests = new Map()

/* ========================================
   BUILD URL (FIXED — NO DOUBLE /api)
======================================== */

export const buildApiUrl = (endpoint, params = {}) => {
  let url = endpoint // ✅ IMPORTANT: DO NOT prepend /api again

  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, encodeURIComponent(value))
  })

  return url
}

/* ========================================
   CORE REQUEST
======================================== */

const request = async ({
  endpoint,
  method = "GET",
  body,
  headers = {},
  isFormData = false,
}) => {
  const controller = new AbortController()

  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT
  )

  try {
    console.log("API_REQUEST:", method, endpoint)

    // ✅ FINAL FIX: use endpoint directly (VITE handles /api)
    const url = buildApiUrl(endpoint)

    const response = await fetch(url, {
      method,
      signal: controller.signal,

      headers: isFormData
        ? headers
        : {
            ...API_CONFIG.HEADERS,
            ...headers,
          },

      body: body
        ? isFormData
          ? body
          : JSON.stringify(body)
        : undefined,
    })

    const text = await response.text()

    let data = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = text
    }

    if (!response.ok) {
      throw new Error(
        data?.detail ||
        data?.message ||
        `Request failed (${response.status})`
      )
    }

    return data

  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timeout")
    }

    if (err instanceof TypeError) {
      throw new Error("Unable to connect to backend server")
    }

    throw err

  } finally {
    clearTimeout(timeout)
  }
}

/* ========================================
   API CLIENT
======================================== */

export const apiClient = {
  get: (e, o) =>
    request({ endpoint: e, method: "GET", ...o }),

  post: (e, b, o) =>
    request({ endpoint: e, method: "POST", body: b, ...o }),

  put: (e, b, o) =>
    request({ endpoint: e, method: "PUT", body: b, ...o }),

  patch: (e, b, o) =>
    request({ endpoint: e, method: "PATCH", body: b, ...o }),

  delete: (e, o) =>
    request({ endpoint: e, method: "DELETE", ...o }),
}

export default apiClient