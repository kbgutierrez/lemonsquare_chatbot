import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  EllipsisVertical,
  History,
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
     SELECT
  ======================================== */

  const handleSelect =
    (id) => {

      /*
        Prevent duplicate resolve
        on already resolved chats.
      */
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
      className="relative"
    >
      {/* BUTTON */}
      <button
        type="button"

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

          text-violet-700

          transition-all
          duration-300

          hover:scale-110

          ${
            open
              ? "rotate-90"
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
          z-50

          w-64

          origin-top-right

          overflow-hidden

          rounded-2xl

          border
          border-violet-100

          bg-white/95
          backdrop-blur-xl

          shadow-[0_20px_50px_rgba(139,92,246,0.18)]

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
        {/* HEADER */}
        <div
          className="
            border-b
            border-violet-100

            bg-gradient-to-r
            from-violet-50
            to-purple-50

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
          className="p-2"
        >
          {options.map(
            (
              {
                id,
                label,
                icon: Icon,
              },
              index
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

                    rounded-xl

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

                          hover:translate-x-1
                          hover:bg-violet-50
                        `
                    }
                  `}

                  style={{
                    animationDelay:
                      `${index * 40}ms`,
                  }}
                >
                  {/* ICON */}
                  <div
                    className={`
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center

                      rounded-xl

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

                  {/* LABEL */}
                  <div
                    className="
                      flex
                      flex-col
                    "
                  >
                    <span
                      className="
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