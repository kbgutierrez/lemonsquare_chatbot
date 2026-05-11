const TicketPagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
}) => {

  return (
    <div
      className="
        flex
        items-center
        justify-between

        border-t
        border-violet-100

        px-4
        py-3
      "
    >
      <p
        className="
          text-xs
          text-violet-500
        "
      >
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex gap-2">
        <button
          disabled={
            currentPage === 1
          }
          onClick={() =>
            setCurrentPage(
              (prev) => prev - 1
            )
          }
          className="
            rounded-lg
            border
            border-violet-200

            px-3
            py-1

            text-sm

            disabled:opacity-40
          "
        >
          Prev
        </button>

        <button
          disabled={
            currentPage ===
            totalPages
          }
          onClick={() =>
            setCurrentPage(
              (prev) => prev + 1
            )
          }
          className="
            rounded-lg
            border
            border-violet-200

            px-3
            py-1

            text-sm

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