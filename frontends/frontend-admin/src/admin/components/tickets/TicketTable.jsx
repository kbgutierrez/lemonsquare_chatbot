import {
  useState,
  memo,
  useCallback,
} from "react"

import {
  createPortal,
} from "react-dom"

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

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import TicketStatusBadge from "./TicketStatusBadge"
import EmptyState from "../../../shared/components/EmptyState"

/* ========================================
   DETAIL BLOCK
======================================== */

const DetailBlock = ({
  value,
}) => {
  if (!value) return null

  return (
    <div
      className="
        muted-card
        rounded-3xl
        p-5
      "
    >
      <div
        className="
          mb-4
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center

            rounded-2xl

            bg-[var(--accent)]/10
          "
        >
          <MessageSquareText
            className="
              h-5
              w-5
              text-[var(--accent)]
            "
          />
        </div>

        <div>
          <p
            className="
              text-[11px]
              font-semibold
              uppercase

              tracking-[0.18em]

              text-[var(--text-secondary)]
            "
          >
            Ticket Details
          </p>

          <p
            className="
              mt-1
              text-sm
              font-medium
              text-[var(--text-primary)]
            "
          >
            Work Done
          </p>
        </div>
      </div>

      <p
        className="
          whitespace-pre-wrap
          break-words

          text-sm
          leading-relaxed

          text-[var(--text-secondary)]
        "
      >
        {value}
      </p>
    </div>
  )
}

/* ========================================
   MODAL PORTAL
======================================== */

const ModalPortal = ({
  children,
}) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return null
  }

  return createPortal(
    children,
    document.body
  )
}

/* ========================================
   CONFIRMATION MODAL
======================================== */

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  loading,
  ticketNumber,
  isBlocked,
}) => {
  if (!open) return null

  return (
    <ModalPortal>
      <AnimatePresence>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="
            fixed
            inset-0
            z-[999999]

            flex
            items-center
            justify-center

            bg-black/75
            backdrop-blur-xl

            p-4
          "
        >
          {/* BACKDROP */}
          <div
            className="
              absolute
              inset-0
            "
            onClick={() => {
              if (loading) {
                return
              }

              onClose()
            }}
          />

          {/* MODAL */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.92,
              y: 24,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 12,
            }}
            transition={{
              duration: 0.18,
            }}
            className="
              relative
              z-10

              w-full
              max-w-[520px]

              overflow-hidden

              rounded-[34px]

              border
              border-white/10

              bg-[#0c1210]

              shadow-[0_30px_120px_rgba(0,0,0,0.8)]
            "
          >
            {/* TOP LIGHT */}
            <div
              className="
                absolute
                inset-x-0
                top-0

                h-px

                bg-white/10
              "
            />

            {/* CLOSE */}
            <button
              onClick={onClose}
              disabled={loading}
              className="
                absolute
                right-5
                top-5

                flex
                h-11
                w-11
                items-center
                justify-center

                rounded-2xl

                border
                border-white/10

                bg-white/[0.04]

                text-[var(--text-secondary)]

                transition-all
                duration-200

                hover:bg-white/[0.08]
                hover:text-white

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <X
                className="
                  h-4
                  w-4
                "
              />
            </button>

            <div
              className="
                p-6

                sm:p-8
              "
            >
              {/* ICON */}
              <div
                className={`
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center

                  rounded-[28px]

                  ${
                    isBlocked
                      ? `
                        bg-emerald-500/12
                        text-emerald-400
                      `
                      : `
                        bg-red-500/12
                        text-red-400
                      `
                  }
                `}
              >
                {isBlocked ? (
                  <ShieldCheck
                    className="
                      h-8
                      w-8
                    "
                  />
                ) : (
                  <TriangleAlert
                    className="
                      h-8
                      w-8
                    "
                  />
                )}
              </div>

              {/* TITLE */}
              <h2
                className="
                  mt-6

                  text-[28px]
                  font-semibold

                  leading-tight
                  tracking-tight

                  text-white
                "
              >
                {isBlocked
                  ? "Unblock Ticket?"
                  : "Delete Ticket?"}
              </h2>

              {/* DESCRIPTION */}
              <p
                className="
                  mt-4

                  text-sm
                  leading-7

                  text-[var(--text-secondary)]

                  sm:text-[15px]
                "
              >
                {isBlocked
                  ? `
                    This ticket will become active again
                    and rejoin AI retrieval and learning flows.
                  `
                  : `
                    This ticket will be permanently removed
                    from the AI knowledge base.
                    This action cannot be undone.
                  `}
              </p>

              {/* TICKET CARD */}
              <div
                className="
                  mt-6

                  rounded-[24px]

                  border
                  border-white/10

                  bg-white/[0.03]

                  p-5
                "
              >
                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase

                    tracking-[0.18em]

                    text-[var(--text-secondary)]
                  "
                >
                  Ticket Number
                </p>

                <p
                  className="
                    mt-3

                    break-all

                    text-sm
                    font-medium

                    text-white
                  "
                >
                  {ticketNumber}
                </p>
              </div>

              {/* ACTIONS */}
              <div
                className="
                  mt-8

                  flex
                  flex-col-reverse
                  gap-3

                  sm:flex-row
                  sm:justify-end
                "
              >
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="
                    h-[54px]

                    rounded-2xl

                    border
                    border-white/10

                    bg-white/[0.03]

                    px-5

                    text-sm
                    font-medium

                    text-[var(--text-secondary)]

                    transition-all
                    duration-200

                    hover:bg-white/[0.06]
                    hover:text-white

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`
                    flex
                    h-[54px]
                    items-center
                    justify-center
                    gap-2

                    rounded-2xl

                    px-6

                    text-sm
                    font-semibold

                    transition-all
                    duration-200

                    disabled:cursor-not-allowed
                    disabled:opacity-50

                    ${
                      isBlocked
                        ? `
                          bg-emerald-500
                          text-black

                          hover:bg-emerald-400
                        `
                        : `
                          bg-red-500
                          text-white

                          hover:bg-red-400
                        `
                    }
                  `}
                >
                  {loading && (
                    <Loader2
                      className="
                        h-4
                        w-4
                        animate-spin
                      "
                    />
                  )}

                  {loading
                    ? "Processing..."
                    : isBlocked
                    ? "Confirm Unblock"
                    : "Confirm Block"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </ModalPortal>
  )
}

