import { useState, memo, useCallback } from "react"
import { createPortal } from "react-dom"
import {
  Ban,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  MessageSquareText,
  Loader2,
  TriangleAlert,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import TicketStatusBadge from "./TicketStatusBadge"
import EmptyState from "../../../shared/components/EmptyState"

const DetailBlock = ({ value }) => {
  if (!value) return null
  return (
    <div className="py-3">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquareText className="h-4 w-4 text-[var(--accent)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          Work Done
        </span>
      </div>
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--text-secondary)]">
        {value}
      </p>
    </div>
  )
}

const ModalPortal = ({ children }) => {
  if (typeof window === "undefined") return null
  return createPortal(children, document.body)
}

const ConfirmationModal = ({ open, onClose, onConfirm, loading, ticketNumber, isBlocked }) => {
  if (!open) return null
  return (
    <ModalPortal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 backdrop-blur-xl"
            style={{ background: "var(--modal-overlay)" }}
            onClick={() => {
              if (loading) return
              onClose()
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-lg border theme-border bg-[var(--panel)] shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
          >
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-md border theme-border bg-[var(--panel-light)] text-[var(--text-secondary)] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 sm:p-8">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-md ${
                  isBlocked ? "bg-emerald-500/12 text-emerald-400" : "bg-red-500/12 text-red-400"
                }`}
              >
                {isBlocked ? <ShieldCheck className="h-7 w-7" /> : <TriangleAlert className="h-7 w-7" />}
              </div>

              <h2 className="mt-5 text-2xl font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
                {isBlocked ? "Unblock Ticket?" : "Delete Ticket?"}
              </h2>

              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-[15px]">
                {isBlocked
                  ? "This ticket will become active again and rejoin AI retrieval and learning flows."
                  : "This ticket will be permanently removed from the AI knowledge base. This action cannot be undone."}
              </p>

              <div className="mt-5 rounded-md border theme-border bg-[var(--panel-light)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  Ticket Number
                </p>
                <p className="mt-2 break-all text-sm font-medium text-[var(--text-primary)]">
                  {ticketNumber}
                </p>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="h-11 rounded-md border theme-border bg-[var(--panel-light)] px-5 text-sm font-medium text-[var(--text-secondary)] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex h-11 items-center justify-center gap-2 rounded-md px-6 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isBlocked
                      ? "bg-emerald-500 text-black hover:bg-emerald-400"
                      : "bg-red-500 text-white hover:bg-red-400"
                  }`}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Processing..." : isBlocked ? "Confirm Unblock" : "Confirm Block"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </ModalPortal>
  )
}

const ActionButton = memo(({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
))

const TicketRow = memo(({ ticket, blockTicket }) => {
  const [expanded, setExpanded] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const toggle = () => setExpanded((p) => !p)
  const isBlocked = ticket.is_blacklisted

  const handleConfirm = useCallback(async () => {
    if (actionLoading) return
    try {
      setActionLoading(true)
      await blockTicket(ticket.ticket_number, isBlocked)
      setConfirmationOpen(false)
    } catch (error) {
      console.error("TICKET_ACTION_ERROR", error)
    } finally {
      setActionLoading(false)
    }
  }, [actionLoading, blockTicket, ticket.ticket_number, isBlocked])

  return (
    <>
      <tr className="group border-b theme-border transition-all duration-200 hover:bg-[var(--panel-light)]">
        {/* TICKET */}
        <td className="px-6 py-4 align-top">
          <button
            onClick={toggle}
            className="flex items-center gap-3 transition-all duration-200 hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md border theme-border bg-[var(--panel-light)]">
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-[var(--accent)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {ticket.ticket_number}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Support Ticket</p>
            </div>
          </button>
        </td>

        {/* ISSUE */}
        <td className="max-w-[560px] px-6 py-4">
          <p className="line-clamp-2 break-words text-sm leading-relaxed text-[var(--text-secondary)]">
            {ticket.issue_reported}
          </p>
        </td>

        {/* STATUS */}
        <td className="px-6 py-4">
          <TicketStatusBadge blacklisted={isBlocked} />
        </td>

        {/* ACTIONS */}
        <td className="px-6 py-4">
          <div className="flex justify-end gap-3">
            <ActionButton
              disabled={actionLoading}
              onClick={() => setConfirmationOpen(true)}
              className={
                isBlocked
                  ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
                  : "border border-red-500/20 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400"
              }
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isBlocked ? (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden xl:inline">Unblock</span>
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4" />
                  <span className="hidden xl:inline">Block</span>
                </>
              )}
            </ActionButton>
          </div>
        </td>
      </tr>

      {/* EXPANDED */}
      {expanded && (
        <tr className="border-b theme-border bg-[var(--panel-light)]/30">
          <td colSpan={4} className="px-6 py-4">
            <DetailBlock value={ticket.work_done || ticket.advanced_work_done} />
          </td>
        </tr>
      )}

      <ConfirmationModal
        open={confirmationOpen}
        onClose={() => {
          if (actionLoading) return
          setConfirmationOpen(false)
        }}
        onConfirm={handleConfirm}
        loading={actionLoading}
        ticketNumber={ticket.ticket_number}
        isBlocked={isBlocked}
      />
    </>
  )
})

const TicketTable = ({ tickets, blockTicket }) => {
  if (!tickets?.length) {
    return (
      <EmptyState
        title="No tickets found"
        message="Support tickets will appear here once users submit requests."
        icon={<MessageSquareText className="h-8 w-8 text-[var(--accent)]" />}
      />
    )
  }

  return (
    <div className="h-full overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="min-w-full table-fixed border-separate border-spacing-0">
        <thead className="sticky top-0 z-10 bg-[var(--background)]">
          <tr>
            <th className="w-[260px] border-b theme-border px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Ticket
            </th>

            <th className="border-b theme-border px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Issue
            </th>

            <th className="w-[180px] border-b theme-border px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Status
            </th>

            <th className="w-[180px] border-b theme-border px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <TicketRow
              key={ticket.id || ticket.ticket_number}
              ticket={ticket}
              blockTicket={blockTicket}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TicketTable