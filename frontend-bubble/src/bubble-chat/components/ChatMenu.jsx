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

import menuBarBackground
  from "../../assets/menubar-background.png"

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
        z-[9999]
      "
    >

      {/* ====================================
          BUTTON
      ==================================== */}

      <button
        type="button"
        aria-label="Chat menu"
        onClick={() =>
          setOpen(prev => !prev)
        }
        className={`
          flex
          h-8
          w-8
          items-center
          justify-center

          rounded-lg

          text-white

          transition-all
          duration-200

          hover:bg-white/12
          active:scale-95

          ${
            open
              ? "bg-white/14 rotate-90"
              : ""
          }
        `}
      >
        <EllipsisVertical
          className="
            h-4.5
            w-4.5
          "
        />
      </button>

      {/* ====================================
          DROPDOWN
      ==================================== */}

      <div
        className={`
          absolute
          right-1
          top-10

          z-[10000]

          w-[210px]

          origin-top-right

          overflow-hidden

          rounded-2xl

          border
          border-emerald-200/60

          bg-white/12

          shadow-[0_18px_40px_rgba(16,24,40,0.18)]

          backdrop-blur-md

          transition-all
          duration-200

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
                scale-[0.97]
                opacity-0
              `
          }
        `}
      >

        {/* ====================================
            BACKGROUND IMAGE (SOFTENED)
        ==================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
          "
        >

          <img
            src={menuBarBackground}
            alt=""
            draggable={false}
            className="
              absolute
              left-1/2
              top-1/2
              h-[115%]
              w-[115%]
              -translate-x-1/2
              -translate-y-1/2
              object-cover
              opacity-[0.85]
              blur-[0.6px]
            "
          />

          <div
            className="
              absolute
              inset-0

              bg-gradient-to-b
              from-white/20
              via-white/10
              to-white/25
            "
          />

          <div
            className="
              absolute
              inset-0
              ring-1
              ring-white/15
              rounded-2xl
            "
          />

        </div>

        {/* ====================================
            HEADER (SIMPLIFIED)
        ==================================== */}

        <div
          className="
            relative
            z-10

            px-3
            py-2

            border-b
            border-white/15
          "
        >

          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-emerald-950
            "
          >
            Chat Options
          </p>

        </div>

        {/* ====================================
            OPTIONS
        ==================================== */}

        <div
          className="
            relative
            z-10
            p-1.5
          "
        >

          {options.map(
            ({
              id,
              label,
              icon: Icon,
            }) => {

              const isDisabled =
                resolved && id === "resolve"

              return (
                <button
                  key={id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelect(id)}
                  className={`
                    group
                    mb-1

                    flex
                    w-full
                    items-center
                    gap-2.5

                    rounded-xl

                    px-2.5
                    py-2

                    text-left

                    transition-all
                    duration-150

                    ${
                      isDisabled
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-white/20 active:scale-[0.99]"
                    }
                  `}
                >

                  {/* ICON */}

                  <div
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-lg
                      bg-white/15
                    "
                  >
                    {isDisabled ? (
                      <Lock className="h-3.5 w-3.5 text-emerald-950" />
                    ) : (
                      <Icon className="h-3.5 w-3.5 text-emerald-950" />
                    )}
                  </div>

                  {/* TEXT */}

                  <span
                    className="
                      text-[12px]
                      font-medium
                      text-emerald-950
                      truncate
                    "
                  >
                    {label}
                  </span>

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