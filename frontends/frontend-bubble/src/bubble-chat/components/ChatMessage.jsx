// frontends/frontend-bubble/src/bubble-chat/components/ChatMessage.jsx
import {
  memo,
  useMemo,
  useState,
} from "react"

import {
  Bot,
  User,
  LoaderCircle,
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
          "
          style={{
            backgroundColor: color,
            opacity: 0.6,
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
      WebkitTextFillColor: text,
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

  const isLoading =
    Boolean(
      message?.isLoading
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

        border: "1px solid",
        borderColor:
          "var(--ls-border-color)",

        color: theme.agentText,
        color: theme.agentText,
        WebkitTextFillColor:
          theme.agentText,
        boxShadow: `0 3px 10px ${theme.agentBubbleShadow}`,
        borderRadius: "12px 12px 12px 4px",
      }
    : {
        backgroundColor: theme.userBubbleBg,

        border: "1px solid",
        borderColor:
          "var(--ls-border-color)",

        color: theme.userText,
        color: theme.userText,
        WebkitTextFillColor:
          theme.userText,
        boxShadow: `0 3px 10px ${theme.userBubbleShadow}`,
        borderRadius: "12px 12px 4px 12px",
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

        ${isAgent ? "justify-start" : "justify-end"}
      `}
    >

      {isAgent && (
        <Avatar {...avatarProps} />
      )}

      <div
        className="
          max-w-[75%]

          px-3
          py-2

          bg-black/[0.03]

          transition-all
          duration-150

          border
          ls-border
        "
        style={{
          ...bubbleStyle,

          "--ls-border-color":
            isAgent
              ? theme.agentBubbleBorder
              : theme.userBubbleBorder,
        }}
      >

        {isLoading ? (
          <div className="flex items-center gap-2">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" style={{
              color: theme.typingDot,
              WebkitTextFillColor:
                theme.typingDot,
            }} />
            <p className="whitespace-pre-wrap break-words text-[12px] leading-snug">
              {text}
            </p>
          </div>
        ) : isTyping ? (
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

        {!!timestamp && !isTyping && !isLoading && (
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
              WebkitTextFillColor:
                timeColor,
              opacity: showTime ? 1 : 0,
              height: showTime ? "auto" : 0,
            }}
          >
            {timestamp}
          </div>
        )}

      </div>

      {!isAgent && (
        <Avatar {...avatarProps} />
      )}

    </div>
  )
}

export default memo(ChatMessage)