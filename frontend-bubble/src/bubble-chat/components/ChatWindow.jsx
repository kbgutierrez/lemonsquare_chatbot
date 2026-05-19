import ChatHeader from "./ChatHeader.jsx"
import ChatMessages from "./ChatMessages.jsx"

import ChatFooter from "./ChatFooter/ChatFooter.jsx"

import chatWindowBackground
  from "../../assets/Chatwindow-background.png"

const ChatWindow = ({
  messages = [],
  loading = false,
  resolved = false,
  onSendMessage,
  onClose,
  onOpenModal,

  /*
    NEW: optional session reset key
    (safe addition, backward compatible)
  */
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

        rounded-[28px]

        bg-[#f6fff7]

        shadow-[0_10px_40px_rgba(0,0,0,0.08)]
      "
    >

      {/* BACKGROUND IMAGE */}
      <img
        src={chatWindowBackground}
        alt="Chat Background"
        draggable={false}
        className="
          pointer-events-none

          absolute
          inset-0

          h-full
          w-full

          object-cover

          select-none

          opacity-100
        "
      />

      {/* OVERLAY */}
      <div
        className="
          pointer-events-none

          absolute
          inset-0

          bg-gradient-to-b
          from-[#f3fff4]/90
          via-[#f7fff8]/88
          to-white/96
        "
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

          rounded-[28px]
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
          <div className="
            pointer-events-none

            absolute
            inset-x-0
            top-0

            h-40

            bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.14),transparent_72%)]

            z-0
          " />

          {/* BOTTOM GLOW */}
          <div className="
            pointer-events-none

            absolute
            bottom-0
            right-0

            h-52
            w-52

            rounded-full

            bg-emerald-200/20

            blur-3xl

            z-0
          " />

          {/* RESOLVED BANNER */}
          {resolved && (
            <div className="
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
            ">
              This conversation has been resolved.
            </div>
          )}

          {/* MESSAGES */}
          <div className="relative z-10 h-full">
            <ChatMessages
              messages={messages}
              loading={loading}
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