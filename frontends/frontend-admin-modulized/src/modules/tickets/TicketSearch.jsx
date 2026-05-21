import { Search, X } from "lucide-react"

const TicketSearch = ({ value, onChange, totalCount }) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex items-center max-w-sm">
        <Search className="absolute left-4 h-4 w-4 shrink-0 text-[#74877f]" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="Search tickets..."
          className="input-base pl-10 pr-10" />
        {value && (
          <button onClick={() => onChange("")} className="absolute right-3 rounded-lg p-1 text-[#74877f] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <span className="text-xs text-[#74877f]">{totalCount} ticket{totalCount !== 1 ? "s" : ""}</span>
    </div>
  )
}

export default TicketSearch
