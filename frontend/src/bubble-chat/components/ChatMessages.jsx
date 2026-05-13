import {
  useEffect,
  useRef,
} from "react"

import ChatMessage from "./ChatMessage.jsx"

const ChatMessages = ({
  messages = [],
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
            "smooth",
        })

      previousLengthRef.current =
        messages.length
    }

  }, [messages])

  const hasMessages =
    messages.length > 0

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
      {!hasMessages && (
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

      {/* AUTO SCROLL TARGET */}
      <div
        ref={messagesEndRef}
      />
    </div>
  )
}

export default ChatMessages