/* ========================================
   ACTION BUTTON
======================================== */

const ActionButton = memo(
  ({
    children,
    className = "",
    ...props
  }) => (
    <button
      {...props}
      className={`
        flex
        items-center
        gap-2

        rounded-2xl

        px-4
        py-2.5

        text-sm
        font-medium

        transition-all
        duration-200

        hover:scale-[1.01]

        disabled:cursor-not-allowed
        disabled:opacity-50

        ${className}
      `}
    >
      {children}
    </button>
  )
)

/* ========================================
   ROW
======================================== */

const TicketRow = memo(({
  ticket,
  blockTicket,
}) => {
  const [expanded, setExpanded] =
    useState(false)

  const [
    confirmationOpen,
    setConfirmationOpen,
  ] = useState(false)

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false)

  const toggle = () =>
    setExpanded((p) => !p)

  const isBlocked =
    ticket.is_blacklisted

  const handleConfirm =
    useCallback(async () => {
      if (actionLoading) {
        return
      }

      try {
        setActionLoading(true)

        await blockTicket(
          ticket.ticket_number,
          isBlocked
        )

        setConfirmationOpen(false)
      } catch (error) {
        console.error(
          "TICKET_ACTION_ERROR",
          error
        )
      } finally {
        setActionLoading(false)
      }
    }, [
      actionLoading,
      blockTicket,
      ticket.ticket_number,
      isBlocked,
    ])

  return (
    <>
      <tr
        className="
          group

          border-b
          border-[var(--border)]

          transition-all
          duration-200

          hover:bg-[var(--hover)]
        "
      >
        {/* TICKET */}
        <td
          className="
            px-6
            py-5

            align-top
          "
        >
          <button
            onClick={toggle}
            className="
              flex
              items-center
              gap-3

              transition-all
              duration-200

              hover:opacity-80
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center

                rounded-xl

                border
                border-[var(--border)]

                bg-[var(--panel-light)]
              "
            >
              {expanded ? (
                <ChevronUp
                  className="
                    h-4
                    w-4

                    text-[var(--accent)]
                  "
                />
              ) : (
                <ChevronDown
                  className="
                    h-4
                    w-4

                    text-[var(--text-secondary)]
                  "
                />
              )}
            </div>

            <div className="text-left">
              <p
                className="
                  text-sm
                  font-semibold

                  text-[var(--text-primary)]
                "
              >
                {ticket.ticket_number}
              </p>

              <p
                className="
                  mt-1

                  text-xs

                  text-[var(--text-secondary)]
                "
              >
                Support Ticket
              </p>
            </div>
          </button>
        </td>

        {/* ISSUE */}
        <td
          className="
            max-w-[560px]

            px-6
            py-5
          "
        >
          <p
            className="
              line-clamp-2
              break-words

              text-sm
              leading-relaxed

              text-[var(--text-secondary)]
            "
          >
            {ticket.issue_reported}
          </p>
        </td>

        {/* STATUS */}
        <td className="px-6 py-5">
          <TicketStatusBadge
            blacklisted={isBlocked}
          />
        </td>

        {/* ACTIONS */}
        <td className="px-6 py-5">
          <div
            className="
              flex
              justify-end
              gap-3
            "
          >
            <ActionButton
              disabled={actionLoading}
              onClick={() =>
                setConfirmationOpen(
                  true
                )
              }
              className={
                isBlocked
                  ? `
                    border
                    border-emerald-500/20

                    bg-emerald-500/10

                    text-emerald-700

                    hover:bg-emerald-500/20

                    dark:text-emerald-400
                  `
                  : `
                    border
                    border-red-500/20

                    bg-red-500/10

                    text-red-700

                    hover:bg-red-500/20

                    dark:text-red-400
                  `
              }
            >
              {actionLoading ? (
                <Loader2
                  className="
                    h-4
                    w-4
                    animate-spin
                  "
                />
              ) : isBlocked ? (
                <>
                  <ShieldCheck
                    className="
                      h-4
                      w-4
                    "
                  />

                  <span
                    className="
                      hidden
                      xl:inline
                    "
                  >
                    Unblock
                  </span>
                </>
              ) : (
                <>
                  <Ban
                    className="
                      h-4
                      w-4
                    "
                  />

                  <span
                    className="
                      hidden
                      xl:inline
                    "
                  >
                    Block
                  </span>
                </>
              )}
            </ActionButton>
          </div>
        </td>
      </tr>

      {/* EXPANDED */}
      {expanded && (
        <tr
          className="
            border-b
            border-[var(--border)]

            bg-black/[0.02]

            dark:bg-white/[0.02]
          "
        >
          <td
            colSpan={4}
            className="
              px-6
              pb-6
            "
          >
            <DetailBlock
              value={
                ticket.work_done ||
                ticket.advanced_work_done
              }
            />
          </td>
        </tr>
      )}

      {/* MODAL */}
      <ConfirmationModal
        open={confirmationOpen}
        onClose={() => {
          if (actionLoading) {
            return
          }

          setConfirmationOpen(
            false
          )
        }}
        onConfirm={handleConfirm}
        loading={actionLoading}
        ticketNumber={
          ticket.ticket_number
        }
        isBlocked={isBlocked}
      />
    </>
  )
})

