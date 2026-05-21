import {
  CheckCircle2,
  Lock,
} from "lucide-react"

import ChatMenu from "./ChatMenu.jsx"

const resolvedBadgeClass = `
  flex
  items-center
  gap-1

  rounded-full

  border
  border-white/20

  bg-white/15

  px-1.5
  py-[2px]

  text-[8px]
  font-semibold
  uppercase

  tracking-[0.06em]

  text-white

  backdrop-blur-sm
`

const ChatHeader = ({
  resolved = false,
  onOpenModal,
}) => {

  const title =
    resolved
      ? "Resolved Conversation"
      : "AI Assistance"

  return (
    <header
      className="
        relative

        flex
        items-center
        justify-between

        border-b
        border-emerald-200/60

        bg-[#7BE38E]

        px-4
        py-3

        text-white
      "
    >

      {/* SOFT OVERLAY */}
      <div
        className="
          pointer-events-none

          absolute
          inset-0

          bg-white/[0.04]
        "
      />

      {/* LEFT */}
      <div
        className="
          relative
          z-10

          min-w-0

          pl-1
        "
      >

        {/* TITLE ROW */}
        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          {/* STATUS */}
          {resolved ? (
            <Lock
              className="
                h-3.5
                w-3.5
                shrink-0
              "
            />
          ) : (
            <div
              className="
                h-2.5
                w-2.5

                rounded-full

                bg-white

                shadow-[0_0_8px_rgba(255,255,255,0.75)]
              "
            />
          )}

          {/* TITLE */}
          <h2
            className="
              truncate

              text-[15px]
              font-extrabold

              tracking-[0.01em]

              drop-shadow-[0_1px_2px_rgba(0,0,0,0.18)]
            "
          >
            {title}
          </h2>

          {/* BADGE */}
          {resolved && (
            <span
              className={
                resolvedBadgeClass
              }
            >
              <CheckCircle2
                className="
                  h-2.5
                  w-2.5
                "
              />

              Resolved
            </span>
          )}

        </div>

      </div>

      {/* RIGHT */}
      <div
        className="
          relative
          z-[9999]

          flex
          items-center
        "
      >

        {/* MENU */}
        <div
          className="
            rounded-xl

            border
            border-white/20

            bg-white/15

            shadow-sm

            backdrop-blur-md
          "
        >
          <ChatMenu
            resolved={resolved}
            onSelect={onOpenModal}
          />
        </div>

      </div>

    </header>
  )
}

export default ChatHeader