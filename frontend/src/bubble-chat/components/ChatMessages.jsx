import {
  useEffect,
  useRef,
} from "react"

import ChatMessage from "./ChatMessage.jsx"

const ChatMessages = ({
  messages = [],
  loading = false,
}) => {

  const messagesEndRef =
    useRef(null)

  const previousLengthRef =
    useRef(0)

  /* ========================================
     AUTO SCROLL
  ======================================== */

  useEffect(() => {

    const hasNewMessage =
      messages.length >
      previousLengthRef.current

    if (hasNewMessage) {

      messagesEndRef.current
        ?.scrollIntoView({
          behavior:
            "auto",
        })

      previousLengthRef.current =
        messages.length
    }

  }, [messages])

  return (
    <div
      className="
        flex
        h-full
        flex-col
        gap-4

        overflow-y-auto

        px-4
        py-5

        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      {/* EMPTY STATE */}
      {!loading &&
        messages.length === 0 && (
          <div
            className="
              flex
              flex-1
              items-center
              justify-center

              text-center
              text-sm
              text-zinc-400
            "
          >
            Start a conversation.
          </div>
        )}

      {/* MESSAGES */}
      {messages.map(
        (message, index) => (
          <ChatMessage
            key={
              message.id ||
              `${message.sender}-${index}`
            }

            message={
              message
            }
          />
        )
      )}

      {/* TYPING */}
      {loading && (
        <ChatMessage
          message={{
            id:
              "typing",

            sender:
              "agent",

            text:
              "Typing...",

            time: "",
          }}
        />
      )}

      {/* AUTO SCROLL TARGET */}
      <div
        ref={messagesEndRef}
      />
    </div>
  )
}

export default ChatMessages