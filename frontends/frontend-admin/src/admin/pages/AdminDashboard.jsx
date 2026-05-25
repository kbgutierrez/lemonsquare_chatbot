import { useEffect, useState } from "react"

import SidebarMenu from "../components/SidebarMenu.jsx"
import MobileSidebar from "../components/MobileSidebar.jsx"
import LoginPage from "./LoginPage.jsx"
import AdminLayout from "../layouts/AdminLayout.jsx"

import { adminSections } from "../constants/adminSections"

import {
  getCachedData,
  setCachedData,
} from "../../shared/cache/liveQueryCache"

const DASHBOARD_UI_CACHE_KEY = "admin_dashboard_ui"

const AdminDashboard = () => {
  /* ========================================
     CACHE HYDRATION
  ======================================== */
  const cachedUI = getCachedData(DASHBOARD_UI_CACHE_KEY) ?? {}

  /* ========================================
     AUTH STATE
  ======================================== */
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [adminUser, setAdminUser] = useState(null)

  /* ========================================
     UI STATE
  ======================================== */
  const [activeView, setActiveView] = useState(
    cachedUI.activeView || "upload"
  )

  const [sidebarWidth, setSidebarWidth] = useState(
    cachedUI.sidebarWidth || 280
  )

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(
    cachedUI.mobileSidebarOpen || false
  )

  const [isResizing, setIsResizing] = useState(false)

  /* ========================================
     PERSIST UI STATE
  ======================================== */
  useEffect(() => {
    setCachedData(DASHBOARD_UI_CACHE_KEY, {
      activeView,
      sidebarWidth,
      mobileSidebarOpen,
    })
  }, [activeView, sidebarWidth, mobileSidebarOpen])

  /* ========================================
     AUTH CHECK
  ======================================== */
  useEffect(() => {
    const auth = localStorage.getItem("admin_auth")
    const storedUser = localStorage.getItem("admin_user")

    if (auth !== "true") return

    setIsAuthenticated(true)

    if (!storedUser) return

    try {
      setAdminUser(JSON.parse(storedUser))
    } catch {
      localStorage.removeItem("admin_user")
    }
  }, [])

  /* ========================================
     AUTH HANDLERS
  ======================================== */
  const handleLogin = (userData) => {
    setAdminUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_auth")
    localStorage.removeItem("admin_user")
    localStorage.removeItem("admin_user_token")

    setAdminUser(null)
    setIsAuthenticated(false)
  }

  /* ========================================
     SIDEBAR RESIZE
  ======================================== */
  useEffect(() => {
    if (!isResizing) return

    const handleMove = (event) => {
      const width = event.clientX

      if (width >= 240 && width <= 420) {
        setSidebarWidth(width)
      }
    }

    const handleUp = () => setIsResizing(false)

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleUp)

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }
  }, [isResizing])

  /* ========================================
     LOGIN GATE
  ======================================== */
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  const ActiveSection = adminSections[activeView] || null

  return (
    <AdminLayout>
      {/* MOBILE SIDEBAR */}
      <MobileSidebar
        open={mobileSidebarOpen}
        setOpen={setMobileSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        adminUser={adminUser}
        onLogout={handleLogout}
      />

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
          style={{ width: `${sidebarWidth}px` }}
          className="
            hidden
            shrink-0
            overflow-hidden
            lg:flex
          "
        >
          <SidebarMenu
            activeView={activeView}
            setActiveView={setActiveView}
            adminUser={adminUser}
            onLogout={handleLogout}
          />
        </aside>

        {/* RESIZER */}
        <div
          onMouseDown={() => setIsResizing(true)}
          className="
            group
            hidden
            w-1
            cursor-col-resize
            rounded-full
            transition-all
            duration-200
            lg:block
          "
          style={{
            background: "transparent",
          }}
        >
          <div
            className="
              h-full
              w-full
              rounded-full
              transition-all
              duration-200
            "
            style={{
              background: "rgba(245, 213, 71, 0.15)",
            }}
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
            backdrop-blur-xl
          "
          style={{
            border: "1px solid var(--border)",
            background: "var(--glass-bg)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* INNER EFFECTS */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background: "var(--glass-border)",
              }}
            />

            <div
              className="
                absolute
                right-0
                top-0
                h-72
                w-72
                rounded-full
                blur-3xl
              "
              style={{
                background: "var(--bg-glow-primary)",
              }}
            />
          </div>

          {/* CONTENT WRAPPER */}
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
            {/* MOBILE HEADER SPACING */}
            <div className="h-14 shrink-0 lg:hidden" />

            {/* ACTIVE VIEW */}
            <div className="min-h-0 flex-1 overflow-hidden">
              {ActiveSection && <ActiveSection />}
            </div>
          </div>
        </main>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard