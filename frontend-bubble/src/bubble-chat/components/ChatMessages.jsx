import {
  useEffect,
  useMemo,
  useRef,
} from "react"

import {
  Sparkles,
  MessageSquareText,
} from "lucide-react"

import ChatMessage from "./ChatMessage.jsx"

const ChatMessages = ({
  messages = [],
}) => {

  const messagesEndRef =
    useRef(null)

  const containerRef =
    useRef(null)

  const previousLengthRef =
    useRef(0)

  const initialLoadRef =
    useRef(true)

  /* ========================================
     DEDUPE MESSAGES
  ======================================== */

  const normalizedMessages =
    useMemo(() => {

      const seen =
        new Set()

      return messages.filter(
        (
          message,
          index
        ) => {

          const key =
            message?.id ||
            `${message?.sender}-${index}-${message?.text}`

          if (
            seen.has(key)
          ) {

            return false
          }

          seen.add(key)

          return true
        }
      )

    }, [messages])

  /* ========================================
     AUTO SCROLL
  ======================================== */

  useEffect(() => {

    const container =
      containerRef.current

    if (!container) {
      return
    }

    /*
      Initial load:
      instant scroll.
    */
    if (
      initialLoadRef.current
    ) {

      initialLoadRef.current =
        false

      messagesEndRef.current
        ?.scrollIntoView({
          behavior:
            "auto",
          block:
            "end",
        })

      previousLengthRef.current =
        normalizedMessages.length

      return
    }

    /*
      Detect new messages.
    */
    const hasNewMessage =
      normalizedMessages.length >
      previousLengthRef.current

    if (
      hasNewMessage
    ) {

      requestAnimationFrame(
        () => {

          messagesEndRef.current
            ?.scrollIntoView({
              behavior:
                "smooth",
              block:
                "end",
            })
        }
      )
    }

    previousLengthRef.current =
      normalizedMessages.length

  }, [normalizedMessages])

  const hasMessages =
    normalizedMessages.length > 0

  return (
    <div
      ref={containerRef}
      className="
        flex
        h-full
        flex-col

        overflow-y-auto

        px-3
        py-3

        sm:px-4
        sm:py-5

        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      {/* EMPTY STATE */}
      {!hasMessages && (
        <div
          className="
            relative

            flex
            flex-1
            flex-col
            items-center
            justify-center

            overflow-hidden

            px-4

            text-center
          "
        >
          {/* BACKGROUND */}
          <div
            className="
              pointer-events-none

              absolute
              inset-0

              overflow-hidden
            "
          >
            {/* MAIN GLOW */}
            <div
              className="
                absolute
                left-1/2
                top-1/2

                h-48
                w-48

                -translate-x-1/2
                -translate-y-1/2

                rounded-full

                bg-violet-200/25

                blur-3xl
              "
            />

            {/* TOP ORB */}
            <div
              className="
                absolute
                top-[18%]
                left-[30%]

                h-16
                w-16

                rounded-full

                bg-purple-200/30

                blur-2xl
              "
            />

            {/* BOTTOM ORB */}
            <div
              className="
                absolute
                bottom-[18%]
                right-[25%]

                h-20
                w-20

                rounded-full

                bg-fuchsia-200/20

                blur-2xl
              "
            />
          </div>

          {/* HERO */}
          <div
            className="
              relative
              z-10

              flex
              flex-col
              items-center
            "
          >
            {/* CUSTOM ICON */}
            <div
              className="
                relative

                flex
                h-20
                w-20
                items-center
                justify-center

                rounded-[28px]

                border
                border-violet-200/60

                bg-white/70

                shadow-[0_10px_40px_rgba(139,92,246,0.12)]

                backdrop-blur-xl
              "
            >
              {/* INNER GLOW */}
              <div
                className="
                  absolute
                  inset-2

                  rounded-[22px]

                  bg-gradient-to-br
                  from-violet-100
                  via-purple-100
                  to-fuchsia-100

                  opacity-70
                "
              />

              {/* ICON STACK */}
              <div
                className="
                  relative
                  z-10

                  flex
                  items-center
                  justify-center
                "
              >
                <div
                  className="
                    absolute

                    h-9
                    w-9

                    rounded-2xl

                    bg-violet-500/15

                    blur-xl
                  "
                />

                <MessageSquareText
                  className="
                    relative

                    h-8
                    w-8

                    text-violet-700
                  "
                />
              </div>

              {/* FLOATING DOT */}
              <div
                className="
                  absolute
                  right-2
                  top-2

                  flex
                  h-5
                  w-5
                  items-center
                  justify-center

                  rounded-full

                  bg-white

                  shadow-md
                "
              >
                <Sparkles
                  className="
                    h-2.5
                    w-2.5

                    text-violet-500
                  "
                />
              </div>
            </div>

            {/* TITLE */}
            <h2
              className="
                mt-5

                text-xl
                font-semibold

                tracking-tight

                text-slate-800
              "
            >
              Start a conversation
            </h2>

            {/* DESCRIPTION */}
            <p
              className="
                mt-3

                max-w-[260px]

                text-sm
                leading-relaxed

                text-slate-500
              "
            >
              Ask questions, troubleshoot
              problems, or get support
              from your virtual assistant.
            </p>

            {/* STATUS */}
            <div
              className="
                mt-6

                flex
                items-center
                gap-2

                rounded-full

                border
                border-violet-100

                bg-white/80

                px-3
                py-1.5

                backdrop-blur-sm
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

              <span
                className="
                  text-[11px]
                  font-medium

                  text-slate-600
                "
              >
                AI Assistant Online
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGES */}
      {hasMessages && (
        <div
          className="
            flex
            flex-col
            gap-4
          "
        >
          {normalizedMessages.map(
            (
              message,
              index
            ) => (
              <ChatMessage
                key={
                  message.id ||
                  `${message.sender}-${index}-${message.text}`
                }
                message={
                  message
                }
              />
            )
          )}
        </div>
      )}

      {/* AUTO SCROLL TARGET */}
      <div
        ref={messagesEndRef}
      />
    </div>
  )
}

export default ChatMessages