import TicketSearch
  from "./TicketSearch"

import TicketTable
  from "./TicketTable"

import TicketPagination
  from "./TicketPagination"

import {
  useTickets,
} from "../../hooks/useTickets"

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

    blockTicket,
  } = useTickets()

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

        totalTickets={
          tickets.length
        }
      />

      {/* TABLE CARD */}
      <div
        className="
          relative

          flex
          flex-1
          min-h-0
          flex-col

          overflow-hidden

          rounded-[32px]

          border
          border-[#26342f]

          bg-[#101715]/95

          shadow-[0_0_0_1px_rgba(255,255,255,0.02)]

          backdrop-blur-xl
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

        {loading ? (

          <div
            className="
              flex
              flex-1
              items-center
              justify-center
            "
          >
            <div
              className="
                flex
                items-center
                gap-3

                rounded-2xl

                border
                border-[#293731]

                bg-[#141d1a]

                px-5
                py-4

                text-sm
                text-[#8ba29a]
              "
            >
              <div
                className="
                  h-5
                  w-5

                  animate-spin

                  rounded-full

                  border-2
                  border-[#f5d547]/20
                  border-t-[#f5d547]
                "
              />

              Loading tickets...
            </div>
          </div>

        ) : (

          <>
            {/* TABLE */}
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