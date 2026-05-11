import {
  useEffect,
  useState,
} from "react"

import HeaderCard from "./components/HeaderCard.jsx"
import SidebarMenu from "./components/SidebarMenu.jsx"

import AIModelDropdown from "./components/AIModelDropdown.jsx"
import AISettingsPanel from "./components/AISettingsPanel.jsx"

import UploadSection from "./components/UploadSection.jsx"
import KnowledgeFilesSection from "./components/KnowledgeFilesSection.jsx"
import TicketsSection from "./components/TicketsSection.jsx"

const sidebarItems = [
  {
    id: "upload",
    label: "Upload",
  },

  {
    id: "files",
    label:
      "Knowledge Files",
  },

  {
    id: "tickets",
    label:
      "Tickets",
  },

  {
    id: "ai",
    label:
      "AI Configuration",
  },
]

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
          width <= 500
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
        flex
        h-screen
        flex-col

        overflow-hidden

        bg-gradient-to-br
        from-violet-50
        via-purple-50
        to-fuchsia-50
      "
    >
      {/* HEADER */}
      <HeaderCard />

      {/* BODY */}
      <div
        className="
          flex
          flex-1

          overflow-hidden

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
            flex
            flex-col
            gap-4

            overflow-hidden
          "
        >
          <SidebarMenu
            activeView={
              activeView
            }

            setActiveView={
              setActiveView
            }

            items={
              sidebarItems
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

            mx-2

            hidden
            w-1

            cursor-col-resize

            rounded-full

            bg-transparent

            transition-all
            duration-200

            hover:bg-violet-300

            lg:block
          "
        >
          <div
            className="
              h-full
              w-full

              rounded-full

              group-hover:bg-violet-400
            "
          />
        </div>

        {/* CONTENT */}
        <main
          className="
            flex-1

            overflow-hidden

            rounded-3xl

            border
            border-violet-100

            bg-white/80

            p-4

            shadow-sm
            backdrop-blur-sm
          "
        >
          <div
            className="
              flex
              h-full
              flex-col
              gap-4

              overflow-auto

              pr-1

              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {/* UPLOAD */}
            {activeView ===
              "upload" && (
              <UploadSection />
            )}

            {/* KNOWLEDGE FILES */}
            {activeView ===
              "files" && (
              <KnowledgeFilesSection />
            )}

            {/* TICKETS */}
            {activeView ===
              "tickets" && (
              <TicketsSection />
            )}

            {/* AI */}
            {activeView ===
              "ai" && (
              <>
                <AIModelDropdown />

                <AISettingsPanel />
              </>
            )}
          </div>
        </main>
      </div>
    </section>
  )
}

export default AdminPage