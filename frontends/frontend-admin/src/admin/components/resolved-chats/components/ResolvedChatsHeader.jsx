import { Search } from "lucide-react"

const ResolvedChatsHeader = ({ search, setSearch }) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Resolved Chats
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          AI learned knowledge from successful conversations.
        </p>
      </div>

      {/* SEARCH — underline style, no card */}
      <div className="flex h-10 w-full items-center gap-2 border-b theme-border px-1 lg:w-[360px]">
        <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search resolved chats..."
          className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--placeholder)]"
        />
      </div>
    </div>
  )
}

export default ResolvedChatsHeader