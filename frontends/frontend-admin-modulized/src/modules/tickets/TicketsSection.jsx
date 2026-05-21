import { useState, useCallback } from "react"

import { useTickets } from "./useTickets.js"
import TicketSearch from "./TicketSearch.jsx"
import TicketTable from "./TicketTable.jsx"
import TicketPagination from "./TicketPagination.jsx"

import EmptyState from "../../shared/components/EmptyState.jsx"
import LoadingSpinner from "../../shared/components/LoadingSpinner.jsx"
import ErrorState from "../../shared/components/ErrorState.jsx"
import ConfirmDialog from "../../shared/components/ConfirmDialog.jsx"

const TicketsSection = () => {
  const {
    allTickets,
    loading,
    error,
    refresh,
    query,
    setQuery,
    page,
    setPage,
    totalPages,
    paginatedItems,
  } = useTickets()

  const [deleting, setDeleting] = useState(null)

  const [whitelisting, setWhitelisting] = useState(null)

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    ticketNumber: null,
    whitelisted: false,
  })

  const handleDelete = useCallback(
    async (ticketNumber) => {
      if (
        !ticketNumber ||
        !window.confirm(
          `Delete ticket ${ticketNumber}? This cannot be undone.`
        )
      ) {
        return
      }

      try {
        setDeleting(ticketNumber)

        const res = await fetch(
          `/api/tickets/${ticketNumber}`,
          {
            method: "DELETE",
          }
        )

        if (!res.ok) {
          throw new Error(await res.text())
        }

        refresh()
      } catch (e) {
        alert(e.message || "Failed to delete ticket")
      } finally {
        setDeleting(null)
      }
    },
    [refresh]
  )

  const handleToggleWhitelist = useCallback(
    async (ticketNumber, current) => {
      if (current) {
        setConfirmDialog({
          open: true,
          ticketNumber,
          whitelisted: true,
        })

        return
      }

      try {
        setWhitelisting(ticketNumber)

        const res = await fetch(
          `/api/tickets/${ticketNumber}/whitelist`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
            },
          }
        )

        if (!res.ok) {
          throw new Error(await res.text())
        }

        refresh()
      } catch (e) {
        alert(e.message || "Failed to whitelist ticket")
      } finally {
        setWhitelisting(null)
      }
    },
    [refresh]
  )

  const handleConfirmRemoveWhitelist = useCallback(
    async () => {
      const { ticketNumber } = confirmDialog

      setConfirmDialog({
        open: false,
        ticketNumber: null,
        whitelisted: false,
      })

      try {
        setWhitelisting(ticketNumber)

        const res = await fetch(
          `/api/tickets/${ticketNumber}/whitelist`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
            },
          }
        )

        if (!res.ok) {
          throw new Error(await res.text())
        }

        refresh()
      } catch (e) {
        alert(
          e.message || "Failed to remove whitelist"
        )
      } finally {
        setWhitelisting(null)
      }
    },
    [confirmDialog, refresh]
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Search/Header */}
      <div className="rounded-3xl border border-[#26332d] bg-[#101816]/70 p-4 backdrop-blur-sm md:p-5">
        <TicketSearch
          value={query}
          onChange={setQuery}
          totalCount={allTickets.length}
        />
      </div>

      {/* Table Section */}
      <div className="card-surface overflow-hidden">
        {/* Table Content */}
        <div className="min-h-[420px]">
          {loading && !allTickets.length ? (
            <div className="flex min-h-[420px] items-center justify-center p-6">
              <LoadingSpinner label="Loading tickets..." />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorState
                title="Failed to load tickets"
                message={error}
                onRetry={refresh}
              />
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title={
                  query
                    ? "No tickets match your search"
                    : "No tickets found"
                }
                message={
                  query
                    ? "Try different search terms."
                    : "Tickets will appear here once synced."
                }
              />
            </div>
          ) : (
            <div className="overflow-hidden">
              <TicketTable
                tickets={paginatedItems}
                onDelete={handleDelete}
                onToggleWhitelist={
                  handleToggleWhitelist
                }
                deleting={deleting}
                whitelisting={whitelisting}
                isCompact={false}
              />
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-[#26332d] bg-[#0f1614]/60 px-4 py-4 md:px-6">
            <TicketPagination
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({
            open: false,
            ticketNumber: null,
            whitelisted: false,
          })
        }
        onConfirm={handleConfirmRemoveWhitelist}
        title="Remove Whitelist"
        message={`Remove whitelist from ticket ${confirmDialog.ticketNumber}?`}
        confirmLabel="Remove"
      />
    </div>
  )
}

export default TicketsSection