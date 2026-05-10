import {
  MessageCircleMore,
  X
} from 'lucide-react'

const ChatBubble = ({
  isOpen,
  expandDirection
}) => {
  const expandRight =
    expandDirection === 'right'

  return (
    <div
      className={`
        relative
        h-16

        ${
          isOpen
            ? 'w-56'
            : 'w-16'
        }
      `}
    >

      <button
        type="button"
        className={`
          absolute
          top-0

          h-16

          overflow-hidden

          rounded-full

          bg-gradient-to-r
          from-violet-600
          to-purple-500

          text-white

          shadow-2xl

          transition-all
          duration-300

          hover:scale-[1.03]

          ${
            isOpen
              ? 'w-56'
              : 'w-16'
          }

          ${
            expandRight
              ? 'left-0'
              : 'right-0'
          }
        `}
      >

        {/* LEFT SCREEN -> EXPAND RIGHT */}
        {expandRight && (
          <>
            {/* ICON */}
            <div
              className="
                absolute
                left-5
                top-1/2
                -translate-y-1/2
                z-10
              "
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <MessageCircleMore className="h-6 w-6" />
              )}
            </div>

            {/* TEXT */}
            {isOpen && (
              <div
                className="
                  absolute
                  left-14
                  top-1/2
                  -translate-y-1/2

                  whitespace-nowrap
                  text-left
                "
              >
                <p className="text-sm font-semibold">
                  Help Desk AI
                </p>

                <p className="text-xs text-violet-100">
                  Virtual Assistant
                </p>
              </div>
            )}
          </>
        )}

        {/* RIGHT SCREEN -> EXPAND LEFT */}
        {!expandRight && (
          <>
            {/* TEXT */}
            {isOpen && (
              <div
                className="
                  absolute
                  right-14
                  top-1/2
                  -translate-y-1/2

                  whitespace-nowrap
                  text-right
                "
              >
                <p className="text-sm font-semibold">
                  Help Desk AI
                </p>

                <p className="text-xs text-violet-100">
                  Virtual Assistant
                </p>
              </div>
            )}

            {/* ICON */}
            <div
              className="
                absolute
                right-5
                top-1/2
                -translate-y-1/2
                z-10
              "
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <MessageCircleMore className="h-6 w-6" />
              )}
            </div>
          </>
        )}

        {/* CLOSED STATE */}
        {!isOpen && (
          <div
            className="
              absolute
              inset-0

              flex
              items-center
              justify-center
            "
          >
            <MessageCircleMore className="h-6 w-6" />
          </div>
        )}
      </button>
    </div>
  )
}

export default ChatBubble