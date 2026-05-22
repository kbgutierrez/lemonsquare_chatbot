import {
  useState,
  memo,
} from "react"

import {
  Ban,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  MessageSquareText,
} from "lucide-react"

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

  const toggle = () =>
    setExpanded((p) => !p)

  const isBlocked =
    ticket.is_blacklisted

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
              onClick={() =>
                blockTicket(
                  ticket.ticket_number
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
                    border-amber-500/20

                    bg-amber-500/10

                    text-amber-700

                    hover:bg-amber-500/20

                    dark:text-amber-300
                  `
              }
            >
              {isBlocked ? (
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