const TicketPagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
}) => {

  if (
    totalPages <= 1
  ) {
    return null
  }

  return (
    <div
      className="
        flex
        shrink-0
        items-center
        justify-between

        border-t
        border-[var(--border)]

        bg-black/[0.02]

        px-5
        py-4

        dark:bg-white/[0.02]
      "
    >
      {/* LEFT */}
      <p
        className="
          text-xs

          tracking-wide

          text-[var(--text-secondary)]
        "
      >
        Page {currentPage} of{" "}
        {totalPages}
      </p>

      {/* RIGHT */}
      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        {/* PREV */}
        <button
          disabled={
            currentPage === 1
          }

          onClick={() =>
            setCurrentPage(
              (prev) =>
                prev - 1
            )
          }

          className="
            hover-surface

            rounded-l

            border
            border-[var(--border)]

            bg-[var(--panel-light)]

            px-4
            py-2

            text-sm
            font-medium

            text-[var(--text-primary)]

            transition-all
            duration-200

            hover:scale-[1.01]

            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Prev
        </button>

        {/* NEXT */}
        <button
          disabled={
            currentPage ===
            totalPages
          }

          onClick={() =>
            setCurrentPage(
              (prev) =>
                prev + 1
            )
          }

          className="
            hover-surface

            rounded-l

            border
            border-[var(--border)]

            bg-[var(--panel-light)]

            px-4
            py-2

            text-sm
            font-medium

            text-[var(--text-primary)]

            transition-all
            duration-200

            hover:scale-[1.01]

            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default TicketPagination