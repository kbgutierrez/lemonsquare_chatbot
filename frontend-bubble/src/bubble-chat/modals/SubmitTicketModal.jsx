import {
  Sparkles,
  SendHorizonal,
  BrainCircuit,
  MessageSquareWarning,
  CheckCircle2,
  ShieldAlert,
  LoaderCircle,
} from "lucide-react"

import ModalShell from "../components/ModalShell.jsx"

import { useTicketForm } from "../hooks/useTicketForm"

const SubmitTicketModal = ({
  onClose,
  sessionId,
  requesterId,
  messages = [],
}) => {

  const {
    loading,
    success,

    submit,

    aiSummary,

    summaryLoading,
  } = useTicketForm({
    sessionId,
    requesterId,
    messages,

    onSuccess: () => {

      setTimeout(() => {

        onClose?.()

      }, 1200)
    },
  })

  return (
    <ModalShell
      onClose={onClose}
      title="Escalate to Human Agent"
      subtitle="AI Generated Escalation Summary"
      size="md"
      icon={
        <MessageSquareWarning
          className="
            h-5
            w-5
          "
        />
      }
    >
      <div
        className="
          px-4
          py-4

          sm:px-6
          sm:py-5
        "
      >
        {/* SUCCESS */}
        {success && (
          <div
            className="
              mb-5

              flex
              items-start
              gap-3

              rounded-2xl

              border
              border-emerald-100

              bg-emerald-50

              p-4
            "
          >
            <CheckCircle2
              className="
                mt-0.5
                h-5
                w-5

                text-emerald-600
              "
            />

            <div>
              <p
                className="
                  text-sm
                  font-semibold

                  text-emerald-700
                "
              >
                Escalation submitted successfully.
              </p>

              <p
                className="
                  mt-1

                  text-xs

                  text-emerald-600
                "
              >
                Human support agents can now review this conversation.
              </p>
            </div>
          </div>
        )}

        {/* AI SUMMARY */}
        <div
          className="
            overflow-hidden

            rounded-3xl

            border
            border-violet-100

            bg-gradient-to-br
            from-violet-50
            to-indigo-50
          "
        >
          <div
            className="
              flex
              items-start
              gap-4

              p-5
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center

                rounded-2xl

                bg-white

                shadow-sm
              "
            >
              {summaryLoading ? (
                <LoaderCircle
                  className="
                    h-6
                    w-6

                    animate-spin

                    text-violet-600
                  "
                />
              ) : (
                <BrainCircuit
                  className="
                    h-6
                    w-6

                    text-violet-600
                  "
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <Sparkles
                  className="
                    h-4
                    w-4

                    text-violet-500
                  "
                />

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.18em]

                    text-violet-600
                  "
                >
                  AI Conversation Summary
                </p>
              </div>

              {summaryLoading ? (
                <div className="mt-4">
                  <div
                    className="
                      h-4
                      w-2/3

                      animate-pulse

                      rounded-full

                      bg-violet-200
                    "
                  />

                  <div className="mt-4 space-y-3">
                    <div
                      className="
                        h-3
                        w-full

                        animate-pulse

                        rounded-full

                        bg-violet-100
                      "
                    />

                    <div
                      className="
                        h-3
                        w-11/12

                        animate-pulse

                        rounded-full

                        bg-violet-100
                      "
                    />

                    <div
                      className="
                        h-3
                        w-4/5

                        animate-pulse

                        rounded-full

                        bg-violet-100
                      "
                    />
                  </div>

                  <div
                    className="
                      mt-5

                      flex
                      items-center
                      gap-2

                      text-xs
                      text-violet-600
                    "
                  >
                    <LoaderCircle
                      className="
                        h-3.5
                        w-3.5

                        animate-spin
                      "
                    />

                    Generating escalation summary...
                  </div>
                </div>
              ) : (
                <>
                  <h3
                    className="
                      mt-3

                      text-sm
                      font-semibold

                      text-slate-900
                    "
                  >
                    {aiSummary.title}
                  </h3>

                  <p
                    className="
                      mt-3

                      whitespace-pre-wrap

                      text-sm
                      leading-relaxed

                      text-slate-700
                    "
                  >
                    {aiSummary.summary}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* PIPELINE INFO */}
        <div
          className="
            mt-5

            rounded-3xl

            border
            border-amber-100

            bg-amber-50/70

            p-4
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <ShieldAlert
              className="
                mt-0.5
                h-5
                w-5
                shrink-0

                text-amber-600
              "
            />

            <div>
              <p
                className="
                  text-sm
                  font-semibold

                  text-amber-800
                "
              >
                Escalation Preview
              </p>

              <p
                className="
                  mt-1

                  text-xs
                  leading-relaxed

                  text-amber-700
                "
              >
                The current conversation history and AI-generated
                summary will be forwarded to the live support workflow.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="
            mt-6

            flex
            flex-col-reverse
            gap-3

            sm:flex-row
            sm:justify-end
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              w-full

              rounded-2xl

              border
              border-slate-200

              bg-white

              px-5
              py-3

              text-sm
              font-medium
              text-slate-700

              transition-colors
              duration-200

              hover:bg-slate-50

              disabled:cursor-not-allowed
              disabled:opacity-50

              sm:w-auto
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={
              loading ||
              summaryLoading
            }
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2

              rounded-2xl

              bg-gradient-to-r
              from-violet-600
              to-purple-500

              px-6
              py-3

              text-sm
              font-medium
              text-white

              shadow-lg

              transition-all
              duration-200

              hover:scale-[1.02]

              disabled:cursor-not-allowed
              disabled:opacity-50

              sm:w-auto
            "
          >
            {loading ? (
              <>
                <div
                  className="
                    h-4
                    w-4

                    animate-spin

                    rounded-full

                    border-2
                    border-white/40
                    border-t-white
                  "
                />

                Escalating...
              </>
            ) : summaryLoading ? (
              <>
                <LoaderCircle
                  className="
                    h-4
                    w-4

                    animate-spin
                  "
                />

                Preparing Summary...
              </>
            ) : (
              <>
                <SendHorizonal
                  className="
                    h-4
                    w-4
                  "
                />

                Confirm Submit
              </>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

export default SubmitTicketModal