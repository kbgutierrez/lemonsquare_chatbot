import { Search, Ticket, ShieldAlert, RefreshCw } from "lucide-react"

const TicketSearch = ({
  search,
  setSearch,
  totalTickets = 0,
  onRefresh,
  refreshing = false,
}) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* LEFT */}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
          Support Workspace
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Tickets
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Manage support requests, blocked users, and ticket moderation.
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col gap-3 lg:items-end">
        {/* SEARCH + ACTIONS */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
          {/* SEARCH — underline style */}
          <div className="flex h-10 w-full items-center gap-2 border-b theme-border px-1 lg:w-[340px]">
            <Search className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tickets..."
              className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
            />
          </div>

          {/* REFRESH BUTTON */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border theme-border bg-[var(--panel)] px-5 text-sm font-semibold text-[var(--text-primary)] transition-all duration-200 hover:bg-[var(--panel-light)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* METRICS — flat text, no card boxes */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-sm text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">{totalTickets}</span> total
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <span className="text-sm text-[var(--text-secondary)]">Moderation active</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketSearch