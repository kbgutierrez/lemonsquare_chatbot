import TicketSearch from "./TicketSearch"
import TicketTable from "./TicketTable"
import TicketPagination from "./TicketPagination"
import { useTickets } from "../../hooks/useTickets"
import LoadingSpinner from "../../../shared/components/LoadingSpinner"
import EmptyState from "../../../shared/components/EmptyState"

const TicketsSection = () => {
  const {
    loading,
    refreshing,
    search,
    setSearch,
    tickets,
    paginatedTickets,
    currentPage,
    setCurrentPage,
    totalPages,
    blockTicket,
    refreshTickets,
  } = useTickets()

  const hasTickets = paginatedTickets.length > 0
  const showInitialLoading = loading && tickets.length === 0

  return (
    <div className="mx-auto flex h-full w-full max-w-[1600px] min-h-0 flex-col gap-5">
      {/* SEARCH / TOOLBAR */}
      <TicketSearch
        search={search}
        setSearch={setSearch}
        totalTickets={tickets.length}
        onRefresh={refreshTickets}
        refreshing={refreshing}
      />

      {/* TABLE AREA — no border, no card, blends into page */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* LOADING */}
        {showInitialLoading && (
          <div className="flex flex-1 items-center justify-center">
            <LoadingSpinner label="Loading tickets..." />
          </div>
        )}

        {/* EMPTY */}
        {!showInitialLoading && !hasTickets && (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              title="No tickets found"
              message="No tickets matched your current search."
            />
          </div>
        )}

        {/* TABLE */}
        {!showInitialLoading && hasTickets && (
          <>
            <div className="min-h-0 flex-1 overflow-hidden">
              <TicketTable
                tickets={paginatedTickets}
                blockTicket={blockTicket}
              />
            </div>
            <TicketPagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default TicketsSection