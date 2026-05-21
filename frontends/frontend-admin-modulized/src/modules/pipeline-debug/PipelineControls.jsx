import { useRef } from "react"
import {
  Play,
  Square,
  LoaderCircle,
} from "lucide-react"

const PipelineControls = ({
  text,
  setText,
  loading,
  activeStage,
  stages,
  onRun,
  onCancel,
}) => {
  const controllerRef = useRef(null)

  const handleRun = async () => {
    controllerRef.current =
      new AbortController()

    await onRun(
      controllerRef.current.signal
    )
  }

  return (
    <div className="card-surface p-5 md:p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <span className="text-label">
            Test Pipeline
          </span>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Debug Full Pipeline
            </h2>

            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-[#74877f]">
              Test the entire AI processing flow
              including reformulation, embeddings,
              retrieval, reranking, and final
              generation.
            </p>
          </div>
        </div>

        {/* Editor */}
        <div className="flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            rows={10}
            placeholder="Enter text to process..."
            className="input-base min-h-[260px] resize-y rounded-3xl px-5 py-4 text-sm leading-relaxed"
          />

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRun}
              disabled={loading}
              className="btn-primary min-w-[180px]"
            >
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}

              {loading
                ? "Processing..."
                : "Run Pipeline"}
            </button>

            {loading && (
              <button
                onClick={() => {
                  controllerRef.current?.abort()

                  onCancel()
                }}
                className="btn-danger min-w-[140px]"
              >
                <Square className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        {loading && (
          <div className="rounded-2xl border border-[#2a3a33] bg-[#141d1a] p-4">
            <div className="mb-3 flex items-center justify-between gap-4 text-xs">
              <span className="font-medium text-[#74877f]">
                Stage {activeStage} of{" "}
                {stages.length}
              </span>

              <span className="font-semibold text-white">
                {
                  stages[
                    Math.min(
                      activeStage,
                      stages.length - 1
                    )
                  ]
                }
              </span>
            </div>

            <div className="relative h-2.5 overflow-hidden rounded-full bg-[#0b1110]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#95c11f] transition-all duration-500"
                style={{
                  width: `${
                    (activeStage /
                      stages.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PipelineControls