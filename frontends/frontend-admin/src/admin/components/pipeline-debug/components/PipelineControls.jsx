import { Send, Loader2 } from "lucide-react"

const PipelineControls = ({
  userToken,
  setUserToken,
  sessionId,
  setSessionId,
  loading,
  prompt,
  handleRun,
  showConfig,
  setShowConfig,
}) => {
  return (
    <div className="border-b theme-border pb-4">
      {/* COLLAPSED */}
      {!showConfig && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[var(--text-secondary)]">
              Pipeline configuration loaded
            </span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Session: {sessionId || "New Session"}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowConfig(true)}
              className="rounded-md border theme-border bg-[var(--panel-light)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-all hover:bg-[var(--hover)]"
            >
              Edit Config
            </button>

            <button
              onClick={handleRun}
              disabled={loading || !prompt}
              className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#1b211e] transition-all hover:brightness-105 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Run Pipeline Again
            </button>
          </div>
        </div>
      )}

      {/* EXPANDED */}
      {showConfig && (
        <div className="grid gap-4 lg:grid-cols-3">
          <input
            value={userToken}
            onChange={(e) => setUserToken(e.target.value)}
            placeholder="User Token"
            className="input-base"
          />

          <input
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Session ID"
            className="input-base"
          />

          <button
            onClick={handleRun}
            disabled={loading || !prompt}
            className="flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#1b211e] transition-all hover:brightness-105 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Run Pipeline
          </button>
        </div>
      )}
    </div>
  )
}

export default PipelineControls