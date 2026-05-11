import ChatHeader from "./ChatHeader.jsx"
import ChatMessages from "./ChatMessages.jsx"
import ChatFooter from "./ChatFooter.jsx"

const ChatWindow = ({
  messages,
  loading,
  onSendMessage,
  onClose,
  onOpenModal,
}) => {

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
            loading={loading}
          />
        </div>
      </div>

      {/* FOOTER */}
      <ChatFooter
        onSendMessage={
          onSendMessage
        }
      />
    </div>
  )
}

export default ChatWindow