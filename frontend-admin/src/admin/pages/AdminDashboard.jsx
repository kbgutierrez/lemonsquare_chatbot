import {
  useEffect,
  useMemo,
  useState,
} from "react"

import SidebarMenu
  from "../components/SidebarMenu.jsx"

import MobileSidebar
  from "../components/MobileSidebar.jsx"

import LoginPage
  from "./LoginPage.jsx"

import AdminLayout
  from "../layouts/AdminLayout.jsx"

import {
  adminSections,
} from "../constants/adminSections"

import {
  getCachedData,
  setCachedData,
} from "../../shared/cache/liveQueryCache"

const DASHBOARD_UI_CACHE_KEY =
  "admin_dashboard_ui"

const AdminDashboard = () => {

  /* ========================================
     CACHE HYDRATION
  ======================================== */

  const cachedUI =
    getCachedData(
      DASHBOARD_UI_CACHE_KEY
    ) || {}

  /* ========================================
     AUTH
  ======================================== */

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false)

  const [
    adminUser,
    setAdminUser,
  ] = useState(null)

  /* ========================================
     UI STATE
  ======================================== */

  const [
    activeView,
    setActiveView,
  ] = useState(
    cachedUI.activeView ||
    "upload"
  )

  const [
    sidebarWidth,
    setSidebarWidth,
  ] = useState(
    cachedUI.sidebarWidth ||
    280
  )

  const [
    isResizing,
    setIsResizing,
  ] = useState(false)

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(
    cachedUI.mobileSidebarOpen ||
    false
  )

  /* ========================================
     PERSIST UI STATE
  ======================================== */

  useEffect(() => {

    setCachedData(
      DASHBOARD_UI_CACHE_KEY,
      {
        activeView,
        sidebarWidth,
        mobileSidebarOpen,
      }
    )

  }, [
    activeView,
    sidebarWidth,
    mobileSidebarOpen,
  ])

  /* ========================================
     ACTIVE COMPONENT
  ======================================== */

  const ActiveSection =
    useMemo(() => {

      return (
        adminSections[
          activeView
        ] ||
        null
      )

    }, [activeView])

  /* ========================================
     CHECK AUTH
  ======================================== */

  useEffect(() => {

    const auth =
      localStorage.getItem(
        "admin_auth"
      )

    const storedUser =
      localStorage.getItem(
        "admin_user"
      )

    if (auth === "true") {

      setIsAuthenticated(
        true
      )

      if (storedUser) {

        try {

          setAdminUser(
            JSON.parse(
              storedUser
            )
          )

        } catch {

          localStorage.removeItem(
            "admin_user"
          )
        }
      }
    }

  }, [])

  /* ========================================
     LOGIN
  ======================================== */

  const handleLogin =
    (userData) => {

      setAdminUser(
        userData
      )

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

      localStorage.removeItem(
        "admin_user"
      )

      localStorage.removeItem(
        "admin_user_token"
      )

      setAdminUser(null)

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
    <AdminLayout>
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

        adminUser={
          adminUser
        }

        onLogout={
          handleLogout
        }
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

            adminUser={
              adminUser
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
              {ActiveSection && (
                <ActiveSection />
              )}
            </div>
          </div>
        </main>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard