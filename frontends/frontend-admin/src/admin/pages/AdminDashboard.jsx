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
          overflow-hidden
        "
      >
        {/* LEFT SPACING */}
        <div className="hidden lg:block w-0" />

        {/* DESKTOP SIDEBAR */}
        <aside
          className="
            hidden
            h-full
            shrink-0
            overflow-hidden
            lg:flex
          "
          style={{
            width: `${sidebarWidth}px`,
          }}
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
            h-full
            w-[8px]
            cursor-col-resize
            transition-all
            duration-200
            lg:block
          "
        >
          <div
            className="
              mx-auto
              h-full
              w-[2px]
              transition-all
              duration-200
              group-hover:bg-yellow-400/40
            "
            style={{
              background:
                "rgba(255,255,255,0.05)",
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
            px-4
            py-4
            lg:pr-5
          "
        >
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

        {/* RIGHT SPACING */}
        <div
          className="
            hidden
            lg:block
          "
          style={{
            width: "16px",
          }}
        />
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard