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
     CLASS HELPERS (REDUCE JSX NOISE)
  ======================================== */
  const headerLayout = isMobile
    ? "flex flex-col items-stretch gap-4 p-4"
    : "flex items-center gap-3 px-4 py-4"

  const logoutLayout = isMobile ? "w-full px-4 py-3" : "h-11 w-11"

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[28px] border border-[#2a3a33] bg-[#111917] p-3 sm:p-4 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      {/* HEADER */}
      <div className={`mb-6 shrink-0 rounded-3xl border border-[#27342e] bg-[#161f1d] ${headerLayout}`}>
        {/* PROFILE */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* AVATAR */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f5d547]">
            <span className="text-sm font-black text-[#111917]">{initials}</span>
          </div>

          {/* USER DETAILS */}
          <div className="min-w-0 flex-1">
            <div className="group relative w-full">
              <h2 className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-semibold text-white">
                {displayName}
              </h2>

              {/* TOOLTIP */}
              <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-max max-w-[260px] rounded-xl border border-[#33433d] bg-[#18211e] px-3 py-2 text-xs font-medium text-[#d8e0dc] opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-200 group-hover:opacity-100">
                {department}
              </div>
            </div>

            <p className="mt-0.5 text-xs text-[#8ea59b]"></p>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          type="button"
          onClick={onLogout}
          className={`flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-[#2d3b35] bg-[#1a2320] text-[#c6d1cc] transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 ${logoutLayout}`}
        >
          <LogOut className="h-4 w-4" />

          {isMobile && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* NAV LABEL */}
      <div className="mb-3 shrink-0 px-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#718379]">
          Navigation
        </p>
      </div>

      {/* MENU */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col gap-2">
          {navigationItems.map(({ id, label, icon: Icon }) => {
            const active = activeView === id

            const itemClass = active
              ? "border border-[#46544d] bg-[#1c2723] text-white"
              : "border border-transparent text-[#b6c3bd] hover:bg-[#171f1d] hover:text-white"

            const iconClass = active
              ? "bg-[#f5d547] text-[#111917]"
              : "bg-[#202a27] text-[#b6c3bd] group-hover:bg-[#2a3632] group-hover:text-white"

            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveView(id)}
                className={`group flex w-full min-w-0 items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${itemClass}`}
              >
                {/* ICON */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${iconClass}`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                </div>

                {/* LABEL */}
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
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