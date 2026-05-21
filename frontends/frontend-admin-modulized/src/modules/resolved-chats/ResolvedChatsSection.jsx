import { Search, X } from "lucide-react"
import { useResolvedChats } from "./useResolvedChats.js"
import ResolvedChatCard from "./ResolvedChatCard.jsx"
import EmptyState from "../../shared/components/EmptyState.jsx"
import LoadingSpinner from "../../shared/components/LoadingSpinner.jsx"
import ErrorState from "../../shared/components/ErrorState.jsx"
import Pagination from "../../shared/components/Pagination.jsx"

const ResolvedChatsSection = () => {
  const {
    allChats,
    loading,
    error,
    refresh,
    query,
    setQuery,
    page,
    setPage,
    totalPages,
    paginatedItems,
  } = useResolvedChats()

  return (
    <div className="flex flex-col gap-6">
      {/* Top Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#26332d] bg-[#101816]/70 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between md:p-5">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74877f]" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resolved chats..."
            className="input-base pl-11 pr-11"
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#74877f] transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="shrink-0">
          <span className="badge">
            {allChats.length} chat
            {allChats.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[420px]">
        {loading && !allChats.length ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-[#26332d] bg-[#101816]/60">
            <LoadingSpinner label="Loading resolved chats..." />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-[#26332d] bg-[#101816]/60 p-6">
            <ErrorState
              title="Failed to load resolved chats"
              message={error}
              onRetry={refresh}
            />
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="rounded-3xl border border-[#26332d] bg-[#101816]/60 p-8">
            <EmptyState
              title={
                query
                  ? "No chats match your search"
                  : "No resolved chats found"
              }
              message={
                query
                  ? "Try different search terms."
                  : "Resolved chats will appear here."
              }
            />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedItems.map((chat) => (
              <ResolvedChatCard
                key={chat.session_id || chat.id}
                chat={chat}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  )
}

export default ResolvedChatsSection