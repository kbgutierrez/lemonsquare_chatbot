import { LogOut } from "lucide-react"

import { navigationItems } from "../constants/navigation"

const SidebarMenu = ({
  activeView,
  setActiveView,
  onLogout,
  adminUser,
  isMobile = false,
}) => {
  /* ========================================
     USER INFO (SAFE NORMALIZATION)
  ======================================== */
  const displayName = adminUser?.name || "Authenticated User"
  const department = adminUser?.department || "Admin Panel"

  const initials = (displayName?.charAt(0) || "A").toUpperCase()

  /* ========================================
     CLASS HELPERS
  ======================================== */
  const headerLayout = isMobile
    ? "flex flex-col items-stretch gap-4 p-4"
    : "flex items-center gap-3 px-4 py-4"

  const logoutLayout = isMobile
    ? "w-full px-4 py-3"
    : "h-11 w-11"

  return (
    <aside
      className="
        flex
        h-full
        min-h-0
        w-full
        flex-col
        overflow-hidden
        rounded-[28px]
        p-3
        shadow-[0_10px_40px_rgba(0,0,0,0.18)]
        sm:p-4
      "
      style={{
        border: "1px solid var(--border)",
        background: "var(--panel)",
      }}
    >
      {/* HEADER */}
      <div
        className={`mb-6 shrink-0 rounded-3xl ${headerLayout}`}
        style={{
          border: "1px solid var(--border)",
          background: "var(--panel-light)",
        }}
      >
        {/* PROFILE */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* AVATAR */}
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
            "
            style={{
              background: "var(--accent)",
            }}
          >
            <span
              className="text-sm font-black"
              style={{
                color: "#111917",
              }}
            >
              {initials}
            </span>
          </div>

          {/* USER DETAILS */}
          <div className="min-w-0 flex-1">
            <div className="group relative w-full">
              <h2
                className="
                  overflow-hidden
                  text-ellipsis
                  whitespace-nowrap
                  text-[15px]
                  font-semibold
                "
                style={{
                  color: "var(--text-primary)",
                }}
              >
                {displayName}
              </h2>

              {/* TOOLTIP */}
              <div
                className="
                  pointer-events-none
                  absolute
                  left-0
                  top-full
                  z-50
                  mt-2
                  w-max
                  max-w-[260px]
                  rounded-xl
                  px-3
                  py-2
                  text-xs
                  font-medium
                  opacity-0
                  shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                  transition-all
                  duration-200
                  group-hover:opacity-100
                "
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--panel)",
                  color: "var(--text-primary)",
                }}
              >
                {department}
              </div>
            </div>

            <p
              className="mt-0.5 text-xs"
              style={{
                color: "var(--text-secondary)",
              }}
            />
          </div>
        </div>

        {/* LOGOUT */}
        <button
          type="button"
          onClick={onLogout}
          className={`
            flex
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-2xl
            transition-all
            duration-200
            hover:bg-red-500/10
            hover:text-red-300
            ${logoutLayout}
          `}
          style={{
            border: "1px solid var(--border)",
            background: "var(--panel)",
            color: "var(--text-secondary)",
          }}
        >
          <LogOut className="h-4 w-4" />

          {isMobile && (
            <span className="text-sm font-medium">
              Logout
            </span>
          )}
        </button>
      </div>

      {/* NAV LABEL */}
      <div className="mb-3 shrink-0 px-2">
        <p
          className="
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.22em]
          "
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Navigation
        </p>
      </div>

      {/* MENU */}
      <div
        className="
          flex-1
          min-h-0
          overflow-y-auto
          overflow-x-hidden
          pr-1
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        <div className="flex flex-col gap-2">
          {navigationItems.map(({ id, label, icon: Icon }) => {
            const active = activeView === id

            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveView(id)}
                className="
                  group
                  flex
                  w-full
                  min-w-0
                  items-center
                  gap-3
                  rounded-2xl
                  px-3
                  py-3
                  text-left
                  transition-all
                  duration-200
                "
                style={{
                  border: active
                    ? "1px solid var(--border)"
                    : "1px solid transparent",

                  background: active
                    ? "var(--panel-light)"
                    : "transparent",

                  color: "var(--text-primary)",
                }}
              >
                {/* ICON */}
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    transition-all
                    duration-200
                  "
                  style={{
                    background: active
                      ? "var(--accent)"
                      : "var(--panel-light)",

                    color: active
                      ? "#111917"
                      : "var(--text-secondary)",
                  }}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                </div>

                {/* LABEL */}
                <span
                  className="
                    min-w-0
                    flex-1
                    truncate
                    text-sm
                    font-medium
                  "
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export default SidebarMenu