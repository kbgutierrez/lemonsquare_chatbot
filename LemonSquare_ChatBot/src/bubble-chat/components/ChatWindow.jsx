import { useState } from "react"

import ChatHeader from "./ChatHeader.jsx"
import ChatMessages from "./ChatMessages.jsx"
import ChatFooter from "./ChatFooter.jsx"

import { mockMessages } from "../data/mockMessages.js"

const ChatWindow = ({
  onClose,
  onOpenModal,
}) => {
  /* CHAT STATE */
  const [messages, setMessages] =
    useState(mockMessages)

  /* TIME */
  const getTime = () =>
    new Date().toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )

  /* SEND MESSAGE */
  const handleSendMessage = (
    text,
    isAgent = false
  ) => {

    /*
      FUTURE SAFE:
      - AI streaming
      - SQL logging
      - Groq/OpenAI
      - RAG pipeline
      - websocket support
      - typing indicators
    */

    setMessages((prev) => [
      ...prev,

      {
        id: Date.now(),

        sender: isAgent
          ? "agent"
          : "user",

        text,

        time: getTime(),
      },
    ])
  }

  return (
    <div
      className="
        flex
        h-full
        flex-col

        overflow-hidden

        rounded-[28px]

        bg-white
      "
    >
      {/* HEADER */}
      <ChatHeader
        onClose={onClose}
        onOpenModal={
          onOpenModal
        }
      />

      {/* CHAT AREA */}
      <div
        className="
          relative
          flex-1
          overflow-hidden

          bg-gradient-to-b
          from-violet-50/50
          via-white
          to-white
        "
      >
        {/* BACKGROUND GLOW */}
        <div
          className="
            pointer-events-none

            absolute
            inset-0

            bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.10),transparent_55%)]
          "
        />

        {/* MESSAGES */}
        <div className="relative z-10 h-full">
          <ChatMessages
            messages={messages}
          />
        </div>
      </div>

      {/* FOOTER */}
      <ChatFooter
        onSendMessage={
          handleSendMessage
        }
      />
    </div>
  )
}

export default ChatWindow