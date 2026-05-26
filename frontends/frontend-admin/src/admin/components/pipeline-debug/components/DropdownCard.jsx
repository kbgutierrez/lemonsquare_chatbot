import { useState } from "react"
import { ChevronDown } from "lucide-react"

const DropdownCard = ({ title, icon: Icon, color, children }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b theme-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 transition-colors hover:text-[var(--text-primary)]"
      >
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-sm font-semibold text-[var(--text-primary)]">{title}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

export default DropdownCard