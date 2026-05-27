import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  EllipsisVertical,
  History,
  Plus,
  Ticket,
  Palette,
  CheckCheck,
  Info,
  Lock,
} from "lucide-react"

import menuBarBackground
  from "../../assets/menubar-background.png"

const MENU_OPTIONS = [
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
    id: "theme",
    label: "Theme Color",
    icon: Palette,
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

const menuTransitionClass = `
  transition-all
  duration-200
`

const ChatMenu = ({
  resolved = false,
  onSelect,
}) => {

  const [open, setOpen] =
    useState(false)

  const menuRef =
    useRef(null)

  /* ========================================
     CLOSE HELPERS
  ======================================== */

  useEffect(() => {

    const handleOutsideClick =
      event => {

        if (
          menuRef.current &&
          !menuRef.current.contains(
            event.target
          )
        ) {

          setOpen(false)
        }
      }

    const handleEscape =
      event => {

        if (
          event.key ===
          "Escape"
        ) {

          setOpen(false)
        }
      }

    window.addEventListener(
      "mousedown",
      handleOutsideClick
    )

    window.addEventListener(
      "keydown",
      handleEscape
    )

    return () => {

      window.removeEventListener(
        "mousedown",
        handleOutsideClick
      )

      window.removeEventListener(
        "keydown",
        handleEscape
      )
    }

  }, [])

  /* ========================================
     SELECT
  ======================================== */

  const handleSelect =
    id => {

      if (
        resolved &&
        id === "resolve"
      ) {

        return
      }

      onSelect?.(id)

      setOpen(false)
    }

  /* ========================================
     OPTIONS
  ======================================== */

  const renderedOptions =
    useMemo(
      () =>
        MENU_OPTIONS.map(
          ({
            id,
            label,
            icon: Icon,
          }) => {

            const isDisabled =
              resolved &&
              id === "resolve"

            const RenderIcon =
              isDisabled
                ? Lock
                : Icon

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
                      ? "cursor-not-allowed opacity-60"
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
                  <RenderIcon
                    className="
                      h-3.5
                      w-3.5

                      text-emerald-950
                    "
                  />
                </div>

                {/* TEXT */}
                <span
                  className="
                    truncate

                    text-[12px]
                    font-medium

                    text-emerald-950
                  "
                >
                  {label}
                </span>

              </button>
            )
          }
        ),

      [resolved]
    )

  return (
    <div
      ref={menuRef}
      className="
        relative
        z-[9999]
      "
    >

      {/* BUTTON */}
      <button
        type="button"
        aria-label="Chat menu"
        onClick={() =>
          setOpen(
            prev => !prev
          )
        }
        className={`
          flex
          h-8
          w-8
          items-center
          justify-center

          rounded-lg

          text-white

          ${menuTransitionClass}

          hover:bg-white/12
          active:scale-95

          ${
            open
              ? "rotate-90 bg-white/14"
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

      {/* DROPDOWN */}
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

          ${menuTransitionClass}

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

        {/* BACKGROUND */}
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

              rounded-2xl

              bg-gradient-to-b
              from-white/20
              via-white/10
              to-white/25

              ring-1
              ring-white/15
            "
          />

        </div>

        {/* HEADER */}
        <div
          className="
            relative
            z-10

            border-b
            border-white/15

            px-3
            py-2
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

        {/* OPTIONS */}
        <div
          className="
            relative
            z-10

            p-1.5
          "
        >
          {renderedOptions}
        </div>

      </div>

    </div>
  )
}

export default ChatMenu