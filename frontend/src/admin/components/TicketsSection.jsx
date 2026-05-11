import TicketHeader
  from "./tickets/TicketHeader"

import TicketSearch
  from "./tickets/TicketSearch"

import TicketTable
  from "./tickets/TicketTable"

import TicketPagination
  from "./tickets/TicketPagination"

import {
  useTickets,
} from "../hooks/useTickets"

const TicketsSection = () => {

  const {
    loading,

    search,
    setSearch,

    tickets,

    paginatedTickets,

    currentPage,
    setCurrentPage,

    totalPages,

    deleteTicket,
    toggleBlock,
  } = useTickets()

  return (
    <div
      className="
        flex
        h-full
        min-h-0
        flex-col
        gap-4
      "
    >
      {/* HEADER */}
      <TicketHeader
        count={
          tickets.length
        }
      />

      {/* SEARCH */}
      <TicketSearch
        search={search}
        setSearch={setSearch}
      />

      {/* TABLE CARD */}
      <div
        className="
          flex
          flex-1
          min-h-0
          flex-col

          overflow-hidden

          rounded-3xl

          border
          border-violet-100

          bg-white
        "
      >
        {loading ? (

          <div
            className="
              flex
              flex-1
              items-center
              justify-center

              text-sm
              text-violet-500
            "
          >
            Loading tickets...
          </div>

        ) : (

          <>
            {/* SCROLLABLE TABLE */}
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

                deleteTicket={
                  deleteTicket
                }

                toggleBlock={
                  toggleBlock
                }
              />
            </div>

            {/* PAGINATION */}
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