import {
  Ban,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Trash2,
} from "lucide-react"

import {
  useState,
} from "react"

import TicketStatusBadge
  from "./TicketStatusBadge"

const DetailBlock = ({
  value,
}) => {

  if (!value) return null

  return (
    <div
      className="
        rounded-2xl

        border
        border-violet-100

        bg-violet-50/50

        p-4
      "
    >
      <p
        className="
          mb-2

          text-[10px]
          font-bold
          uppercase
          tracking-wide

          text-violet-500
        "
      >
        Work Done
      </p>

      <p
        className="
          whitespace-pre-wrap
          break-words

          text-sm
          leading-relaxed

          text-slate-700
        "
      >
        {value}
      </p>
    </div>
  )
}

const ActionButton = ({
  children,
  className,
  ...props
}) => (
  <button
    {...props}
    className={`
      flex
      items-center
      gap-2

      rounded-xl

      px-3
      py-2

      text-sm
      font-medium

      transition-all
      duration-200

      ${className}
    `}
  >
    {children}
  </button>
)

const TicketRow = ({
  ticket,
  deleteTicket,
  toggleBlock,
}) => {

  const [expanded, setExpanded] =
    useState(false)

  return (
    <>
      <tr
        className="
          border-b
          border-violet-100

          transition-colors
          duration-200

          hover:bg-violet-50/60
        "
      >
        {/* TICKET */}
        <td className="px-4 py-4 align-top">
          <button
            onClick={() =>
              setExpanded(
                (prev) => !prev
              )
            }
            className="
              flex
              items-center
              gap-2

              font-semibold
              text-violet-700
            "
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}

            {
              ticket.ticket_number
            }
          </button>
        </td>

        {/* ISSUE */}
        <td
          className="
            max-w-[500px]

            px-4
            py-4

            text-slate-700
          "
        >
          <p
            className="
              line-clamp-2
              break-words
            "
          >
            {
              ticket.issue_reported
            }
          </p>
        </td>

        {/* STATUS */}
        <td className="px-4 py-4">
          <TicketStatusBadge
            blacklisted={
              ticket.is_blacklisted
            }
          />
        </td>

        {/* ACTIONS */}
        <td className="px-4 py-4">
          <div
            className="
              flex
              justify-end
              gap-2
            "
          >
            {/* BLOCK */}
            <ActionButton
              onClick={() =>
                toggleBlock(
                  ticket.ticket_number
                )
              }
              className={
                ticket.is_blacklisted
                  ? `
                    bg-emerald-50
                    text-emerald-700

                    hover:bg-emerald-100
                  `
                  : `
                    bg-amber-50
                    text-amber-700

                    hover:bg-amber-100
                  `
              }
            >
              {ticket.is_blacklisted ? (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Unblock
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4" />
                  Block
                </>
              )}
            </ActionButton>

            {/* DELETE */}
            <ActionButton
              onClick={() =>
                deleteTicket(
                  ticket.ticket_number
                )
              }
              className="
                bg-red-50
                text-red-600

                hover:bg-red-100
              "
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </ActionButton>
          </div>
        </td>
      </tr>

      {/* EXPANDED */}
      {expanded && (
        <tr
          className="
            border-b
            border-violet-100

            bg-violet-50/30
          "
        >
          <td
            colSpan={4}
            className="
              px-4
              pb-5
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
}

const TicketTable = ({
  tickets,
  deleteTicket,
  toggleBlock,
}) => {

  return (
    <div
      className="
        h-full
        overflow-auto
      "
    >
      <table
        className="
          min-w-full
          text-sm
        "
      >
        <thead
          className="
            sticky
            top-0
            z-10

            border-b
            border-violet-200

            bg-violet-50
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
                  px-4
                  py-3

                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide

                  text-violet-700

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
          {tickets.map(
            (ticket) => (
              <TicketRow
                key={
                  ticket.id ||
                  ticket.ticket_number
                }

                ticket={ticket}

                deleteTicket={
                  deleteTicket
                }

                toggleBlock={
                  toggleBlock
                }
              />
            )
          )}
        </tbody>
      </table>
    </div>
  )
}

export default TicketTable