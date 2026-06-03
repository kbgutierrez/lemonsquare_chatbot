import {
  LoaderCircle,
  Lock,
  SendHorizonal,
} from "lucide-react"

import chatWindowBackground
  from "../../../assets/Chatwindow-background.png"

import { useTheme } from "../../context/ThemeContext.jsx"

const MAX_MESSAGE_LENGTH = 100

const ChatFooterInput = ({
  textareaRef,
  message,
  setMessage,
  expandedEditing,
  setExpandedEditing,
  loading,
  resolved,
  sessionTicketSubmitted,
  onKeyDown,
  onSend,
}) => {

  const { theme } = useTheme()

  const canSend =
    !loading &&
    !resolved &&
    !sessionTicketSubmitted &&
    !!message?.trim()

  const handleSend =
    () => canSend && onSend?.()

  return (
    <div
      className="
        relative

        flex
        items-center
        gap-2

        overflow-hidden

        rounded-[22px]

        border

        px-3
        py-2

        shadow-[0_6px_18px_rgba(0,0,0,0.05)]

        backdrop-blur-xl

        transition-all
        duration-300
      "
      style={{
        backgroundColor: theme.inputBg,
        borderColor: theme.inputBorder,
      }}
    >

      {/* BACKGROUND — Lemon Square brand texture only */}
      {theme.id === "lemon-square" && (
        <div
          className="
            pointer-events-none

            absolute
            inset-0

            overflow-hidden
          "
        >

          <img
            src={chatWindowBackground}
            alt=""
            draggable={false}
            className="
              absolute
              inset-0

              h-full
              w-full

              object-cover

              scale-[1.7]

              opacity-[0.18]

              blur-lg
            "
          />

          <div
            className="
              absolute
              inset-0

              bg-[#fffdf9]/55
            "
          />

        </div>
      )}

      {/* INPUT AREA */}
      <div
        className="
          relative
          z-10

          flex-1
        "
      >

        {!expandedEditing ? (

          <input
            ref={textareaRef}

            type="text"

            value={message}

            disabled={
              resolved ||
              sessionTicketSubmitted
            }

            maxLength={
              MAX_MESSAGE_LENGTH
            }

            enterKeyHint="send"

            aria-label="Chat input"

            onKeyDown={onKeyDown}

            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }

            onSelect={(event) => {

              const input =
                event.target

              const cursorPosition =
                input.selectionStart

              const textLength =
                input.value.length

              setExpandedEditing(
                cursorPosition <
                textLength
              )
            }}

            className="
              relative
              z-10

              w-full

              h-[32px]

              bg-transparent

              text-[13px]
              leading-[1.45]

              outline-none

              disabled:cursor-not-allowed
              disabled:opacity-70
            "

            style={{
              color:
                theme.inputText,
            }}
          />

        ) : (

          <textarea
            ref={textareaRef}

            rows={1}

            value={message}

            disabled={
              resolved ||
              sessionTicketSubmitted
            }

            maxLength={
              MAX_MESSAGE_LENGTH
            }

            enterKeyHint="send"

            aria-label="Chat input"

            onKeyDown={onKeyDown}

            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }

            onSelect={(event) => {

              const textarea =
                event.target

              const cursorPosition =
                textarea.selectionStart

              const textLength =
                textarea.value.length

              if (
                cursorPosition ===
                textLength
              ) {

                setExpandedEditing(
                  false
                )
              }
            }}

            className="
              relative
              z-10

              w-full

              max-h-24
              min-h-[28px]

              resize-none

              overflow-y-auto

              bg-transparent

              pt-[2px]

              text-[13px]
              leading-[1.45]

              outline-none

              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden

              disabled:cursor-not-allowed
              disabled:opacity-70
            "

            style={{
              color:
                theme.inputText,
            }}
          />

        )}

      </div>

      {/* SEND BUTTON */}
      <button
        type="button"

        aria-label="Send message"

        disabled={!canSend}

        onClick={handleSend}

        className="
          group
          relative

          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center

          overflow-hidden

          rounded-[18px]

          border

          shadow-[0_8px_18px_rgba(0,0,0,0.12)]

          transition-all
          duration-300

          hover:scale-[1.04]

          active:scale-[0.97]

          disabled:cursor-not-allowed
          disabled:opacity-60
          disabled:hover:scale-100
        "
        style={{
          borderColor: theme.sendButtonBorder,
        }}
      >

        {/* BUTTON BG */}
        <div
          className="
            absolute
            inset-0

            overflow-hidden
          "
        >
          {theme.id === "lemon-square" ? (
            <>
              <img
                src={chatWindowBackground}
                alt=""
                draggable={false}
                className="
                  absolute
                  inset-0

                  h-full
                  w-full

                  object-cover

                  scale-[2.1]

                  opacity-95

                  blur-[2px]
                "
              />

              <div
                className="
                  absolute
                  inset-0

                  bg-[#8ee89a]/42
                "
              />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: theme.sendButtonBg,
              }}
            />
          )}

          <div
            className="
              absolute
              inset-0

              opacity-0

              transition-opacity
              duration-300

              group-hover:opacity-100
            "
            style={{
              backgroundColor: theme.sendButtonHoverBg,
            }}
          />

        </div>

        {/* ICON */}
        {loading ? (
          <LoaderCircle
            className="
              relative
              z-10
              h-4
              w-4

              animate-spin
            "
            style={{
              color: theme.sendButtonIcon,
            }}
          />
        ) : resolved || sessionTicketSubmitted ? (
          <Lock
            className="
              relative
              z-10
              h-4
              w-4
            "
            style={{
              color: theme.sendButtonIcon,
            }}
          />
        ) : (
          <SendHorizonal
            className="
              relative
              z-10
              h-4
              w-4
            "
            style={{
              color: theme.sendButtonIcon,
            }}
          />
        )}

      </button>

    </div>
  )
}

export default ChatFooterInput