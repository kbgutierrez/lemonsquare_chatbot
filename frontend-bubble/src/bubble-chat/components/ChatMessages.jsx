import {
  useEffect,
  useMemo,
  useRef,
} from "react"

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
     DEFAULT WELCOME MESSAGE
  ======================================== */

  const welcomeMessage = {
    id: "default-welcome-message",

    sender: "agent",

    text:
      "What can I help you with today?",

    time:
      new Date().toLocaleTimeString(
        [],
        {
          hour:
            "2-digit",

          minute:
            "2-digit",
        }
      ),

    createdAt:
      new Date().toISOString(),
  }

  /* ========================================
     DEDUPE MESSAGES
  ======================================== */

  const normalizedMessages =
    useMemo(() => {

      const seen =
        new Set()

      const deduped =
        messages.filter(
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

      /*
        NEW CHAT:
        Inject default AI greeting.
      */

      if (
        deduped.length === 0
      ) {

        return [
          welcomeMessage,
        ]
      }

      return deduped

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
      {/* MESSAGES */}
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

      {/* AUTO SCROLL TARGET */}
      <div
        ref={messagesEndRef}
      />
    </div>
  )
}

export default ChatMessages