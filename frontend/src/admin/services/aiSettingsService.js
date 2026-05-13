import {
  API_CONFIG,
  API_ENDPOINTS,
  buildApiUrl,
} from "../../config/sqlVariables"

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

    console.log(
      "SETTINGS_API_REQUEST",
      method,
      endpoint
    )

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
      "SETTINGS_API_STATUS",
      response.status
    )

    const rawText =
      await response.text()

    console.log(
      "SETTINGS_API_RESPONSE",
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
        "SETTINGS_PARSE_ERROR",
        parseError
      )

      throw new Error(
        "Backend returned invalid JSON."
      )
    }

    /* HTTP ERROR */

    if (!response.ok) {

      let errorMessage =
        `Request failed with status ${response.status}`

      /* FASTAPI VALIDATION ERRORS */

      if (
        Array.isArray(
          responseData?.detail
        )
      ) {

        errorMessage =
          responseData.detail
            .map((item) => {

              const field =
                item?.loc?.[
                  item.loc.length - 1
                ]

              return field
                ? `${field}: ${item.msg}`
                : item.msg
            })
            .join(" • ")

      } else {

        errorMessage =
          responseData?.error ||
          responseData?.detail ||
          responseData?.message ||
          errorMessage
      }

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

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.AI_SETTINGS
      )

    return apiRequest({
      endpoint,
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

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.AI_SETTINGS
      )

    return apiRequest({
      endpoint,

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