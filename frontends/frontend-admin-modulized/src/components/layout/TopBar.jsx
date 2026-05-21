import { RefreshCw, LogOut } from "lucide-react"

const TopBar = ({ sectionTitle, onRefresh, refreshTooltip = "Refresh" }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#26332d] bg-[#0a0f0e]/85 px-4 py-3 backdrop-blur-md md:px-6 md:py-4">
      <h1 className="text-lg font-bold text-white md:text-xl">{sectionTitle}</h1>
      <div className="flex items-center gap-2">
        <button onClick={onRefresh}
          className="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#2b3933] bg-[#18211f] text-[#8ea59b] transition-all hover:border-[#f5d547]/20 hover:text-[#f5d547]"
          title={refreshTooltip}>
          <RefreshCw className="h-4 w-4" />
          <span className="absolute right-full mr-2 hidden whitespace-nowrap rounded-lg border border-[#3a4a45] bg-[#111917] px-2 py-1 text-xs text-[#c8d6d1] shadow-lg group-hover:block">{refreshTooltip}</span>
        </button>
        <button onClick={() => { localStorage.removeItem("admin_auth"); localStorage.removeItem("admin_user"); window.location.reload() }}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2b3933] bg-[#18211f] text-[#8ea59b] transition-all hover:border-red-500/20 hover:text-red-400"
          title="Logout">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}

export default TopBar
