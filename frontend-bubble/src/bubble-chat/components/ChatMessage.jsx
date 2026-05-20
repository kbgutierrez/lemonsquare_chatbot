import {
  memo,
  useMemo,
  useState,
} from "react"

import {
  Bot,
  User,
} from "lucide-react"

const TypingDots = memo(
  () => (
    <div className="flex items-center gap-1 py-0.5">
      {[0, 0.15, 0.3].map(delay => (
        <span
          key={delay}
          className={`
            h-1.5
            w-1.5
            rounded-full

            bg-emerald-400

            animate-bounce

            [animation-delay:${delay}s]
          `}
        />
      ))}
    </div>
  )
)

const MESSAGE_CONFIG = {
  agent: {
    wrapper:
      "justify-start",

    bubble: `
      border
      border-emerald-100/60

      bg-white/85

      text-slate-800

      shadow-[0_3px_10px_rgba(16,185,129,0.06)]
    `,

    avatar: `
      bg-emerald-100
      text-emerald-700
      ring-2
      ring-emerald-50
    `,

    time:
      "text-slate-400",

    Icon: Bot,
  },

  user: {
    wrapper:
      "justify-end",

    bubble: `
      border
      border-emerald-200/50

      bg-white/70

      text-slate-800

      shadow-[0_3px_10px_rgba(16,185,129,0.08)]
    `,

    avatar: `
      bg-emerald-500
      text-white
      ring-2
      ring-emerald-100
    `,

    time:
      "text-slate-400",

    Icon: User,
  },
}

const Avatar = ({
  avatar,
  Icon,
}) => (
  <div
    className={`
      flex
      h-7
      w-7
      shrink-0
      items-center
      justify-center

      rounded-full

      ${avatar}
    `}
  >
    <Icon className="h-3.5 w-3.5" />
  </div>
)

const ChatMessage = ({
  message = {},
}) => {

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

  const {
    wrapper,
    bubble,
    avatar,
    time,
    Icon,
  } = useMemo(
    () =>
      MESSAGE_CONFIG[
        sender
      ],

    [sender]
  )

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

        ${wrapper}
      `}
    >

      {/* LEFT AVATAR */}
      {isAgent && (
        <Avatar
          avatar={avatar}
          Icon={Icon}
        />
      )}

      {/* BUBBLE */}
      <div
        className={`
          max-w-[75%]

          rounded-xl

          px-3
          py-2

          backdrop-blur-md

          transition-all
          duration-150

          ${bubble}
        `}
      >

        {/* CONTENT */}
        {isTyping ? (
          <TypingDots />
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
            className={`
              mt-1

              text-right
              text-[9px]

              transition-all
              duration-150

              ${time}

              ${
                showTime
                  ? "opacity-100"
                  : "h-0 opacity-0"
              }
            `}
          >
            {timestamp}
          </div>
        )}

      </div>

      {/* RIGHT AVATAR */}
      {!isAgent && (
        <Avatar
          avatar={avatar}
          Icon={Icon}
        />
      )}

    </div>
  )
}

export default memo(ChatMessage)