const statusColor = (s) =>
  ({
    new: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    resolved: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    escalated: "bg-red-500/10 text-red-400 border-red-500/20",
    "in progress": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    open: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    pending: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  }[String(s).toLowerCase()] ||
  "bg-gray-500/10 text-gray-400 border-gray-500/20")

const priorityColor = (p) =>
  ({
    low: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    high: "bg-red-500/10 text-red-400 border-red-500/20",
  }[String(p).toLowerCase()] ||
  "bg-gray-500/10 text-gray-400 border-gray-500/20")

const TicketTable = ({
  tickets,
  onDelete,
  onToggleWhitelist,
  deleting,
  whitelisting,
  isCompact,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#0e1513]">
          <tr className="border-b border-[#26332d]">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#74877f]">
              #
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#74877f]">
              Subject
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#74877f]">
              Status
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#74877f]">
              Priority
            </th>

            {!isCompact && (
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#74877f] md:table-cell">
                Requester
              </th>
            )}

            {!isCompact && (
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#74877f] lg:table-cell">
                Created
              </th>
            )}

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#74877f]">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#18211f]">
          {tickets.map((ticket) => (
            <tr
              key={ticket.ticket_number || ticket.id}
              className="transition-colors hover:bg-[#131b19]"
            >
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-[#f5d547]">
                {ticket.ticket_number}
              </td>

              <td className="max-w-[200px] truncate px-4 py-3 text-[#d5dfdb]">
                {ticket.subject || "(No subject)"}
              </td>

              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-lg border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColor(
                    ticket.status
                  )}`}
                >
                  {ticket.status}
                </span>
              </td>

              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-lg border px-2.5 py-0.5 text-xs font-semibold capitalize ${priorityColor(
                    ticket.priority
                  )}`}
                >
                  {ticket.priority}
                </span>
              </td>

              {!isCompact && (
                <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-[#9cb0a8] md:table-cell">
                  {ticket.requester_email}
                </td>
              )}

              {!isCompact && (
                <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-[#74877f] lg:table-cell">
                  {ticket.created_at
                    ? new Date(ticket.created_at).toLocaleString()
                    : "-"}
                </td>
              )}

              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onToggleWhitelist(
                        ticket.ticket_number,
                        ticket.whitelisted
                      )
                    }
                    disabled={whitelisting === ticket.ticket_number}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      ticket.whitelisted
                        ? "border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                        : "border border-[#2d3b35] bg-[#18211f] text-[#74877f] hover:bg-[#1f2a27] hover:text-white"
                    } disabled:opacity-50`}
                  >
                    {whitelisting === ticket.ticket_number
                      ? "..."
                      : ticket.whitelisted
                      ? "Whitelisted"
                      : "Whitelist"}
                  </button>

                  <button
                    onClick={() => onDelete(ticket.ticket_number)}
                    disabled={deleting === ticket.ticket_number}
                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {deleting === ticket.ticket_number ? "..." : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TicketTable