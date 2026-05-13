import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import ticketAdminService
  from "../services/ticketAdminService"

const ITEMS_PER_PAGE = 10

const SEARCH_DEBOUNCE = 400

export const useTickets =
  () => {

    /* ========================================
       REFS
    ======================================== */

    const mountedRef =
      useRef(true)

    const debounceRef =
      useRef(null)

    /* ========================================
       STATE
    ======================================== */

    const [tickets, setTickets] =
      useState([])

    const [loading, setLoading] =
      useState(true)

    const [search, setSearch] =
      useState("")

    const [currentPage, setCurrentPage] =
      useState(1)

    /* ========================================
       CLEANUP
    ======================================== */

    useEffect(() => {

      mountedRef.current =
        true

      return () => {

        mountedRef.current =
          false

        if (
          debounceRef.current
        ) {

          clearTimeout(
            debounceRef.current
          )
        }
      }

    }, [])

    /* ========================================
       FETCH TICKETS
    ======================================== */

    const fetchTickets =
      useCallback(
        async (
          searchValue =
            ""
        ) => {

          try {

            if (
              mountedRef.current
            ) {

              setLoading(
                true
              )
            }

            const data =
              await ticketAdminService.getTickets({
                search:
                  searchValue,
              })

            if (
              !mountedRef.current
            ) {
              return
            }

            const normalized =
              Array.isArray(
                data
              )
                ? data
                : []

            setTickets(
              normalized
            )

          } catch (error) {

            console.error(
              "FETCH_TICKETS_ERROR",
              error
            )

            if (
              mountedRef.current
            ) {

              setTickets([])
            }

          } finally {

            if (
              mountedRef.current
            ) {

              setLoading(
                false
              )
            }
          }
        },
        []
      )

    /* ========================================
       SEARCH EFFECT
    ======================================== */

    useEffect(() => {

      setCurrentPage(1)

      if (
        debounceRef.current
      ) {

        clearTimeout(
          debounceRef.current
        )
      }

      debounceRef.current =
        setTimeout(() => {

          fetchTickets(
            search
          )

        }, SEARCH_DEBOUNCE)

      return () => {

        if (
          debounceRef.current
        ) {

          clearTimeout(
            debounceRef.current
          )
        }
      }

    }, [
      search,
      fetchTickets,
    ])

    /* ========================================
       BLOCK TICKET
    ======================================== */

    const blockTicket =
      useCallback(
        async (
          ticketNumber
        ) => {

          const previousTickets =
            [...tickets]

          try {

            console.log(
              "BLOCK_TICKET",
              ticketNumber
            )

            /* OPTIMISTIC UPDATE */

            setTickets(
              (prev) =>
                prev.map(
                  (
                    ticket
                  ) => {

                    if (
                      ticket.ticket_number ===
                      ticketNumber
                    ) {

                      return {
                        ...ticket,

                        is_blacklisted:
                          true,
                      }
                    }

                    return ticket
                  }
                )
            )

            await ticketAdminService.deleteTicket(
              ticketNumber
            )

          } catch (error) {

            console.error(
              "BLOCK_TICKET_ERROR",
              error
            )

            /* ROLLBACK */

            if (
              mountedRef.current
            ) {

              setTickets(
                previousTickets
              )
            }
          }
        },
        [tickets]
      )

    /* ========================================
       PAGINATION
    ======================================== */

    const totalPages =
      useMemo(
        () =>
          Math.max(
            1,
            Math.ceil(
              tickets.length /
              ITEMS_PER_PAGE
            )
          ),
        [tickets]
      )

    const paginatedTickets =
      useMemo(
        () => {

          const start =
            (
              currentPage -
              1
            ) *
            ITEMS_PER_PAGE

          return tickets.slice(
            start,
            start +
              ITEMS_PER_PAGE
          )

        },
        [
          tickets,
          currentPage,
        ]
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

      blockTicket,
    }

  }