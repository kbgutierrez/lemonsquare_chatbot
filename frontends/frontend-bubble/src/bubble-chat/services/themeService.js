import {
  API_CONFIG,
  API_ENDPOINTS,
  buildApiUrl,
  getRuntimeConfig,
} from "../../config/sqlVariables"

/* ========================================
   CONFIG
======================================== */

const REQUEST_TIMEOUT =
  API_CONFIG.TIMEOUT

/* ========================================
   HELPERS
======================================== */

const parseJsonSafely =
  async (response) => {

    try {
      return await response.json()
    } catch {
      return null
    }
  }

const isValidToken = (
  token
) =>
  token &&
  token !== "null" &&
  token !== "undefined"

const getUserToken =
  () => {

    const runtimeToken =
      getRuntimeConfig()
        ?.userToken

    if (
      isValidToken(
        runtimeToken
      )
    ) {
      return runtimeToken
    }

    const globalToken =
      window
        ?.LemonSquareChatConfig
        ?.userToken

    if (
      isValidToken(
        globalToken
      )
    ) {
      return globalToken
    }

    const localToken =
      localStorage.getItem(
        "user_token"
      )

    if (
      isValidToken(
        localToken
      )
    ) {
      return localToken
    }

    if (
      import.meta.env.DEV &&
      import.meta.env
        .VITE_DEV_USER_TOKEN
    ) {
      return import.meta.env
        .VITE_DEV_USER_TOKEN
    }

    throw new Error(
      "User authentication token not found."
    )
  }

/* ========================================
   API REQUEST
======================================== */

const apiRequest = async ({
  endpoint,
  method = "GET",
  body,
  headers = {},
}) => {

  const controller =
    new AbortController()

  const timeoutId =
    setTimeout(
      () =>
        controller.abort(),
      REQUEST_TIMEOUT
    )

  try {

    const requestHeaders = {
      ...API_CONFIG.HEADERS,
      "X-User-Token":
        getUserToken(),
      ...headers,
    }

    const requestBody =
      body
        ? JSON.stringify(
            body
          )
        : undefined

    console.log(
      "[ThemeService] Request:",
      method,
      endpoint,
      "headers:",
      requestHeaders,
      "body:",
      body
    )

    const response =
      await fetch(
        endpoint,
        {
          method,

          headers: requestHeaders,

          body: requestBody,

          signal:
            controller.signal,
        }
      )

    const data =
      await parseJsonSafely(
        response
      )

    console.log(
      "[ThemeService] Response:",
      response.status,
      data
    )

    if (!response.ok) {

      throw new Error(
        data?.detail ||
        data?.message ||
        `API request failed (${response.status}).`
      )
    }

    return data

  } catch (error) {

    if (
      error.name ===
      "AbortError"
    ) {

      throw new Error(
        "Request timeout exceeded."
      )
    }

    throw error

  } finally {

    clearTimeout(
      timeoutId
    )
  }
}

/* ========================================
   THEME API
======================================== */

const getTheme =
  async () =>
    apiRequest({
      endpoint:
        buildApiUrl(
          API_ENDPOINTS.THEME_GET
        ),
    })

const saveTheme =
  async (
    payload
  ) =>
    apiRequest({
      endpoint:
        buildApiUrl(
          API_ENDPOINTS.THEME_UPDATE
        ),

      method: "PUT",

      body: payload,
    })

/* ========================================
   EXPORT
======================================== */

const themeService = {
  getTheme,
  saveTheme,
}

export default themeService