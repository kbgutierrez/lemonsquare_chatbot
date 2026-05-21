import { useState, useRef } from "react"
import { safeClone } from "../../shared/utils/clone.js"
import { API_CONFIG } from "../../shared/config/env.js"
import { API_ENDPOINTS } from "../../shared/api/endpoints.js"
import { buildApiUrl } from "../../shared/api/client.js"

export const usePipelineDebug = () => {
  const [text, setText] = useState("")
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeStage, setActiveStage] = useState(0)

  const stagesRef = useRef([
    "Initializing pipeline...",
    "Analyzing input...",
    "Reformulating query...",
    "Embedding generation...",
    "Vector retrieval...",
    "Context assembly...",
    "Final generation...",
  ])

  const startSimulation = async () => {
    setLoading(true)
    setActiveStage(0)
    setResult(null)
    setError("")

    for (
      let i = 0;
      i < stagesRef.current.length;
      i++
    ) {
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            500
          )
      )

      setActiveStage(i + 1)
    }
  }

  const normalizePipelineResponse =
    (data) => {
      return {
        original_query:
          data?.original_query ||
          data?.query ||
          text,

        reformulated_query:
          data?.reformulated_query ||
          data?.reformulation ||
          "",

        retrieval_results:
          data?.retrieval_results ||
          data?.retrieval
            ?.context ||
          [],

        final_answer:
          data?.final_answer ||
          data?.generation ||
          "",

        raw_debug:
          data?.raw_debug ||
          data?.raw_response ||
          data,
      }
    }

  const runPipeline =
    async ({
      signal,
      sessionId,
      token,
    } = {}) => {
      if (!text.trim()) {
        setError(
          "Please enter some text to process."
        )

        return
      }

      try {
        await startSimulation()

        const endpoint =
          buildApiUrl(
            `${API_CONFIG.BASE_URL}${API_ENDPOINTS.DOCUMENT_DEBUG_PIPELINE}`
          )

        const headers = {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        }

        if (
          token &&
          token.trim()
        ) {
          headers.Authorization = `Bearer ${token.trim()}`
        }

        const payload = {
          query: text,
          limit: 5,
        }

        /*
          Optional compatibility payloads
          for old pipeline behavior.
        */

        if (
          sessionId &&
          sessionId.trim()
        ) {
          payload.session_id =
            sessionId.trim()
        }

        payload.text = text
        payload.message =
          text

        const response =
          await fetch(
            endpoint,
            {
              method:
                "POST",

              headers,

              body:
                JSON.stringify(
                  payload
                ),

              signal,
            }
          )

        const raw =
          await response
            .json()
            .catch(
              () => null
            )

        if (
          !response.ok
        ) {
          let errorMessage =
            `Pipeline failed (${response.status})`

          if (
            Array.isArray(
              raw?.detail
            )
          ) {
            errorMessage =
              raw.detail
                .map(
                  (
                    item
                  ) =>
                    item?.msg
                )
                .filter(
                  Boolean
                )
                .join(
                  ", "
                )
          } else if (
            typeof raw?.detail ===
            "string"
          ) {
            errorMessage =
              raw.detail
          } else if (
            typeof raw?.message ===
            "string"
          ) {
            errorMessage =
              raw.message
          }

          throw new Error(
            errorMessage
          )
        }

        const normalized =
          normalizePipelineResponse(
            raw
          )

        setResult(
          safeClone(
            normalized
          )
        )

        setActiveStage(
          stagesRef.current
            .length
        )
      } catch (e) {
        if (
          e?.name ===
          "AbortError"
        ) {
          setError(
            "Pipeline was cancelled."
          )

          setLoading(
            false
          )

          return
        }

        console.error(
          "PIPELINE_ERROR:",
          e
        )

        setError(
          e?.message ||
            "An unexpected error occurred."
        )

        setActiveStage(0)
      } finally {
        setLoading(
          false
        )
      }
    }

  const cancel = (
    controller
  ) => {
    controller?.abort()

    setLoading(false)
    setActiveStage(0)
  }

  return {
    text,
    setText,
    result,
    error,
    loading,
    activeStage,
    stages:
      stagesRef.current,
    runPipeline,
    cancel,
  }
}

export default usePipelineDebug