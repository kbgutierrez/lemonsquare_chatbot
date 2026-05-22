const Pagination = ({
  page,
  setPage,
  totalPages,
}) => {

  if (totalPages <= 1) {
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

        px-5
        py-4
      "
    >
      <p
        className="
          text-xs
          tracking-wide

          text-[var(--text-secondary)]
        "
      >
        Page {page} of {totalPages}
      </p>

      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <button
          disabled={page === 1}
          onClick={() =>
            setPage((p) => p - 1)
          }
          className="
            panel-base
            hover-surface

            rounded-xl

            px-4
            py-2

            text-sm
            font-medium

            text-[var(--text-primary)]

            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Prev
        </button>

        <button
          disabled={page === totalPages}
          onClick={() =>
            setPage((p) => p + 1)
          }
          className="
            panel-base
            hover-surface

            rounded-xl

            px-4
            py-2

            text-sm
            font-medium

            text-[var(--text-primary)]

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

export default Pagination