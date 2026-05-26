import { SlidersHorizontal } from "lucide-react"

const SettingsHeader = ({ activeModel }) => {
  return (
    <div className="border-b theme-border pb-5">
      <div className="flex items-center gap-4">
        <SlidersHorizontal className="h-6 w-6 text-[var(--accent)]" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            AI Configuration
          </p>
          <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">
            Enterprise AI Settings
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Active Model: <span className="font-semibold text-[var(--text-primary)]">{activeModel}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SettingsHeader