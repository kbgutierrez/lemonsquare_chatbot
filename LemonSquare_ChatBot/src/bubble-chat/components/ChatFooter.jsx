import {
  SendHorizonal,
  Sparkles,
  ChevronDown
} from 'lucide-react'

import { useState } from 'react'

const quickQuestions = [
  'How do I reset my account?',
  'Where can I find guides?',
  'How do I submit a ticket?',
  'Talk to an agent'
]

const ChatFooter = ({
  onSendMessage
}) => {

  const [message, setMessage] =
    useState('')

  const [showQuestions, setShowQuestions] =
    useState(true)

  /* SEND */
  const handleSend = () => {

    const trimmed =
      message.trim()

    if (!trimmed) return

    /* PLACEHOLDER BACKEND */
    const backendPayload = {
      userMessage: trimmed,

      endpoint:
        'SQL_SERVER_CHAT_ENDPOINT_PLACEHOLDER'
    }

    console.log(
      'SEND TO BACKEND:',
      backendPayload
    )

    /* USER MESSAGE */
    onSendMessage(trimmed)

    /* PLACEHOLDER AI RESPONSE */
    setTimeout(() => {

      const aiResponse = {
        response:
          'PLACEHOLDER_AI_RESPONSE_FROM_BACKEND'
      }

      onSendMessage(
        aiResponse.response,
        true
      )

    }, 1000)

    setMessage('')
  }

  /* ENTER */
  const handleKeyDown = (
    event
  ) => {

    if (event.key === 'Enter') {
      handleSend()
    }
  }

  /* QUICK QUESTION */
  const handleQuickQuestion = (
    question
  ) => {

    setMessage(question)
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

      {/* FAQ SECTION */}
      <div className="mb-3">

        {/* COLLAPSED */}
        {!showQuestions && (
          <div
            className="
              flex
              justify-end

              animate-in
              fade-in
              duration-300
            "
          >
            <button
              type="button"

              onClick={() =>
                setShowQuestions(true)
              }

              className="
                flex
                items-center
                gap-1.5

                rounded-full

                border
                border-violet-200

                bg-violet-50

                px-2.5
                py-1

                text-[9px]
                font-semibold

                uppercase
                tracking-[0.12em]

                text-violet-600

                transition-all
                duration-200

                hover:bg-violet-100
                hover:scale-[1.02]
              "
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
                ? 'max-h-40 opacity-100'
                : 'max-h-0 opacity-0'
            }
          `}
        >

          {/* TOP BAR */}
          <div
            className="
              mb-2
              flex
              items-center
              gap-3
            "
          >

            {/* LEFT */}
            <div
              className="
                flex
                items-center
                gap-2
                shrink-0
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

              className="
                flex
                h-6
                w-6
                items-center
                justify-center

                rounded-full

                border
                border-violet-200

                bg-violet-50

                text-violet-500

                transition-all
                duration-200

                hover:bg-violet-100
              "
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
            "

            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >

            <style>
              {`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>

            {quickQuestions.map((question) => (
              <button
                key={question}
                type="button"

                onClick={() =>
                  handleQuickQuestion(
                    question
                  )
                }

                className="
                  shrink-0

                  rounded-full

                  border
                  border-violet-200

                  bg-violet-50

                  px-3
                  py-1.5

                  text-[11px]
                  font-medium
                  text-violet-700

                  transition-all
                  duration-200

                  hover:bg-violet-100
                "
              >
                {question}
              </button>
            ))}
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

          onChange={(event) =>
            setMessage(
              event.target.value
            )
          }

          onKeyDown={
            handleKeyDown
          }

          placeholder="Ask something..."

          className="
            w-full

            bg-transparent

            text-sm
            text-slate-700

            outline-none

            placeholder:text-slate-400
          "
        />

        <button
          type="button"

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
          "
        >
          <SendHorizonal className="h-4 w-4" />
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
          AI assistance enabled
        </p>

        <div
          className="
            flex
            items-center
            gap-1
          "
        >
          <div
            className="
              h-2
              w-2
              rounded-full
              bg-emerald-400
            "
          />

          <span className="text-[10px] text-slate-400">
            Online
          </span>
        </div>
      </div>
    </div>
  )
}

export default ChatFooter