import {
  Send,
  Loader2,
} from "lucide-react"

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
    <div
      className="
        mb-4

        rounded-3xl

        border
        border-[#25332d]

        bg-[#151d1b]

        p-4
      "
    >
      {/* COLLAPSED */}
      {!showConfig && (
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-3
          "
        >
          <div
            className="
              flex
              flex-col
              gap-1
            "
          >
            <span
              className="
                text-xs

                text-[#8ea59b]
              "
            >
              Pipeline configuration loaded
            </span>

            <span
              className="
                text-sm

                text-white
              "
            >
              Session:
              {" "}
              {sessionId ||
                "New Session"}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                setShowConfig(
                  true
                )
              }
              className="
                rounded-2xl

                border
                border-[#2a3a33]

                bg-[#101816]

                px-4
                py-3

                text-sm

                text-white
              "
            >
              Edit Config
            </button>

            <button
              onClick={handleRun}
              disabled={
                loading ||
                !prompt
              }
              className="
                flex
                items-center
                gap-2

                rounded-2xl

                bg-[#f5d547]

                px-4
                py-3

                text-sm
                font-semibold

                text-[#111917]
              "
            >
              {loading ? (
                <Loader2
                  className="
                    h-4
                    w-4
                    animate-spin
                  "
                />
              ) : (
                <Send
                  className="
                    h-4
                    w-4
                  "
                />
              )}

              Run Pipeline Again
            </button>
          </div>
        </div>
      )}

      {/* EXPANDED */}
      {showConfig && (
        <div
          className="
            grid
            gap-4

            lg:grid-cols-3
          "
        >
          <input
            value={userToken}
            onChange={(e) =>
              setUserToken(
                e.target.value
              )
            }
            placeholder="User Token"
            className="
              rounded-2xl

              border
              border-[#2a3a33]

              bg-[#101816]

              px-4
              py-3

              text-sm
              text-white

              outline-none
            "
          />

          <input
            value={sessionId}
            onChange={(e) =>
              setSessionId(
                e.target.value
              )
            }
            placeholder="Session ID"
            className="
              rounded-2xl

              border
              border-[#2a3a33]

              bg-[#101816]

              px-4
              py-3

              text-sm
              text-white

              outline-none
            "
          />

          <button
            onClick={handleRun}
            disabled={
              loading ||
              !prompt
            }
            className="
              flex
              items-center
              justify-center
              gap-2

              rounded-2xl

              bg-[#f5d547]

              px-4
              py-3

              text-sm
              font-semibold

              text-[#111917]

              transition-all

              hover:opacity-90

              disabled:opacity-50
            "
          >
            {loading ? (
              <Loader2
                className="
                  h-4
                  w-4
                  animate-spin
                "
              />
            ) : (
              <Send
                className="
                  h-4
                  w-4
                "
              />
            )}

            Run Pipeline
          </button>
        </div>
      )}
    </div>
  )
}

export default PipelineControls