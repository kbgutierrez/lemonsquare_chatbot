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
  Palette,
  CheckCheck,
  Info,
  Lock,
} from "lucide-react"

import { useTheme } from "../context/ThemeContext.jsx"

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
  ticketSubmitted = false,
  onSelect,
}) => {

  const [open, setOpen] =
    useState(false)

  const menuRef =
    useRef(null)

  const { theme } = useTheme()

  /* ========================================
     GLOBAL LOCK
  ======================================== */

  const isLocked =
    resolved ||
    ticketSubmitted

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

      /* ---- Prevent resolve on locked chats ---- */

      if (
        isLocked &&
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

            /* ---- Disable resolve if:
               - resolved
               - ticket submitted
            ---- */

            const isDisabled =
              isLocked &&
              id === "resolve"

            const RenderIcon =
              isDisabled
                ? Lock
                : Icon

            /* ---- Dynamic label ---- */

            const finalLabel =
              isDisabled
                ? ticketSubmitted
                  ? "Conversation Locked"
                  : "Conversation Resolved"
                : label

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
                  relative
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
                      : "active:scale-[0.99]"
                  }
                `}
              >

                {/* ICON */}
                <div
                  className="
                    relative
                    z-10

                    flex
                    h-7
                    w-7
                    items-center
                    justify-center

                    rounded-lg
                  "
                  style={{ backgroundColor: theme.menuHoverBg }}
                >
                  <RenderIcon
                    className="
                      h-3.5
                      w-3.5
                    "
                    style={{
                      color: theme.menuText,
                      WebkitTextFillColor:
                        theme.menuText,
                    }}
                  />
                </div>

                {/* TEXT */}
                <span
                  className="
                    relative
                    z-10

                    truncate

                    text-[12px]
                    font-medium
                  "
                  style={{
                    color: theme.menuText,
                    WebkitTextFillColor:
                      theme.menuText,
                  }}
                >
                  {finalLabel}
                </span>

              </button>
            )
          }
        ),

      [
        isLocked,
        ticketSubmitted,
        theme,
      ]
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

          rounded-xl

          ${menuTransitionClass}

          hover:bg-black/5
          active:scale-95

          ${
            open
              ? "rotate-90 bg-black/5"
              : ""
          }
        `}
        style={{
          color: theme.menuText,
          WebkitTextFillColor:
            theme.menuText,
        }}
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

          rounded-xl

          border
          ls-border

          shadow-[0_18px_40px_rgba(16,24,40,0.18)]

          bg-black/[0.03]

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
        style={{
          backgroundColor: theme.menuBg,

          border: "1px solid",
          borderColor:
            "var(--ls-border-color)",

          "--ls-border-color":
            theme.headerBadgeBorder,
        }}
      >

        <div
          className="
            pointer-events-none

            absolute
            inset-0
          "
          style={{
            backgroundColor: theme.menuBg,

            border: "1px solid",
            borderColor:
              "var(--ls-border-color)",

            "--ls-border-color":
              theme.headerBadgeBorder,
          }}
        />

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
            "
            style={{
              color: theme.menuText,
              WebkitTextFillColor:
                theme.menuText,
            }}
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