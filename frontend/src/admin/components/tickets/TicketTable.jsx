import {
  Ban,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  MessageSquareText,
} from "lucide-react"

import {
  useState,
} from "react"

import TicketStatusBadge
  from "./TicketStatusBadge"

const DetailBlock = ({
  value,
}) => {

  if (!value)
    return null

  return (
    <div
      className="
        rounded-3xl

        border
        border-[#293731]

        bg-[#141d1a]

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

            bg-[#f5d547]/10
          "
        >
          <MessageSquareText
            className="
              h-5
              w-5

              text-[#f5d547]
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

              text-[#74877f]
            "
          >
            Ticket Details
          </p>

          <p
            className="
              mt-1

              text-sm
              font-medium

              text-white
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

          text-[#d4dfdb]
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
  disabled = false,
  ...props
}) => (
  <button
    disabled={disabled}
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

      disabled:cursor-not-allowed
      disabled:opacity-50

      ${className}
    `}
  >
    {children}
  </button>
)

const TicketRow = ({
  ticket,
  blockTicket,
}) => {

  const [expanded, setExpanded] =
    useState(false)

  return (
    <>
      <tr
        className="
          group

          border-b
          border-[#202b27]

          transition-all
          duration-200

          hover:bg-[#18211f]/70
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
            onClick={() =>
              setExpanded(
                (prev) => !prev
              )
            }
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
                border-[#2d3b35]

                bg-[#141d1a]
              "
            >
              {expanded ? (
                <ChevronUp
                  className="
                    h-4
                    w-4

                    text-[#f5d547]
                  "
                />
              ) : (
                <ChevronDown
                  className="
                    h-4
                    w-4

                    text-[#74877f]
                  "
                />
              )}
            </div>

            <div className="text-left">
              <p
                className="
                  text-sm
                  font-semibold

                  text-white
                "
              >
                {
                  ticket.ticket_number
                }
              </p>

              <p
                className="
                  mt-1

                  text-xs

                  text-[#74877f]
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

              text-[#d4dfdb]
            "
          >
            {
              ticket.issue_reported
            }
          </p>
        </td>

        {/* STATUS */}
        <td
          className="
            px-6
            py-5
          "
        >
          <TicketStatusBadge
            blacklisted={
              ticket.is_blacklisted
            }
          />
        </td>

        {/* ACTIONS */}
        <td
          className="
            px-6
            py-5
          "
        >
          <div
            className="
              flex
              justify-end
              gap-3
            "
          >
            <ActionButton
              disabled={
                ticket.is_blacklisted
              }
              onClick={() =>
                blockTicket(
                  ticket.ticket_number
                )
              }
              className={
                ticket.is_blacklisted
                  ? `
                    border
                    border-emerald-500/20

                    bg-emerald-500/10

                    text-emerald-400
                  `
                  : `
                    border
                    border-amber-500/20

                    bg-amber-500/10

                    text-amber-300

                    hover:bg-amber-500/20
                  `
              }
            >
              {ticket.is_blacklisted ? (
                <>
                  <ShieldCheck className="h-4 w-4" />

                  <span className="hidden xl:inline">
                    Blocked
                  </span>
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4" />

                  <span className="hidden xl:inline">
                    Block Ticket
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
            border-[#202b27]

            bg-[#141d1a]/70
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
}

const TicketTable = ({
  tickets,
  blockTicket,
}) => {

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
        {/* HEADER */}
        <thead
          className="
            sticky
            top-0
            z-10

            bg-[#101715]/95

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
                  border-[#24312b]

                  px-6
                  py-4

                  text-[11px]
                  font-semibold
                  uppercase

                  tracking-[0.18em]

                  text-[#74877f]

                  ${
                    label ===
                    "Actions"
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

        {/* BODY */}
        <tbody>
          {tickets.length ===
            0 && (
            <tr>
              <td
                colSpan={4}
                className="
                  px-6
                  py-24

                  text-center
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center
                  "
                >
                  <div
                    className="
                      mb-5

                      flex
                      h-20
                      w-20
                      items-center
                      justify-center

                      rounded-3xl

                      border
                      border-[#2a3732]

                      bg-[#141d1a]
                    "
                  >
                    <MessageSquareText
                      className="
                        h-8
                        w-8

                        text-[#f5d547]
                      "
                    />
                  </div>

                  <h3
                    className="
                      text-lg
                      font-semibold

                      text-white
                    "
                  >
                    No tickets found
                  </h3>

                  <p
                    className="
                      mt-2

                      max-w-sm

                      text-sm
                      leading-relaxed

                      text-[#80958b]
                    "
                  >
                    Support tickets will
                    appear here once users
                    submit requests.
                  </p>
                </div>
              </td>
            </tr>
          )}

          {tickets.map(
            (ticket) => (
              <TicketRow
                key={
                  ticket.id ||
                  ticket.ticket_number
                }

                ticket={ticket}

                blockTicket={
                  blockTicket
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