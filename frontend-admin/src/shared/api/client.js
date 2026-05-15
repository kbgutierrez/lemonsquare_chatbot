import {
  API_CONFIG,
} from "../config/sqlVariables"

const REQUEST_TIMEOUT =
  API_CONFIG.TIMEOUT || 30000

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
  }) => {

    const controller =
      new AbortController()

    const timeout =
      setTimeout(() => {

        controller.abort()

      }, REQUEST_TIMEOUT)

    try {

      console.log(
        "API_REQUEST",
        {
          method,
          endpoint,
        }
      )

      const requestOptions = {
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

      if (!response.ok) {

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
    }
  }

/* ========================================
   METHODS
======================================== */

export const apiClient = {
  get: (endpoint) =>
    request({
      endpoint,
      method: "GET",
    }),

  post: (
    endpoint,
    body
  ) =>
    request({
      endpoint,
      method: "POST",
      body,
    }),

  put: (
    endpoint,
    body
  ) =>
    request({
      endpoint,
      method: "PUT",
      body,
    }),

  patch: (
    endpoint,
    body
  ) =>
    request({
      endpoint,
      method: "PATCH",
      body,
    }),

  delete: (endpoint) =>
    request({
      endpoint,
      method: "DELETE",
    }),

  upload: (
    endpoint,
    formData
  ) =>
    request({
      endpoint,
      method: "POST",
      body: formData,
      isFormData: true,
    }),
}

export default apiClient