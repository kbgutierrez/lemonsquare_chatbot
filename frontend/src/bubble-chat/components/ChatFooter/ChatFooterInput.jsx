import {
  LoaderCircle,
  Lock,
  SendHorizonal,
} from "lucide-react"

const MAX_MESSAGE_LENGTH = 4000

const ChatFooterInput = ({
  textareaRef,
  message,
  setMessage,
  loading,
  resolved,
  onKeyDown,
  onSend,
}) => {

  return (
    <div
      className="
        relative

        flex
        items-end
        gap-2

        rounded-[24px]

        border
        border-violet-200/80

        bg-white/90

        px-3
        py-2

        shadow-[0_4px_20px_rgba(124,58,237,0.06)]

        backdrop-blur-xl

        transition-all
        duration-300

        focus-within:border-violet-300
        focus-within:shadow-[0_8px_30px_rgba(124,58,237,0.12)]
      "
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={message}
        disabled={
          loading ||
          resolved
        }
        maxLength={
          MAX_MESSAGE_LENGTH
        }
        enterKeyHint="send"
        aria-label="Chat input"
        onChange={(
          event
        ) =>
          setMessage(
            event.target.value
          )
        }
        onKeyDown={
          onKeyDown
        }
        placeholder={
          resolved
            ? "Resolved conversations are read-only."
            : loading
              ? "AI is replying..."
              : "Ask something..."
        }
        className="
          max-h-40
          min-h-[24px]
          w-full

          resize-none

          overflow-y-auto

          bg-transparent

          py-1

          text-sm
          leading-relaxed

          text-slate-700

          outline-none

          placeholder:text-slate-400

          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden

          disabled:cursor-not-allowed
          disabled:opacity-70
        "
      />

      <button
        type="button"
        aria-label="Send message"
        disabled={
          loading ||
          resolved ||
          !message.trim()
        }
        onClick={
          onSend
        }
        className="
          group
          relative

          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center

          overflow-hidden

          rounded-2xl

          bg-gradient-to-r
          from-violet-600
          to-purple-500

          text-white

          shadow-[0_8px_20px_rgba(124,58,237,0.28)]

          transition-all
          duration-300

          hover:scale-[1.04]
          hover:shadow-[0_12px_30px_rgba(124,58,237,0.36)]

          active:scale-[0.98]

          disabled:cursor-not-allowed
          disabled:opacity-60
          disabled:hover:scale-100
        "
      >
        <div
          className="
            absolute
            inset-0

            bg-white/10

            opacity-0

            transition-opacity
            duration-300

            group-hover:opacity-100
          "
        />

        {loading ? (
          <LoaderCircle
            className="
              relative
              z-10

              h-4
              w-4

              animate-spin
            "
          />
        ) : resolved ? (
          <Lock
            className="
              relative
              z-10

              h-4
              w-4
            "
          />
        ) : (
          <SendHorizonal
            className="
              relative
              z-10

              h-4
              w-4
            "
          />
        )}
      </button>
    </div>
  )
}

export default
ChatFooterInput