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

  const initialLoadRef =
    useRef(true)

  /* ========================================
     AUTO SCROLL
  ======================================== */

  useEffect(() => {

    /*
      INITIAL HISTORY LOAD
      Avoid aggressive smooth-scroll.
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
        })

      previousLengthRef.current =
        messages.length

      return
    }

    /*
      ONLY SCROLL
      WHEN NEW MESSAGE ARRIVES.
    */
    const hasNewMessage =
      messages.length >
      previousLengthRef.current

    if (
      hasNewMessage
    ) {

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