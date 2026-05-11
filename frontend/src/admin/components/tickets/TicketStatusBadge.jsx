const TicketStatusBadge = ({
  blacklisted,
}) => {

  return (
    <span
      className={`
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold

        ${
          blacklisted
            ? `
              bg-red-100
              text-red-700
            `
            : `
              bg-emerald-100
              text-emerald-700
            `
        }
      `}
    >
      {
        blacklisted
          ? "Blocked"
          : "Active"
      }
    </span>
  )
}

export default TicketStatusBadge