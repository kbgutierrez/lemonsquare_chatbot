// FILE: frontend/src/admin/services/pipelineDebugService.js

import {
  API_CONFIG,
  API_ENDPOINTS,
  buildApiUrl,
} from "../../config/sqlVariables"

const REQUEST_TIMEOUT =
  API_CONFIG.TIMEOUT ||
  30000

/* ========================================
   DEBUG PIPELINE
======================================== */

const debugPipeline =
  async ({
    message,
    user_token,
    session_id,
  }) => {

    const controller =
      new AbortController()

    const timeout =
      setTimeout(() => {

        controller.abort()

      }, REQUEST_TIMEOUT)

    try {

      console.log(
        "PIPELINE_DEBUG_REQUEST"
      )

      const endpoint =
        buildApiUrl(
          API_ENDPOINTS
            .DOCUMENT_DEBUG_PIPELINE
        )

      console.log(
        "PIPELINE_DEBUG_ENDPOINT",
        endpoint
      )

      const response =
        await fetch(
          endpoint,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              query:
                message,

              user_token,

              session_id,
            }),

            signal:
              controller.signal,
          }
        )

      console.log(
        "PIPELINE_DEBUG_STATUS",
        response.status
      )

      const rawText =
        await response.text()

      console.log(
        "PIPELINE_DEBUG_RAW",
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

        throw new Error(
          "Backend returned invalid JSON."
        )
      }

      if (!response.ok) {

        throw new Error(
          data?.detail ||
          data?.message ||
          "Pipeline debug failed."
        )
      }

      return data

    } catch (error) {

      if (
        error.name ===
        "AbortError"
      ) {

        throw new Error(
          "Pipeline request timeout."
        )
      }

      if (
        error instanceof
        TypeError
      ) {

        throw new Error(
          "Unable to connect to backend."
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
   EXPORT
======================================== */

const pipelineDebugService = {
  debugPipeline,
}

export default pipelineDebugService