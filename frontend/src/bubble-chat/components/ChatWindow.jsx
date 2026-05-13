import ChatHeader from "./ChatHeader.jsx"
import ChatMessages from "./ChatMessages.jsx"
import ChatFooter from "./ChatFooter.jsx"

const ChatWindow = ({
  messages = [],
  loading = false,
  resolved = false,
  onSendMessage,
  onClose,
  onOpenModal,
}) => {

  return (
    <section
      aria-label="Chat Window"
      className="
        flex
        h-full
        min-h-0
        flex-col

        overflow-hidden

        rounded-[28px]

        bg-white

        shadow-[0_10px_40px_rgba(0,0,0,0.08)]
      "
    >
      {/* HEADER */}
      <ChatHeader
        resolved={
          resolved
        }

        onClose={
          onClose
        }

        onOpenModal={
          onOpenModal
        }
      />

      {/* CHAT AREA */}
      <main
        className="
          relative
          flex-1
          min-h-0
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

        {/* SECONDARY DECORATION */}
        <div
          className="
            pointer-events-none

            absolute
            bottom-0
            right-0

            h-48
            w-48

            rounded-full

            bg-violet-100/30

            blur-3xl
          "
        />

        {/* RESOLVED BANNER */}
        {resolved && (
          <div
            className="
              absolute
              left-1/2
              top-3
              z-20

              -translate-x-1/2

              rounded-full

              border
              border-emerald-200

              bg-emerald-50

              px-4
              py-2

              text-xs
              font-medium

              text-emerald-700

              shadow-sm
            "
          >
            This conversation has been resolved.
          </div>
        )}

        {/* MESSAGES */}
        <div
          className="
            relative
            z-10
            h-full
          "
        >
          <ChatMessages
            messages={
              messages
            }

            loading={
              loading
            }
          />
        </div>
      </main>

      {/* FOOTER */}
      <ChatFooter
        loading={
          loading
        }

        resolved={
          resolved
        }

        onSendMessage={
          onSendMessage
        }
      />
    </section>
  )
}

export default ChatWindow