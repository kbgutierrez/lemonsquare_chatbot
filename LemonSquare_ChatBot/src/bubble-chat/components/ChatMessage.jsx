import { Bot, User } from 'lucide-react'

const ChatMessage = ({ message }) => {
  const isAgent = message.sender === 'agent'

  return (
    <div
      className={`flex items-end gap-2 ${
        isAgent
          ? 'justify-start'
          : 'justify-end'
      }`}
    >
      {/* AGENT ICON */}
      {isAgent && (
        <div className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-violet-100
        ">
          <Bot className="h-4 w-4 text-violet-700" />
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

          ${
            isAgent
              ? 'rounded-bl-lg bg-white border border-violet-100 text-slate-800'
              : 'rounded-br-lg bg-gradient-to-r from-violet-600 to-purple-500 text-white'
          }
        `}
      >
        <p className="text-sm leading-relaxed">
          {message.text}
        </p>

        <p
          className={`
            mt-2
            text-right
            text-[11px]

            ${
              isAgent
                ? 'text-slate-400'
                : 'text-violet-100'
            }
          `}
        >
          {message.time}
        </p>
      </div>

      {/* USER ICON */}
      {!isAgent && (
        <div className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-violet-600
        ">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  )
}

export default ChatMessage