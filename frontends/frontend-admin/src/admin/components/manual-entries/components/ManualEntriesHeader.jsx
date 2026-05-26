import { Search, Plus } from "lucide-react"

const ManualEntriesHeader = ({ search, setSearch, setShowModal }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Manual Entries</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Custom AI operational rules and manually fed knowledge.
        </p>
      </div>

      <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
        {/* SEARCH — underline style */}
        <div className="flex h-10 w-full items-center gap-2 border-b theme-border px-1 sm:w-[300px]">
          <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--placeholder)]"
          />
        </div>

        {/* ADD BUTTON */}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition-all duration-200 hover:scale-[1.02] hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          <span>Add Entry</span>
        </button>
      </div>
    </div>
  )
}

export default ManualEntriesHeader