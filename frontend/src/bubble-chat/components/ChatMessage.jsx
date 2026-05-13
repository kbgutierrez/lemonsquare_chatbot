import {
  Bot,
  User,
} from "lucide-react"

const TypingDots = () => {

  return (
    <div
      className="
        flex
        items-center
        gap-1
      "
    >
      <span
        className="
          h-2
          w-2
          rounded-full
          bg-violet-400
          animate-bounce
        "
      />

      <span
        className="
          h-2
          w-2
          rounded-full
          bg-violet-400
          animate-bounce
          [animation-delay:0.15s]
        "
      />

      <span
        className="
          h-2
          w-2
          rounded-full
          bg-violet-400
          animate-bounce
          [animation-delay:0.3s]
        "
      />
    </div>
  )
}

const ChatMessage = ({
  message = {},
}) => {

  const sender =
    message?.sender || "agent"

  const text =
    typeof message?.text ===
    "string"
      ? message.text
      : ""

  const timestamp =
    message?.time || ""

  const isAgent =
    sender === "agent"

  const isTyping =
    Boolean(
      message?.isTyping
    )

  const config = isAgent
    ? {
        wrapper:
          "justify-start",

        bubble: `
          rounded-bl-lg

          border
          border-violet-100

          bg-white

          text-slate-800
        `,

        time:
          "text-slate-400",

        avatar: `
          bg-violet-100
          text-violet-700
        `,

        Icon: Bot,
      }
    : {
        wrapper:
          "justify-end",

        bubble: `
          rounded-br-lg

          bg-gradient-to-r
          from-violet-600
          to-purple-500

          text-white
        `,

        time:
          "text-violet-100",

        avatar: `
          bg-violet-600
          text-white
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
      className={`
        flex
        items-end
        gap-2

        transition-all
        duration-200

        ${wrapper}
      `}
    >
      {/* AGENT AVATAR */}
      {isAgent && (
        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center

            rounded-full

            ${avatar}
          `}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}

      {/* MESSAGE */}
      <div
        className={`
          max-w-[82%]

          rounded-3xl

          px-4
          py-3

          shadow-sm

          transition-all
          duration-200

          ${bubble}
        `}
      >
        {/* TYPING */}
        {isTyping ? (
          <TypingDots />
        ) : (
          <p
            className="
              whitespace-pre-wrap
              break-words

              text-sm
              leading-relaxed
            "
          >
            {text}
          </p>
        )}

        {/* TIME */}
        {!!timestamp &&
          !isTyping && (
            <p
              className={`
                mt-2

                text-right
                text-[11px]

                ${time}
              `}
            >
              {timestamp}
            </p>
          )}
      </div>

      {/* USER AVATAR */}
      {!isAgent && (
        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center

            rounded-full

            ${avatar}
          `}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}

export default ChatMessage