const TicketStatusBadge = ({
  blacklisted,
}) => {

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2

        rounded-2xl

        border

        px-3
        py-1.5

        text-xs
        font-semibold

        ${
          blacklisted
            ? `
              border-red-500/20
              bg-red-500/10
              text-red-400
            `
            : `
              border-emerald-500/20
              bg-emerald-500/10
              text-emerald-400
            `
        }
      `}
    >
      <div
        className={`
          h-2
          w-2

          rounded-full

          ${
            blacklisted
              ? "bg-red-400"
              : "bg-emerald-400"
          }
        `}
      />

      {
        blacklisted
          ? "Blocked"
          : "Active"
      }
    </span>
  )
}

export default TicketStatusBadge