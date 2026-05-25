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

  /* ========================================
     SIMPLE DERIVED STATE
  ======================================== */

  const hasTickets =
    paginatedTickets.length > 0

  /*
    IMPORTANT:
    Only show fullscreen loading
    if absolutely no cached data exists.
  */

  const showInitialLoading =
    loading &&
    tickets.length === 0

  return (
    <div
      className="
        mx-auto
        flex
        h-full
        w-full
        max-w-[1600px]
        min-h-0
        flex-col
        gap-4
      "
    >
      {/* SEARCH / TOOLBAR */}
      <TicketSearch
        search={search}
        setSearch={setSearch}
        totalTickets={tickets.length}
        onRefresh={refreshTickets}
        refreshing={refreshing}
      />

      {/* TABLE CARD */}
      <div
        className="
          glass-panel

          relative
          flex
          flex-1
          min-h-0
          flex-col

          overflow-hidden

          rounded-[32px]
        "
      >
        {/* TOP LIGHT */}
        <div
          className="
            pointer-events-none

            absolute
            inset-x-0
            top-0

            h-px

            bg-white/5
          "
        />

        {/* LOADING */}
        {showInitialLoading && (
          <div
            className="
              flex
              flex-1
              items-center
              justify-center
            "
          >
            <LoadingSpinner
              label="Loading tickets..."
            />
          </div>
        )}

        {/* EMPTY */}
        {!showInitialLoading &&
          !hasTickets && (
            <div
              className="
                flex
                flex-1
                items-center
                justify-center
              "
            >
              <EmptyState
                title="No tickets found"
                message="No tickets matched your current search."
              />
            </div>
          )}

        {/* TABLE */}
        {!showInitialLoading &&
          hasTickets && (
            <>
              <div
                className="
                  flex-1
                  min-h-0

                  overflow-hidden
                "
              >
                <TicketTable
                  tickets={
                    paginatedTickets
                  }
                  blockTicket={
                    blockTicket
                  }
                />
              </div>

              <TicketPagination
                currentPage={
                  currentPage
                }
                totalPages={
                  totalPages
                }
                setCurrentPage={
                  setCurrentPage
                }
              />
            </>
          )}
      </div>
    </div>
  )
}

export default TicketsSection