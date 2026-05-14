import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  EllipsisVertical,
  History,
  MessageSquare,
  Plus,
  Ticket,
  Phone,
  CheckCheck,
  Info,
  Lock,
} from "lucide-react"

const options = [
  {
    id: "history",
    label: "Chat History",
    icon: History,
  },

  {
    id: "new-chat",
    label: "New Chat",
    icon: Plus,
  },

  {
    id: "ticket",
    label: "Submit Ticket",
    icon: Ticket,
  },

  {
    id: "call",
    label: "Call Agent",
    icon: Phone,
  },

  {
    id: "resolve",
    label: "Resolve Conversation",
    icon: CheckCheck,
  },

  {
    id: "about",
    label: "About Help Desk AI",
    icon: Info,
  },
]

const ChatMenu = ({
  resolved = false,
  onSelect,
}) => {

  const [open, setOpen] =
    useState(false)

  const menuRef =
    useRef(null)

  /* ========================================
     OUTSIDE CLICK
  ======================================== */

  useEffect(() => {

    const handleOutsideClick =
      (event) => {

        if (
          menuRef.current &&
          !menuRef.current.contains(
            event.target
          )
        ) {

          setOpen(false)
        }
      }

    window.addEventListener(
      "mousedown",
      handleOutsideClick
    )

    return () =>
      window.removeEventListener(
        "mousedown",
        handleOutsideClick
      )

  }, [])

  /* ========================================
     ESC CLOSE
  ======================================== */

  useEffect(() => {

    const handleEscape =
      (event) => {

        if (
          event.key === "Escape"
        ) {

          setOpen(false)
        }
      }

    window.addEventListener(
      "keydown",
      handleEscape
    )

    return () =>
      window.removeEventListener(
        "keydown",
        handleEscape
      )

  }, [])

  /* ========================================
     SELECT
  ======================================== */

  const handleSelect =
    (id) => {

      if (
        resolved &&
        id === "resolve"
      ) {

        return
      }

      onSelect?.(id)

      setOpen(false)
    }

  return (
    <div
      ref={menuRef}
      className="
        relative
        z-[200]
      "
    >
      {/* BUTTON */}
      <button
        type="button"

        aria-label="Chat menu"

        onClick={() =>
          setOpen(
            (prev) => !prev
          )
        }

        className={`
          flex
          h-10
          w-10
          items-center
          justify-center

          rounded-xl

          text-violet-700

          transition-all
          duration-300

          hover:bg-violet-100/70
          hover:scale-105

          active:scale-95

          ${
            open
              ? `
                rotate-90

                bg-violet-100
              `
              : ""
          }
        `}
      >
        <EllipsisVertical
          className="
            h-5
            w-5
          "
        />
      </button>

      {/* DROPDOWN */}
      <div
        className={`
          absolute
          right-0
          top-12

          z-[250]

          w-72
          max-w-[calc(100vw-24px)]

          origin-top-right

          overflow-hidden

          rounded-[24px]

          border
          border-violet-100/80

          bg-white/95

          shadow-[0_25px_70px_rgba(139,92,246,0.22)]

          backdrop-blur-2xl

          transition-all
          duration-300
          ease-out

          ${
            open
              ? `
                pointer-events-auto

                translate-y-0
                scale-100
                opacity-100
              `
              : `
                pointer-events-none

                -translate-y-2
                scale-95
                opacity-0
              `
          }
        `}
      >
        {/* BACKGROUND GLOW */}
        <div
          className="
            pointer-events-none

            absolute
            inset-0

            overflow-hidden
          "
        >
          <div
            className="
              absolute
              right-[-40px]
              top-[-40px]

              h-36
              w-36

              rounded-full

              bg-violet-200/20

              blur-3xl
            "
          />
        </div>

        {/* HEADER */}
        <div
          className="
            relative
            z-10

            border-b
            border-violet-100/80

            bg-gradient-to-r
            from-violet-50/90
            to-purple-50/70

            px-4
            py-3
          "
        >
          <p
            className="
              text-[10px]
              font-semibold
              uppercase

              tracking-[0.22em]

              text-violet-600
            "
          >
            Chat Options
          </p>
        </div>

        {/* OPTIONS */}
        <div
          className="
            relative
            z-10

            p-2
          "
        >
          {options.map(
            (
              {
                id,
                label,
                icon: Icon,
              }
            ) => {

              const isResolveOption =
                id === "resolve"

              const isDisabled =
                resolved &&
                isResolveOption

              return (
                <button
                  key={id}

                  type="button"

                  disabled={
                    isDisabled
                  }

                  onClick={() =>
                    handleSelect(id)
                  }

                  className={`
                    group

                    flex
                    w-full
                    items-center
                    gap-3

                    rounded-2xl

                    px-3
                    py-3

                    text-left
                    text-sm

                    transition-all
                    duration-200

                    ${
                      isDisabled
                        ? `
                          cursor-not-allowed
                          opacity-60
                        `
                        : `
                          text-slate-700

                          hover:bg-violet-50
                          hover:translate-x-1
                        `
                    }
                  `}
                >
                  {/* ICON */}
                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center

                      rounded-2xl

                      transition-all
                      duration-200

                      ${
                        isDisabled
                          ? `
                            bg-emerald-100
                          `
                          : `
                            bg-violet-100

                            group-hover:bg-violet-200
                          `
                      }
                    `}
                  >
                    {isDisabled ? (
                      <Lock
                        className="
                          h-4
                          w-4

                          text-emerald-700
                        "
                      />
                    ) : (
                      <Icon
                        className="
                          h-4
                          w-4

                          text-violet-700
                        "
                      />
                    )}
                  </div>

                  {/* TEXT */}
                  <div
                    className="
                      flex
                      min-w-0
                      flex-col
                    "
                  >
                    <span
                      className="
                        truncate

                        font-medium
                      "
                    >
                      {label}
                    </span>

                    {isDisabled && (
                      <span
                        className="
                          text-[10px]

                          text-emerald-600
                        "
                      >
                        Already resolved
                      </span>
                    )}
                  </div>
                </button>
              )
            }
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMenu