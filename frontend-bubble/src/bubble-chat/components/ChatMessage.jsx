import {
  Bot,
  User,
} from "lucide-react"

import {
  useState,
} from "react"

const TypingDots = () => {

  return (
    <div className="flex items-center gap-1 py-0.5">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" />
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.3s]" />
    </div>
  )
}

const ChatMessage = ({
  message = {},
}) => {

  const [showTime, setShowTime] =
    useState(false)

  const sender =
    message?.sender || "agent"

  const text =
    typeof message?.text === "string"
      ? message.text
      : ""

  const timestamp =
    message?.time || ""

  const isAgent =
    sender === "agent"

  const isTyping =
    Boolean(message?.isTyping)

  const config = isAgent
    ? {
        wrapper: "justify-start",

        bubble: `
          rounded-xl

          border
          border-emerald-100/60

          bg-white/85

          text-slate-800

          shadow-[0_3px_10px_rgba(16,185,129,0.06)]
        `,

        time: "text-slate-400",

        avatar: `
          bg-emerald-100
          text-emerald-700
          ring-2
          ring-emerald-50
        `,

        Icon: Bot,
      }
    : {
        wrapper: "justify-end",

        bubble: `
          rounded-xl

          bg-white/70

          border
          border-emerald-200/50

          text-slate-800

          shadow-[0_3px_10px_rgba(16,185,129,0.08)]
        `,

        time: "text-slate-400",

        avatar: `
          bg-emerald-500
          text-white
          ring-2
          ring-emerald-100
        `,

        Icon: User,
      }

  const {
    wrapper,
    bubble,
    time,
    avatar,
    Icon,
  } = config

  return (
    <div
      onClick={() =>
        setShowTime(prev => !prev)
      }
      className={`
        group

        flex
        items-end

        gap-2

        animate-[fadeIn_.15s_ease-out]

        cursor-pointer

        ${wrapper}
      `}
    >

      {/* AVATAR */}
      {isAgent && (
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

        {/* TEXT */}
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

        {/* TIME (TOGGLE) */}
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
                  : "opacity-0 h-0"
              }
            `}
          >
            {timestamp}
          </div>
        )}

      </div>

      {/* USER AVATAR */}
      {!isAgent && (
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
      )}

    </div>
  )
}

export default ChatMessage