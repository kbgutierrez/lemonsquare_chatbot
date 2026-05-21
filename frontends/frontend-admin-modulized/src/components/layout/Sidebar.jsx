import { useRef } from "react"
import { motion } from "framer-motion"
import { ShieldCheck, LayoutDashboard, FileText, Upload, MessageSquare, Settings, Cog, Terminal, X, Menu } from "lucide-react"
import { useHorizontalDragScroll } from "../../shared/hooks/useHorizontalDragScroll.js"

const topNavItems = [
  { key: "analytics", label: "Analytics", icon: LayoutDashboard },
  { key: "upload", label: "Upload", icon: Upload },
  { key: "tickets", label: "Tickets", icon: MessageSquare },
  { key: "knowledge", label: "Knowledge", icon: FileText },
  { key: "manual", label: "Manual", icon: FileText },
  { key: "resolved", label: "Resolved", icon: MessageSquare },
]

const bottomNavItems = [
  { key: "ai-settings", label: "AI Settings", icon: Cog },
  { key: "pipeline", label: "Pipeline", icon: Terminal },
  { key: "settings", label: "Settings", icon: Settings },
]

const Sidebar = ({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen, userName }) => {
  const bottomScrollRef = useRef(null)
  useHorizontalDragScroll(bottomScrollRef)

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Mobile toggle */}
      <button
        className="fixed top-6 left-6 z-[70] flex h-10 w-10 items-center justify-center rounded-xl border border-[#2b3933] bg-[#18211f]/80 text-white shadow-md backdrop-blur-md md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        className={`fixed inset-y-0 left-0 z-[60] flex w-56 flex-col border-r border-[#26332d] bg-[#0f1614] shadow-[16px_0_48px_rgba(0,0,0,0.35)] md:relative md:block ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-[#26332d] px-6 py-5">
          <ShieldCheck className="h-6 w-6 shrink-0 text-[#f5d547]" />
          <span className="text-lg font-bold tracking-tight text-white">Admin</span>
        </div>

        {/* Top nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {topNavItems.map(({ key, label, icon: Icon }) => {
            const active = activeSection === key
            return (
              <button key={key} onClick={() => { setActiveSection(key); setSidebarOpen(false) }}
                className={`group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#f5d547] text-[#111917] shadow-[0_4px_12px_rgba(245,213,71,0.2)]"
                    : "text-[#8ea59b] hover:bg-white/[0.04] hover:text-white"
                }`}>
                {active && <motion.div layoutId="activePill" className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-[#f5d547]" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom nav */}
        <div className="border-t border-[#26332d] px-3 pb-3 pt-2">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2" ref={bottomScrollRef}>
            {bottomNavItems.map(({ key, label, icon: Icon }) => {
              const active = activeSection === key
              return (
                <button key={key} onClick={() => { setActiveSection(key); setSidebarOpen(false) }}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold transition-all ${
                    active
                      ? "bg-[#95c11f] text-[#111917]"
                      : "border border-[#26332d] bg-[#111917] text-[#74877f] hover:bg-[#18211f]"
                  }`}>
                  <Icon className="h-3 w-3" />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              )
            })}
          </div>
          {userName && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#2a3a33] bg-[#141d1a] px-3 py-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f5d547] text-[10px] font-bold text-[#111917]">
                {userName[0]?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-xs font-medium text-[#d5dfdb]">{userName}</p>
                <p className="truncate text-[10px] text-[#627a71]">Logged in</p>
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar
