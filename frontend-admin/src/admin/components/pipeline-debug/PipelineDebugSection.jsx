import {
  useEffect,
  useState,
} from "react"

import pipelineDebugService
  from "../../services/pipelineDebugService"

import PipelineControls
  from "./components/PipelineControls"

import PipelinePromptBox
  from "./components/PipelinePromptBox"

import PipelineResults
  from "./components/PipelineResults"

import ErrorState
  from "../../../shared/components/ErrorState"

import LoadingSpinner
  from "../../../shared/components/LoadingSpinner"

const PipelineDebugSection = () => {

  const [prompt, setPrompt] =
    useState("")

  const [userToken, setUserToken] =
    useState("")

  const [sessionId, setSessionId] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [result, setResult] =
    useState(null)

  const [error, setError] =
    useState("")

  const [showConfig, setShowConfig] =
    useState(true)

  /* ========================================
     LOAD ADMIN TOKEN
  ======================================== */

  useEffect(() => {

    const storedToken =
      localStorage.getItem(
        "admin_user_token"
      )

    if (storedToken) {

      setUserToken(
        storedToken
      )
    }

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
          await pipelineDebugService
            .debugPipeline({
              message:
                prompt,

              user_token:
                userToken,

              session_id:
                sessionId ||
                null,
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
          mb-4

          rounded-3xl

          border
          border-[#25332d]

          bg-[#151d1b]

          p-5
        "
      >
        <h1
          className="
            text-2xl
            font-bold

            text-white
          "
        >
          Pipeline Debug
        </h1>

        <p
          className="
            mt-2

            text-sm

            text-[#8ea59b]
          "
        >
          Full RAG orchestration inspector.
        </p>
      </div>

      {/* CONTROLS */}
      <PipelineControls
        userToken={userToken}
        setUserToken={
          setUserToken
        }
        sessionId={sessionId}
        setSessionId={
          setSessionId
        }
        loading={loading}
        prompt={prompt}
        handleRun={handleRun}
        showConfig={showConfig}
        setShowConfig={
          setShowConfig
        }
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