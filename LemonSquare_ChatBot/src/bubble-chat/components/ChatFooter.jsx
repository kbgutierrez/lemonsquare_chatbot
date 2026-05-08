import { useState } from "react"

import {
  SendHorizonal,
  Sparkles,
  ChevronDown,
  LoaderCircle,
} from "lucide-react"

const quickQuestions = [
  "How do I reset my account?",
  "Where can I find guides?",
  "How do I submit a ticket?",
  "Talk to an agent",
]

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
}) => {
  const [message, setMessage] =
    useState("")

  const [showQuestions, setShowQuestions] =
    useState(true)

  /* NEW */
  const [isTyping, setIsTyping] =
    useState(false)

  /* SEND */
  const handleSend = async () => {
    const trimmed =
      message.trim()

    /* BLOCK */
    if (
      !trimmed ||
      isTyping
    ) {
      return
    }

    /*
      FUTURE SAFE:
      - AI streaming
      - OpenAI/Groq
      - RAG
      - SQL logging
      - endpoint routing
    */

    console.log(
      "SEND TO BACKEND:",
      {
        userMessage: trimmed,

        endpoint:
          "SQL_SERVER_CHAT_ENDPOINT_PLACEHOLDER",
      }
    )

    /* USER */
    onSendMessage(trimmed)

    setMessage("")

    /* LOCK CHAT */
    setIsTyping(true)

    /* PLACEHOLDER AI */
    setTimeout(() => {
      onSendMessage(
        "PLACEHOLDER_AI_RESPONSE_FROM_BACKEND",
        true
      )

      /* UNLOCK CHAT */
      setIsTyping(false)
    }, 1000)
  }

  /* ENTER */
  const handleKeyDown = (
    event
  ) => {

    if (
      event.key === "Enter" &&
      !isTyping
    ) {
      handleSend()
    }
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
      {/* FAQ */}
      <div className="mb-3">
        {/* COLLAPSED */}
        {!showQuestions && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                setShowQuestions(true)
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

        {/* EXPANDED */}
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
            {/* TITLE */}
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

            {/* LINE */}
            <div
              className="
                h-px
                flex-1

                bg-gradient-to-r
                from-violet-200
                to-transparent
              "
            />

            {/* COLLAPSE */}
            <button
              type="button"
              onClick={() =>
                setShowQuestions(false)
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
              (question) => (
                <button
                  key={question}
                  type="button"
                  disabled={isTyping}
                  onClick={() =>
                    setMessage(question)
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

      {/* INPUT */}
      <div
        className="
          flex
          items-center
          gap-2

          rounded-2xl

          border
          border-violet-200

          bg-violet-50/60

          px-3
          py-2
        "
      >
        <input
          type="text"
          value={message}
          disabled={isTyping}
          onChange={(event) =>
            setMessage(
              event.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          placeholder={
            isTyping
              ? "AI is replying..."
              : "Ask something..."
          }
          className="
            w-full

            bg-transparent

            text-sm
            text-slate-700

            outline-none

            placeholder:text-slate-400

            disabled:cursor-not-allowed
          "
        />

        <button
          type="button"
          disabled={isTyping}
          onClick={handleSend}
          className="
            flex
            h-9
            w-9
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
          {isTyping ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
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
          {isTyping
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
                isTyping
                  ? "bg-yellow-400"
                  : "bg-emerald-400"
              }
            `}
          />

          <span className="text-[10px] text-slate-400">
            {isTyping
              ? "Typing..."
              : "Online"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ChatFooter