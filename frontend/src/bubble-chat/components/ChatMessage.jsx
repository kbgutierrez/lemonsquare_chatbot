import {
  Bot,
  User,
} from "lucide-react"

const ChatMessage = ({
  message,
}) => {

  const isAgent =
    message.sender ===
    "agent"

  const isTyping =
    message.id ===
    "typing"

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

        animate-in
        fade-in
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
        {/* TEXT */}
        <p
          className={`
            text-sm
            leading-relaxed
            break-words

            ${
              isTyping
                ? "animate-pulse"
                : ""
            }
          `}
        >
          {message.text}
        </p>

        {/* TIME */}
        {!!message.time && (
          <p
            className={`
              mt-2

              text-right
              text-[11px]

              ${time}
            `}
          >
            {message.time}
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