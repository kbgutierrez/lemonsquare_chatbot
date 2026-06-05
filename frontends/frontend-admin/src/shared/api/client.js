import { API_CONFIG } from "../config/sqlVariables"

/*
  ARCHITECTURE RULE:
  - VITE proxy handles /api → backend
  - frontend ONLY calls /api/*
*/

const REQUEST_TIMEOUT =
  API_CONFIG.TIMEOUT || 30000

/* ========================================
   BUILD URL (SAFE)
======================================== */

export const buildApiUrl = (
  endpoint,
  params = {}
) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`

  for (const [key, value] of Object.entries(params)) {
    if (
      value === undefined ||
      value === null
    ) {
      continue
    }

    url = url.replace(
      `:${key}`,
      encodeURIComponent(String(value))
    )
  }

  return url
}

/* ========================================
   SAFE JSON PARSE
======================================== */

const safeParseJSON = (text) => {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/* ========================================
   ERROR EXTRACTOR
======================================== */

const extractErrorMessage = (
  data,
  status
) => {
  const fallback =
    `Request failed (${status})`

  if (
    Array.isArray(data?.detail)
  ) {
    return data.detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(", ")
  }

  if (
    typeof data?.detail === "string"
  ) {
    return data.detail
  }

  if (
    typeof data?.error === "string"
  ) {
    return data.error
  }

  if (data?.message) {
    return data.message
  }

  return fallback
}

/* ========================================
   MERGE ABORT SIGNALS
======================================== */

const mergeSignals = (
  internalSignal,
  externalSignal
) => {
  if (!externalSignal) {
    return internalSignal
  }

  const controller =
    new AbortController()

  const abort = () => {
    try {
      controller.abort()
    } catch {}
  }

  if (internalSignal.aborted) {
    abort()
  }

  if (externalSignal.aborted) {
    abort()
  }

  internalSignal.addEventListener(
    "abort",
    abort
  )

  externalSignal.addEventListener(
    "abort",
    abort
  )

  return controller.signal
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
  signal = null,
}) => {
  const internalController =
    new AbortController()

  const mergedSignal =
    mergeSignals(
      internalController.signal,
      signal
    )

  const timeout =
    setTimeout(() => {
      try {
        internalController.abort()
      } catch {}
    }, REQUEST_TIMEOUT)

  try {
    const url =
      buildApiUrl(endpoint)

    /* ========================================
       HEADER SAFETY LAYER
    ======================================== */

    const auditToken =
  localStorage.getItem(
    "admin_user_token"
  )

const authorizationHeaders =
  auditToken
    ? {
        Authorization:
          `Bearer ${auditToken}`,
      }
    : {}

    const finalHeaders =
      isFormData
        ? {
            ...authorizationHeaders,
            ...headers,
          }
        : {
            "Content-Type":
              "application/json",

            ...API_CONFIG.HEADERS,
            ...authorizationHeaders,
            ...headers,
          }

    const response =
      await fetch(url, {
        method,
        signal: mergedSignal,
        headers: finalHeaders,

        body: body
          ? isFormData
            ? body
            : JSON.stringify(body)
          : undefined,
      })

    const rawText =
      await response.text()

    const data = rawText
      ? safeParseJSON(rawText)
      : null

    if (!response.ok) {

      if (
        response.status === 401
      ) {

        localStorage.removeItem(
          "admin_auth"
        )

        localStorage.removeItem(
          "admin_user"
        )

        localStorage.removeItem(
          "admin_user_token"
        )

        setTimeout(() => {
          window.location.reload()
        }, 50)
      }

      throw new Error(
        extractErrorMessage(
          data,
          response.status
        )
      )
    }

    return data
  } catch (err) {
    if (
      err?.name === "AbortError"
    ) {
      throw new Error(
        "Request aborted"
      )
    }

    if (
      err instanceof TypeError
    ) {
      throw new Error(
        "Unable to connect to backend server"
      )
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