import {
  useCallback,
  useState,
} from "react"

import {
  SendHorizonal,
  Sparkles,
  ChevronDown,
  LoaderCircle,
  Lock,
} from "lucide-react"

const quickQuestions = [
  "How do I reset my account?",
  "Where can I find guides?",
  "How do I submit a ticket?",
  "Talk to an agent",
]

const MAX_MESSAGE_LENGTH = 4000

const chip = `
  shrink-0

  rounded-full

  border
  border-violet-200

  bg-violet-50

  transition-all
  duration-200

  hover:bg-violet-100
`

const ChatFooter = ({
  onSendMessage,
  loading = false,
  resolved = false,
}) => {

  const [message, setMessage] =
    useState("")

  const [showQuestions, setShowQuestions] =
    useState(true)

  /* ========================================
     SEND
  ======================================== */

  const handleSend =
    useCallback(
      async (
        customMessage
      ) => {

        if (
          resolved
        ) {
          return
        }

        const finalMessage =
          (
            customMessage ??
            message
          ).trim()

        if (
          !finalMessage ||
          loading
        ) {
          return
        }

        try {

          await onSendMessage(
            finalMessage
          )

          setMessage("")

        } catch (error) {

          console.error(
            "CHAT_SEND_ERROR",
            error
          )
        }
      },
      [
        message,
        loading,
        resolved,
        onSendMessage,
      ]
    )

  /* ========================================
     ENTER
  ======================================== */

  const handleKeyDown =
    (
      event
    ) => {

      if (
        event.key ===
          "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault()

        handleSend()
      }
    }

  /* ========================================
     QUICK QUESTION
  ======================================== */

  const handleQuickQuestion =
    async (
      question
    ) => {

      if (
        resolved
      ) {
        return
      }

      setMessage(question)

      await handleSend(
        question
      )
    }

  return (
    <div
      className="
        border-t
        border-violet-100

        bg-white

        px-3
        py-3
      "
    >
      {/* RESOLVED BANNER */}
      {resolved && (
        <div
          className="
            mb-3

            flex
            items-center
            gap-3

            rounded-2xl

            border
            border-emerald-200

            bg-emerald-50

            px-4
            py-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center

              rounded-xl

              bg-emerald-100
            "
          >
            <Lock
              className="
                h-5
                w-5
                text-emerald-700
              "
            />
          </div>

          <div>
            <p
              className="
                text-sm
                font-semibold

                text-emerald-800
              "
            >
              Conversation Resolved
            </p>

            <p
              className="
                mt-1
                text-xs
                text-emerald-700
              "
            >
              This chat is now read-only.
            </p>
          </div>
        </div>
      )}

      {/* FAQ */}
      {!resolved && (
        <div className="mb-3">

          {!showQuestions && (
            <div className="flex justify-end">
              <button
                type="button"

                aria-label="Open FAQ"

                onClick={() =>
                  setShowQuestions(
                    true
                  )
                }

                className={`
                  ${chip}

                  flex
                  items-center
                  gap-1.5

                  px-2.5
                  py-1

                  text-[9px]
                  font-semibold

                  uppercase
                  tracking-[0.12em]

                  text-violet-600
                `}
              >
                <Sparkles className="h-3 w-3" />

                FAQ

                <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
              </button>
            </div>
          )}

          <div
            className={`
              overflow-hidden

              transition-all
              duration-300
              ease-in-out

              ${
                showQuestions
                  ? "max-h-40 opacity-100"
                  : "max-h-0 opacity-0"
              }
            `}
          >
            {/* TOP */}
            <div
              className="
                mb-2

                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-2
                "
              >
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />

                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-violet-500
                  "
                >
                  Frequently Asked
                </p>
              </div>

              <div
                className="
                  h-px
                  flex-1

                  bg-gradient-to-r
                  from-violet-200
                  to-transparent
                "
              />

              <button
                type="button"

                aria-label="Hide FAQ"

                onClick={() =>
                  setShowQuestions(
                    false
                  )
                }

                className={`
                  ${chip}

                  flex
                  h-6
                  w-6
                  items-center
                  justify-center

                  text-violet-500
                `}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* QUESTIONS */}
            <div
              className="
                flex
                gap-2

                overflow-x-auto

                pb-1

                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {quickQuestions.map(
                (
                  question
                ) => (
                  <button
                    key={
                      question
                    }

                    type="button"

                    disabled={
                      loading
                    }

                    onClick={() =>
                      handleQuickQuestion(
                        question
                      )
                    }

                    className={`
                      ${chip}

                      px-3
                      py-1.5

                      text-[11px]
                      font-medium
                      text-violet-700

                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    `}
                  >
                    {question}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* INPUT */}
      <div
        className="
          flex
          items-end
          gap-2

          rounded-2xl

          border
          border-violet-200

          bg-violet-50/60

          px-3
          py-2
        "
      >
        <textarea
          rows={1}

          value={message}

          disabled={
            loading ||
            resolved
          }

          maxLength={
            MAX_MESSAGE_LENGTH
          }

          enterKeyHint="send"

          aria-label="Chat input"

          onChange={(
            event
          ) =>
            setMessage(
              event.target.value
            )
          }

          onKeyDown={
            handleKeyDown
          }

          placeholder={
            resolved
              ? "Resolved conversations are read-only."
              : loading
                ? "AI is replying..."
                : "Ask something..."
          }

          className="
            max-h-40
            min-h-[24px]
            w-full
            resize-none

            bg-transparent

            text-sm
            text-slate-700

            outline-none

            placeholder:text-slate-400

            disabled:cursor-not-allowed
            disabled:opacity-70
          "
        />

        <button
          type="button"

          aria-label="Send message"

          disabled={
            loading ||
            resolved ||
            !message.trim()
          }

          onClick={
            handleSend
          }

          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center

            rounded-xl

            bg-gradient-to-r
            from-violet-600
            to-purple-500

            text-white

            transition-all
            duration-200

            hover:scale-[1.03]

            disabled:cursor-not-allowed
            disabled:opacity-70
          "
        >
          {loading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : resolved ? (
            <Lock className="h-4 w-4" />
          ) : (
            <SendHorizonal className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* STATUS */}
      <div
        className="
          mt-2

          flex
          items-center
          justify-between
        "
      >
        <p className="text-[10px] text-slate-400">
          {resolved
            ? "Conversation locked"
            : loading
              ? "AI is generating a response..."
              : "AI assistance enabled"}
        </p>

        <div
          className="
            flex
            items-center
            gap-1
          "
        >
          <div
            className={`
              h-2
              w-2

              rounded-full

              ${
                resolved
                  ? "bg-slate-400"
                  : loading
                    ? "bg-yellow-400"
                    : "bg-emerald-400"
              }
            `}
          />

          <span className="text-[10px] text-slate-400">
            {resolved
              ? "Resolved"
              : loading
                ? "Typing..."
                : "Online"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ChatFooter