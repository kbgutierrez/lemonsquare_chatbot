import {
  API_CONFIG,
} from "../../config/sqlVariables"

const BASE =
  API_CONFIG.BASE_URL

const REQUEST_TIMEOUT =
  API_CONFIG.TIMEOUT ||
  30000

/* ========================================
   REQUEST HELPER
======================================== */

const apiRequest = async ({
  endpoint,
  method = "GET",
  body = null,
}) => {

  const controller =
    new AbortController()

  const timeout =
    setTimeout(() => {

      controller.abort()

    }, REQUEST_TIMEOUT)

  try {

    const response =
      await fetch(
        endpoint,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            body
              ? JSON.stringify(
                  body
                )
              : null,

          signal:
            controller.signal,
        }
      )

    console.log(
      "ADMIN_API_STATUS",
      response.status
    )

    const rawText =
      await response.text()

    console.log(
      "ADMIN_API_RESPONSE",
      rawText
    )

    let responseData =
      null

    try {

      responseData =
        rawText
          ? JSON.parse(
              rawText
            )
          : null

    } catch (parseError) {

      console.error(
        "ADMIN_JSON_PARSE_ERROR",
        parseError
      )

      throw new Error(
        "Backend returned invalid JSON."
      )
    }

    /* HTTP ERROR */

    if (!response.ok) {

      const errorMessage =
        responseData?.detail ||
        responseData?.message ||
        responseData?.error ||
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
   GET SETTINGS
======================================== */

const getSettings =
  async () => {

    return apiRequest({
      endpoint:
        `${BASE}/settings/ai`,
    })
  }

/* ========================================
   UPDATE SETTINGS
======================================== */

const updateSettings =
  async (payload) => {

    console.log(
      "UPDATE_SETTINGS_REQUEST",
      payload
    )

    return apiRequest({
      endpoint:
        `${BASE}/settings/ai/update`,

      method:
        "POST",

      body:
        payload,
    })
  }

/* ========================================
   EXPORT
======================================== */

const aiSettingsService = {
  getSettings,
  updateSettings,
}

export default aiSettingsService