/* ========================================
   TABLE
======================================== */

const TicketTable = ({
  tickets,
  blockTicket,
}) => {
  if (!tickets?.length) {
    return (
      <EmptyState
        title="No tickets found"
        message="Support tickets will appear here once users submit requests."
        icon={
          <MessageSquareText
            className="
              h-8
              w-8

              text-[var(--accent)]
            "
          />
        }
      />
    )
  }

  return (
    <div
      className="
        h-full

        overflow-auto

        [scrollbar-width:none]

        [&::-webkit-scrollbar]:hidden
      "
    >
      <table
        className="
          min-w-full

          border-separate
          border-spacing-0
        "
      >
        <thead
          className="
            sticky
            top-0
            z-10

            bg-[var(--glass-bg)]

            backdrop-blur-xl
          "
        >
          <tr>
            {[
              "Ticket",
              "Issue",
              "Status",
              "Actions",
            ].map((label) => (
              <th
                key={label}
                className={`
                  border-b
                  border-[var(--border)]

                  px-6
                  py-4

                  text-[11px]
                  font-semibold
                  uppercase

                  tracking-[0.18em]

                  text-[var(--text-secondary)]

                  ${
                    label === "Actions"
                      ? "text-right"
                      : "text-left"
                  }
                `}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {tickets.map((ticket) => (
            <TicketRow
              key={
                ticket.id ||
                ticket.ticket_number
              }
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