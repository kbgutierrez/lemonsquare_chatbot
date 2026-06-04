// frontends/frontend-bubble/src/bubble-chat/components/ChatFooter/ChatFooterResolved.jsx
import { Lock } from "lucide-react"
import { useTheme } from "../../context/ThemeContext.jsx"

const ChatFooterResolved = ({
  ticketSubmitted = false,
}) => {
  const { theme } = useTheme()

  return (
    <div
      className="
        mb-3

        flex
        items-start
        gap-3

        rounded-[14px]

        border

        px-4
        py-3

        bg-black/[0.02]
      "
      style={{
        backgroundColor: theme.resolvedBannerBg,
        borderColor: theme.resolvedBannerBorder,
      }}
    >
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center

          rounded-[12px]
        "
        style={{
          backgroundColor: theme.agentAvatarBg,
        }}
      >
        <Lock
          className="
            h-5
            w-5
          "
          style={{
            color: theme.agentAvatarText,
          }}
        />
      </div>

      <div>
        <p
          className="
            text-sm
            font-semibold
          "
          style={{
            color: theme.resolvedBannerText,
          }}
        >
          {ticketSubmitted
            ? "Ticket Submitted"
            : "Conversation Resolved"}
        </p>

        <p
          className="
            mt-1
            text-xs
          "
          style={{
            color: theme.resolvedBannerText,
            opacity: 0.8,
          }}
        >
          {ticketSubmitted
            ? "Your support ticket has been submitted. This chat is now read-only."
            : "This conversation has been resolved and is now read-only."}
        </p>
      </div>
    </div>
  )
}

export default ChatFooterResolved