// frontends/frontend-bubble/src/bubble-chat/components/ChatHeader.jsx
import {
  CheckCircle2,
  Lock,
} from "lucide-react"

import ChatMenu from "./ChatMenu.jsx"

import { useTheme } from "../context/ThemeContext.jsx"

const resolvedBadgeClass = `
  flex
  items-center
  gap-1

  rounded-full

  border

  px-1.5
  py-[2px]

  text-[8px]
  font-semibold
  uppercase

  tracking-[0.06em]

  backdrop-blur-sm
`

const ChatHeader = ({
  aiName = "Cheesecake AI",

  resolved = false,
  ticketSubmitted = false,
  onOpenModal,
}) => {

  const { theme } = useTheme()

  const title =
    ticketSubmitted
      ? "Ticket Submitted"
      : resolved
        ? "Resolved Conversation"
        : aiName

  return (
    <header
      className="
        relative

        flex
        items-center
        justify-between

        border-b

        px-4
        py-3
      "
      style={{
        background: theme.headerGradient,
        borderColor: theme.headerBorder,
        color: theme.headerText,
      }}
    >

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
              "
              style={{
                backgroundColor: theme.statusOnline,
                boxShadow: `0 0 8px ${theme.statusOnline}`,
              }}
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
              style={{
                backgroundColor: theme.headerBadgeBg,
                color: theme.headerBadgeText,
                borderColor: theme.headerBadgeBorder,
              }}
            >
              <CheckCircle2
                className="
                  h-2.5
                  w-2.5
                "
              />

            {ticketSubmitted
              ? "Ticket Submitted"
              : "Resolved"}
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
            rounded-[12px]

            border

            shadow-sm

            backdrop-blur-md
          "
          style={{
            backgroundColor: theme.menuBg,
            borderColor: theme.headerBadgeBorder,
          }}
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