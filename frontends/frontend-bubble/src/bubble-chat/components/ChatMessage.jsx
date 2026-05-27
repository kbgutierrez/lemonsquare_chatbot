import {
  memo,
  useMemo,
  useState,
} from "react"

import {
  Bot,
  User,
} from "lucide-react"

import { useTheme } from "../context/ThemeContext.jsx"

const TypingDots = memo(
  ({ color }) => (
    <div className="flex items-center gap-1 py-0.5">
      {[0, 0.15, 0.3].map(delay => (
        <span
          key={delay}
          className="
            h-1.5
            w-1.5
            rounded-full

            animate-bounce
          "
          style={{
            backgroundColor: color,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  )
)

const Avatar = ({
  bg,
  text,
  ring,
  Icon,
}) => (
  <div
    className="
      flex
      h-7
      w-7
      shrink-0
      items-center
      justify-center

      rounded-full
    "
    style={{
      backgroundColor: bg,
      color: text,
      boxShadow: `0 0 0 2px ${ring}`,
    }}
  >
    <Icon className="h-3.5 w-3.5" />
  </div>
)

const ChatMessage = ({
  message = {},
}) => {

  const { theme } = useTheme()

  const [showTime, setShowTime] =
    useState(false)

  const sender =
    message?.sender ===
    "user"
      ? "user"
      : "agent"

  const isTyping =
    Boolean(
      message?.isTyping
    )

  const timestamp =
    message?.time || ""

  const text =
    typeof message?.text ===
    "string"
      ? message.text
      : ""

  const isAgent =
    sender === "agent"

  const bubbleStyle = isAgent
    ? {
        backgroundColor: theme.agentBubbleBg,
        borderColor: theme.agentBubbleBorder,
        color: theme.agentText,
        boxShadow: `0 3px 10px ${theme.agentBubbleShadow}`,
      }
    : {
        backgroundColor: theme.userBubbleBg,
        borderColor: theme.userBubbleBorder,
        color: theme.userText,
        boxShadow: `0 3px 10px ${theme.userBubbleShadow}`,
      }

  const avatarProps = isAgent
    ? {
        bg: theme.agentAvatarBg,
        text: theme.agentAvatarText,
        ring: theme.agentAvatarRing,
        Icon: Bot,
      }
    : {
        bg: theme.userAvatarBg,
        text: theme.userAvatarText,
        ring: theme.userAvatarRing,
        Icon: User,
      }

  const timeColor = isAgent
    ? theme.agentTimestamp
    : theme.userTimestamp

  return (
    <div
      onClick={() =>
        setShowTime(
          prev => !prev
        )
      }
      className={`
        group

        flex
        items-end
        gap-2

        cursor-pointer

        animate-[fadeIn_.15s_ease-out]

        ${isAgent ? "justify-start" : "justify-end"}
      `}
    >

      {/* LEFT AVATAR */}
      {isAgent && (
        <Avatar {...avatarProps} />
      )}

      {/* BUBBLE */}
      <div
        className="
          max-w-[75%]

          rounded-xl

          px-3
          py-2

          backdrop-blur-md

          transition-all
          duration-150

          border
        "
        style={bubbleStyle}
      >

        {/* CONTENT */}
        {isTyping ? (
          <TypingDots color={theme.typingDot} />
        ) : (
          <p
            className="
              whitespace-pre-wrap
              break-words

              text-[12px]
              leading-snug
            "
          >
            {text}
          </p>
        )}

        {/* TIME */}
        {!!timestamp && !isTyping && (
          <div
            className="
              mt-1

              text-right
              text-[9px]

              transition-all
              duration-150
            "
            style={{
              color: timeColor,
              opacity: showTime ? 1 : 0,
              height: showTime ? "auto" : 0,
            }}
          >
            {timestamp}
          </div>
        )}

      </div>

      {/* RIGHT AVATAR */}
      {!isAgent && (
        <Avatar {...avatarProps} />
      )}

    </div>
  )
}

export default memo(ChatMessage)