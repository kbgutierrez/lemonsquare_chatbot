import {
  useEffect,
  useRef,
} from "react"

import ChatMessage from "./ChatMessage.jsx"

const ChatMessages = ({
  messages,
}) => {
  const messagesEndRef =
    useRef(null)

  /* AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    )
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
      {/* MESSAGES */}
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
        />
      ))}

      {/* AUTO SCROLL TARGET */}
      <div
        ref={messagesEndRef}
      />
    </div>
  )
}

export default ChatMessages