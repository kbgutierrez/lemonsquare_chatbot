import {
  useEffect,
  useMemo,
  useState,
} from "react"

import ticketAdminService
  from "../services/ticketAdminService"

export const useTickets =
  () => {

    const [tickets, setTickets] =
      useState([])

    const [loading, setLoading] =
      useState(true)

    const [search, setSearch] =
      useState("")

    const [currentPage, setCurrentPage] =
      useState(1)

    const itemsPerPage = 10

    /* FETCH */
    const fetchTickets =
      async () => {

        try {

          setLoading(true)

          const data =
            await ticketAdminService.getTickets({
              search,
            })

          setTickets(
            Array.isArray(data)
              ? data
              : []
          )

        } catch (error) {

          console.error(
            "FETCH_TICKETS_ERROR",
            error
          )

          setTickets([])

        } finally {

          setLoading(false)
        }
      }

    useEffect(() => {

      fetchTickets()

    }, [search])

    /* DELETE */
    const deleteTicket =
      async (
        ticketNumber
      ) => {

        try {

          console.log(
            "DELETE_TICKET",
            ticketNumber
          )

          /* OPTIMISTIC UI */
          setTickets((prev) =>
            prev.filter(
              (ticket) =>
                ticket.ticket_number !==
                ticketNumber
            )
          )

          /* BACKEND */
          if (
            ticketAdminService.deleteTicket
          ) {

            await ticketAdminService.deleteTicket(
              ticketNumber
            )
          }

        } catch (error) {

          console.error(
            "DELETE_TICKET_ERROR",
            error
          )

          /* REFRESH ON FAIL */
          fetchTickets()
        }
      }

    /* BLOCK / UNBLOCK */
    const toggleBlock =
      async (
        ticketNumber
      ) => {

        try {

          console.log(
            "TOGGLE_BLOCK",
            ticketNumber
          )

          /* OPTIMISTIC UPDATE */
          setTickets((prev) =>
            prev.map(
              (ticket) => {

                if (
                  ticket.ticket_number ===
                  ticketNumber
                ) {

                  return {
                    ...ticket,

                    is_blacklisted:
                      !ticket.is_blacklisted,
                  }
                }

                return ticket
              }
            )
          )

          /* OPTIONAL BACKEND */
          if (
            ticketAdminService.toggleBlock
          ) {

            await ticketAdminService.toggleBlock(
              ticketNumber
            )
          }

        } catch (error) {

          console.error(
            "TOGGLE_BLOCK_ERROR",
            error
          )

          /* REFRESH */
          fetchTickets()
        }
      }

    /* PAGINATION */
    const paginatedTickets =
      useMemo(() => {

        const start =
          (currentPage - 1) *
          itemsPerPage

        return tickets.slice(
          start,
          start + itemsPerPage
        )

      }, [
        tickets,
        currentPage,
      ])

    const totalPages =
      Math.max(
        1,

        Math.ceil(
          tickets.length /
          itemsPerPage
        )
      )

    return {
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
    }
  }