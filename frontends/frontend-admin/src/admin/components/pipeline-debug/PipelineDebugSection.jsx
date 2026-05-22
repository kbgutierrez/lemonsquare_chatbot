import { useEffect, useState } from "react"

import pipelineDebugService from "../../services/pipelineDebugService"

import PipelineControls from "./components/PipelineControls"
import PipelinePromptBox from "./components/PipelinePromptBox"
import PipelineResults from "./components/PipelineResults"

import ErrorState from "../../../shared/components/ErrorState"
import LoadingSpinner from "../../../shared/components/LoadingSpinner"

import {
  getCachedData,
  setCachedData,
} from "../../../shared/cache/liveQueryCache"

const CACHE_KEY = "pipeline_debug_state"

const PipelineDebugSection = () => {

  /* ========================================
     CACHE HYDRATION (SAFE)
  ======================================== */

  const cached =
    getCachedData(CACHE_KEY) ?? {}

  /* ========================================
     STATE
  ======================================== */

  const [prompt, setPrompt] =
    useState(
      cached.prompt || ""
    )

  const [userToken, setUserToken] =
    useState(
      cached.userToken || ""
    )

  const [sessionId, setSessionId] =
    useState(
      cached.sessionId || ""
    )

  const [loading, setLoading] =
    useState(false)

  const [result, setResult] =
    useState(
      cached.result || null
    )

  const [error, setError] =
    useState("")

  const [showConfig, setShowConfig] =
    useState(
      cached.showConfig ?? true
    )

  /* ========================================
     PERSIST STATE
  ======================================== */

  useEffect(() => {

    setCachedData(CACHE_KEY, {
      prompt,
      userToken,
      sessionId,
      result,
      showConfig,
    })
  }, [
    prompt,
    userToken,
    sessionId,
    result,
    showConfig,
  ])

  /* ========================================
     LOAD TOKEN
  ======================================== */

  useEffect(() => {

    const storedToken =
      localStorage.getItem(
        "admin_user_token"
      )

    if (!storedToken) return
    if (userToken) return

    setUserToken(storedToken)
  }, [])

  /* ========================================
     RUN PIPELINE
  ======================================== */

  const handleRun =
    async () => {

      try {
        setLoading(true)
        setError("")
        setResult(null)

        if (!prompt.trim()) {
          throw new Error(
            "Prompt is required."
          )
        }

        if (!userToken.trim()) {
          throw new Error(
            "User token is missing."
          )
        }

        const response =
          await pipelineDebugService.debugPipeline({
            message: prompt,
            user_token: userToken,
            session_id:
              sessionId || null,
          })

        console.log(
          "PIPELINE_DEBUG_RESULT",
          response
        )

        setResult(response)
        setShowConfig(false)

      } catch (err) {

        console.error(
          "PIPELINE_DEBUG_ERROR",
          err
        )

        setError(
          err.message ||
          "Pipeline debug failed."
        )

      } finally {
        setLoading(false)
      }
    }

  return (
    <section
      className="
        flex
        h-full
        flex-col

        overflow-hidden
      "
    >
      {/* HEADER */}
      <div
        className="
          glass-panel

          mb-4

          rounded-3xl

          p-5
        "
      >
        <h1
          className="
            text-2xl
            font-bold

            text-[var(--text-primary)]
          "
        >
          Pipeline Debug
        </h1>

        <p
          className="
            mt-2

            text-sm

            text-[var(--text-secondary)]
          "
        >
          Full RAG orchestration inspector.
        </p>
      </div>

      {/* CONTROLS */}
      <PipelineControls
        userToken={userToken}
        setUserToken={setUserToken}
        sessionId={sessionId}
        setSessionId={setSessionId}
        loading={loading}
        prompt={prompt}
        handleRun={handleRun}
        showConfig={showConfig}
        setShowConfig={setShowConfig}
      />

      {/* PROMPT */}
      <PipelinePromptBox
        prompt={prompt}
        setPrompt={setPrompt}
        showConfig={showConfig}
      />

      {/* LOADING */}
      {loading && (
        <LoadingSpinner
          label="Running pipeline debug..."
          size="sm"
        />
      )}

      {/* ERROR */}
      {error && !loading && (
        <ErrorState
          title="Pipeline Debug Error"
          message={error}
        />
      )}

      {/* RESULTS */}
      {!loading && !error && (
        <PipelineResults
          result={result}
        />
      )}
    </section>
  )
}

export default PipelineDebugSection