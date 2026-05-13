import {
  useEffect,
  useState,
} from "react"

import SidebarMenu from "./components/SidebarMenu.jsx"

import AISettingsPanel
  from "./components/settings/AISettingsPanel.jsx"

import UploadSection
  from "./components/upload/UploadSection.jsx"

import KnowledgeFilesSection
  from "./components/Knowledge FIles/KnowledgeFilesSection.jsx"

import TicketsSection
  from "./components/tickets/TicketsSection.jsx"

import ResolvedChatsSection
  from "./components/resolved-chats/ResolvedChatsSection.jsx"

import ManualEntriesSection
  from "./components/manual-entries/ManualEntriesSection.jsx"

const AdminPage = () => {

  const [activeView, setActiveView] =
    useState("upload")

  const [sidebarWidth, setSidebarWidth] =
    useState(280)

  const [isResizing, setIsResizing] =
    useState(false)

  /* RESIZE SIDEBAR */
  useEffect(() => {

    const handleMove =
      (event) => {

        if (!isResizing)
          return

        const width =
          event.clientX

        if (
          width >= 240 &&
          width <= 420
        ) {

          setSidebarWidth(
            width
          )
        }
      }

    const handleUp =
      () =>
        setIsResizing(
          false
        )

    window.addEventListener(
      "mousemove",
      handleMove
    )

    window.addEventListener(
      "mouseup",
      handleUp
    )

    return () => {

      window.removeEventListener(
        "mousemove",
        handleMove
      )

      window.removeEventListener(
        "mouseup",
        handleUp
      )
    }

  }, [isResizing])

  return (
    <section
      className="
        relative

        flex
        h-screen
        overflow-hidden

        bg-[#0b1311]
      "
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
        <div
          className="
            absolute
            left-[-120px]
            top-[-120px]

            h-[420px]
            w-[420px]

            rounded-full

            bg-[#f5d547]/[0.04]

            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-[-180px]
            right-[-140px]

            h-[420px]
            w-[420px]

            rounded-full

            bg-[#95c11f]/[0.05]

            blur-3xl
          "
        />

        <div
          className="
            absolute
            inset-0

            opacity-[0.03]
          "
          style={{
            backgroundImage:
              `
                linear-gradient(
                  rgba(255,255,255,0.05) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(255,255,255,0.05) 1px,
                  transparent 1px
                )
              `,
            backgroundSize:
              "40px 40px",
          }}
        />
      </div>

      {/* MAIN LAYOUT */}
      <div
        className="
          relative
          z-10

          flex
          h-full
          min-h-0
          w-full

          gap-4

          p-4
        "
      >
        {/* SIDEBAR */}
        <aside
          style={{
            width:
              `${sidebarWidth}px`,
          }}
          className="
            hidden
            shrink-0

            overflow-hidden

            lg:flex
          "
        >
          <SidebarMenu
            activeView={
              activeView
            }

            setActiveView={
              setActiveView
            }
          />
        </aside>

        {/* RESIZER */}
        <div
          onMouseDown={() =>
            setIsResizing(
              true
            )
          }
          className="
            group

            hidden
            w-1

            cursor-col-resize

            rounded-full

            bg-transparent

            transition-all
            duration-200

            hover:bg-[#f5d547]/30

            lg:block
          "
        >
          <div
            className="
              h-full
              w-full

              rounded-full

              group-hover:bg-[#f5d547]/40
            "
          />
        </div>

        {/* CONTENT */}
        <main
          className="
            relative

            flex
            min-h-0
            flex-1
            flex-col

            overflow-hidden

            rounded-[32px]

            border
            border-[#25332d]

            bg-[#101816]/95

            shadow-[0_20px_80px_rgba(0,0,0,0.45)]

            backdrop-blur-xl
          "
        >
          {/* INNER LIGHT */}
          <div
            className="
              pointer-events-none

              absolute
              inset-0
            "
          >
            <div
              className="
                absolute
                inset-x-0
                top-0

                h-px

                bg-white/5
              "
            />

            <div
              className="
                absolute
                right-0
                top-0

                h-72
                w-72

                rounded-full

                bg-[#f5d547]/[0.03]

                blur-3xl
              "
            />
          </div>

          {/* CONTENT SCROLL */}
          <div
            className="
              relative
              z-10

              flex
              min-h-0
              flex-1
              flex-col

              overflow-hidden

              p-5
            "
          >
            {/* MOBILE TOPBAR */}
            <div
              className="
                mb-5

                flex
                shrink-0
                items-center
                justify-between

                lg:hidden
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center

                    rounded-2xl

                    bg-[#f5d547]
                  "
                >
                  <span
                    className="
                      text-sm
                      font-black

                      text-[#111917]
                    "
                  >
                    LS
                  </span>
                </div>

                <div>
                  <h2
                    className="
                      text-sm
                      font-bold
                      text-white
                    "
                  >
                    Lemon Square
                  </h2>

                  <p
                    className="
                      text-xs
                      text-[#8ea59b]
                    "
                  >
                    Admin Panel
                  </p>
                </div>
              </div>
            </div>

            {/* ACTIVE VIEW */}
            <div
              className="
                min-h-0
                flex-1
                overflow-hidden
              "
            >
              {activeView ===
                "upload" && (
                <UploadSection />
              )}

              {activeView ===
                "files" && (
                <KnowledgeFilesSection />
              )}

              {activeView ===
                "resolved_chats" && (
                <ResolvedChatsSection />
              )}

              {activeView ===
                "manual_entries" && (
                <ManualEntriesSection />
              )}

              {activeView ===
                "tickets" && (
                <TicketsSection />
              )}

              {activeView ===
                "ai" && (
                <div
                  className="
                    h-full
                    overflow-auto
                  "
                >
                  <AISettingsPanel />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </section>
  )
}

export default AdminPage