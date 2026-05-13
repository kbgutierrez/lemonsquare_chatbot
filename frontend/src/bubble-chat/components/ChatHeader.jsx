import {
  CheckCircle2,
  Lock,
} from "lucide-react"

import ChatMenu from "./ChatMenu.jsx"

const ChatHeader = ({
  resolved = false,
  onClose,
  onOpenModal,
}) => {

  return (
    <div
      className="
        flex
        items-center
        justify-between

        border-b
        border-violet-200

        bg-gradient-to-r
        from-violet-600
        to-purple-500

        px-4
        py-3

        text-white
      "
    >

      {/* LEFT */}
      <div className="min-w-0">

        <p
          className="
            text-[10px]
            uppercase
            tracking-[0.22em]
            text-violet-100
          "
        >
          Help Desk AI
        </p>

        <div className="mt-1 flex items-center gap-2">

          {/* STATUS ICON */}
          {resolved ? (
            <Lock
              className="
                h-3.5
                w-3.5
                shrink-0

                text-emerald-200
              "
            />
          ) : (
            <div
              className="
                h-2
                w-2
                rounded-full
                bg-emerald-300
              "
            />
          )}

          {/* TITLE */}
          <h2
            className="
              truncate
              text-sm
              font-semibold
            "
          >
            {resolved
              ? "Resolved Conversation"
              : "Virtual Support Assistant"}
          </h2>

          {/* RESOLVED BADGE */}
          {resolved && (
            <span
              className="
                flex
                items-center
                gap-1

                rounded-full

                bg-emerald-400/20

                px-2
                py-0.5

                text-[9px]
                font-semibold
                uppercase
                tracking-[0.08em]

                text-emerald-100
              "
            >
              <CheckCircle2
                className="
                  h-3
                  w-3
                "
              />

              Resolved
            </span>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">

        {/* MENU */}
        <ChatMenu
          resolved={
            resolved
          }

          onSelect={
            onOpenModal
          }
        />

        {/* CLOSE */}
        <button
          type="button"

          onClick={
            onClose
          }

          className="
            flex
            h-10
            w-10
            items-center
            justify-center

            rounded-xl

            bg-white/10

            transition-all
            duration-200

            hover:bg-white/20
          "
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default ChatHeader