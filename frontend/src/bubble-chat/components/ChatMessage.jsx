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
        py-1
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
    Boolean(message?.isTyping)

  const config = isAgent
    ? {
        wrapper:
          "justify-start",

        bubble: `
          rounded-bl-lg

          border
          border-violet-100/80

          bg-white/95

          text-slate-800

          shadow-[0_4px_20px_rgba(139,92,246,0.08)]
        `,

        time:
          "text-slate-400",

        avatar: `
          bg-violet-100
          text-violet-700

          ring-4
          ring-violet-50
        `,

        Icon: Bot,
      }
    : {
        wrapper:
          "justify-end",

        bubble: `
          rounded-br-lg

          bg-gradient-to-br
          from-violet-600
          via-violet-500
          to-purple-500

          text-white

          shadow-[0_8px_24px_rgba(139,92,246,0.25)]
        `,

        time:
          "text-violet-100/80",

        avatar: `
          bg-violet-600
          text-white

          ring-4
          ring-violet-100
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
        group

        flex
        items-end

        gap-2
        sm:gap-3

        animate-[fadeIn_.25s_ease-out]

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

            transition-transform
            duration-300

            group-hover:scale-105

            ${avatar}
          `}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}

      {/* MESSAGE */}
      <div
        className={`
          max-w-[85%]
          sm:max-w-[80%]
          lg:max-w-[72%]

          rounded-3xl

          px-4
          py-3

          sm:px-5

          backdrop-blur-sm

          transition-all
          duration-300

          group-hover:-translate-y-[1px]

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

              text-[13px]
              leading-relaxed

              sm:text-sm
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
                text-[10px]
                sm:text-[11px]

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

            transition-transform
            duration-300

            group-hover:scale-105

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