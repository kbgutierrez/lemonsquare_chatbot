import ChatHeader from "./ChatHeader.jsx"
import ChatMessages from "./ChatMessages.jsx"

import ChatFooter from "./ChatFooter/ChatFooter.jsx"

import chatWindowBackground
  from "../../assets/Chatwindow-background.png"

const overlayClass = `
  pointer-events-none
  absolute
  inset-0
`

const glowClass = `
  pointer-events-none
  absolute
  z-0
`

const ChatWindow = ({
  messages = [],
  loading = false,
  resolved = false,
  resolutionCheck = {
    showResolutionPrompt: false,
    allowTicketSubmission: false,
    resolutionMessage: null,
  },
  onSendMessage,
  onResolveConversation,
  onDismissResolution,
  onClose,
  onOpenModal,
  sessionKey,
}) => {

  return (
    <section
      key={sessionKey || "active-chat"}
      aria-label="Chat Window"
      className="
        relative

        flex
        h-full
        min-h-0
        flex-col

        overflow-hidden

        rounded-[28px]

        bg-[#f6fff7]

        shadow-[0_10px_40px_rgba(0,0,0,0.08)]
      "
    >

      {/* BACKGROUND IMAGE */}
      <img
        src={chatWindowBackground}
        alt=""
        draggable={false}
        className={`
          ${overlayClass}

          h-full
          w-full

          select-none
          object-cover
        `}
      />

      {/* OVERLAY */}
      <div
        className={`
          ${overlayClass}

          bg-gradient-to-b
          from-[#f3fff4]/90
          via-[#f7fff8]/88
          to-white/96
        `}
      />

      {/* INNER */}
      <div
        className="
          relative
          z-10

          flex
          h-full
          min-h-0
          flex-col
        "
      >

        {/* HEADER */}
        <div className="relative z-[5000]">
          <ChatHeader
            resolved={resolved}
            onClose={onClose}
            onOpenModal={onOpenModal}
          />
        </div>

        {/* CHAT AREA */}
        <main className="relative flex-1 min-h-0 overflow-hidden">

          {/* TOP GLOW */}
          <div
            className={`
              ${glowClass}

              inset-x-0
              top-0

              h-40

              bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.14),transparent_72%)]
            `}
          />

          {/* BOTTOM GLOW */}
          <div
            className={`
              ${glowClass}

              bottom-0
              right-0

              h-52
              w-52

              rounded-full

              bg-emerald-200/20

              blur-3xl
            `}
          />

          {/* RESOLVED */}
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
          <div className="relative z-10 h-full">
            <ChatMessages
              messages={messages}
              loading={loading}
              resolved={resolved}
              resolutionCheck={resolutionCheck}
              onResolve={onResolveConversation}
              onDismiss={onDismissResolution}
              onOpenTicket={() => onOpenModal("ticket")}
            />
          </div>

        </main>

        {/* FOOTER */}
        <ChatFooter
          loading={loading}
          resolved={resolved}
          onSendMessage={onSendMessage}
        />

      </div>

    </section>
  )
}

export default ChatWindow