// FILE: frontend/src/admin/AdminPage.jsx

import {
  useEffect,
  useState,
} from "react"

import SidebarMenu
  from "./components/SidebarMenu.jsx"

import MobileSidebar
  from "./components/MobileSidebar.jsx"

import LoginPage
  from "./LoginPage.jsx"

import AISettingsPanel
  from "./components/settings/AISettingsPanel.jsx"

import UploadSection
  from "./components/upload/UploadSection.jsx"

import KnowledgeFilesSection
  from "./components/KnowledgeFiles/KnowledgeFilesSection.jsx"

import TicketsSection
  from "./components/tickets/TicketsSection.jsx"

import ResolvedChatsSection
  from "./components/resolved-chats/ResolvedChatsSection.jsx"

import ManualEntriesSection
  from "./components/manual-entries/ManualEntriesSection.jsx"

import PipelineDebugSection
  from "./components/pipeline-debug/PipelineDebugSection.jsx"

const AdminPage = () => {

  /* ========================================
     AUTH
  ======================================== */

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false)

  /* ========================================
     UI STATE
  ======================================== */

  const [
    activeView,
    setActiveView,
  ] = useState("upload")

  const [
    sidebarWidth,
    setSidebarWidth,
  ] = useState(280)

  const [
    isResizing,
    setIsResizing,
  ] = useState(false)

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false)

  /* ========================================
     CHECK AUTH
  ======================================== */

  useEffect(() => {

    const auth =
      localStorage.getItem(
        "admin_auth"
      )

    if (auth === "true") {

      setIsAuthenticated(
        true
      )
    }

  }, [])

  /* ========================================
     LOGIN
  ======================================== */

  const handleLogin =
    () => {

      setIsAuthenticated(
        true
      )
    }

  /* ========================================
     LOGOUT
  ======================================== */

  const handleLogout =
    () => {

      localStorage.removeItem(
        "admin_auth"
      )

      setIsAuthenticated(
        false
      )
    }

  /* ========================================
     RESIZE SIDEBAR
  ======================================== */

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

  /* ========================================
     LOGIN SCREEN
  ======================================== */

  if (!isAuthenticated) {

    return (
      <LoginPage
        onLogin={
          handleLogin
        }
      />
    )
  }

  return (
    <section
      className="
        relative

        flex

        h-[100dvh]
        min-h-[100dvh]

        overflow-hidden

        bg-[#0b1311]
      "
    >
      {/* MOBILE SIDEBAR */}
      <MobileSidebar
        open={mobileSidebarOpen}

        setOpen={
          setMobileSidebarOpen
        }

        activeView={
          activeView
        }

        setActiveView={
          setActiveView
        }
      />

      {/* BACKGROUND */}
      <div
        className="
          pointer-events-none

          absolute
          inset-0

          overflow-hidden
        "
      >
        {/* TOP LIGHT */}
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

        {/* BOTTOM LIGHT */}
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

          p-2
          sm:p-3
          md:p-4
        "
      >
        {/* DESKTOP SIDEBAR */}
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

            onLogout={
              handleLogout
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

            rounded-[24px]
            md:rounded-[32px]

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

          {/* CONTENT */}
          <div
            className="
              relative
              z-10

              flex
              min-h-0
              flex-1
              flex-col

              overflow-hidden

              p-3
              sm:p-4
              md:p-5
            "
          >
            {/* MOBILE HEADER SPACE */}
            <div className="h-14 shrink-0 lg:hidden" />

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
                "pipeline_debug" && (
                <PipelineDebugSection />
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