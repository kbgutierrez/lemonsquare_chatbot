import ChatHeader from "./ChatHeader.jsx"
import ChatMessages from "./ChatMessages.jsx"
import ChatFooter from "./ChatFooter/ChatFooter.jsx"

import chatWindowBackground
  from "../../assets/Chatwindow-background.png"

import { useTheme } from "../context/ThemeContext.jsx"

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
    escalationId: null,
  },
  onSendMessage,
  onResolveConversation,
  onDismissResolution,
  onClose,
  onOpenModal,
  sessionKey,
  escalationDecision,
  onMakeEscalationDecision,
  consumedEscalationIds,
  onConsumeEscalation,
  sessionTicketSubmitted,
}) => {

  const { theme } = useTheme()

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

        shadow-[0_10px_40px_rgba(0,0,0,0.08)]
      "
      style={{
        backgroundColor: theme.windowBg,
      }}
    >

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

          transition-opacity
          duration-300
        `}
        style={{
          opacity: theme.windowBgImageOpacity,
        }}
      />

      <div
        className={overlayClass}
        style={{
          background: `linear-gradient(to bottom, ${theme.windowOverlayStart}, ${theme.windowOverlayMiddle}, ${theme.windowOverlayEnd})`,
        }}
      />

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

        <div className="relative z-[5000]">
          <ChatHeader
            resolved={resolved}
            onClose={onClose}
            onOpenModal={onOpenModal}
          />
        </div>

        <main className="relative flex-1 min-h-0 overflow-hidden">

          <div
            className={glowClass}
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: "10rem",
              background: `radial-gradient(circle at top, ${theme.glowTop}, transparent 72%)`,
            }}
          />

          <div
            className={glowClass}
            style={{
              bottom: 0,
              right: 0,
              height: "13rem",
              width: "13rem",
              borderRadius: "9999px",
              filter: "blur(64px)",
              backgroundColor: theme.glowBottom,
            }}
          />

          {resolved && (
            <div
              className="
                absolute
                left-1/2
                top-3
                z-20

                -translate-x-1/2

                rounded-full

                px-4
                py-2

                text-xs
                font-medium

                shadow-sm
              "
              style={{
                backgroundColor: theme.resolvedBannerBg,
                border: `1px solid ${theme.resolvedBannerBorder}`,
                color: theme.resolvedBannerText,
              }}
            >
              This conversation has been resolved.
            </div>
          )}

          <div className="relative z-10 h-full">
            <ChatMessages
              messages={messages}
              loading={loading}
              resolved={resolved}
              resolutionCheck={resolutionCheck}
              onResolve={onResolveConversation}
              onDismiss={onDismissResolution}
              onOpenTicket={() => onOpenModal("ticket")}
              onMakeEscalationDecision={onMakeEscalationDecision}
              escalationDecision={escalationDecision}
              consumedEscalationIds={consumedEscalationIds}
              onConsumeEscalation={onConsumeEscalation}
              sessionTicketSubmitted={sessionTicketSubmitted}
            />
          </div>

        </main>

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