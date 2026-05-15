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
        border-[#24312b]

        px-5
        py-4
      "
    >
      {/* LEFT */}
      <p
        className="
          text-xs

          tracking-wide

          text-[#74877f]
        "
      >
        Page {currentPage} of{" "}
        {totalPages}
      </p>

      {/* RIGHT */}
      <div className="flex items-center gap-2">

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
            rounded-xl

            border
            border-[#2d3b35]

            bg-[#18211f]

            px-4
            py-2

            text-sm
            font-medium

            text-[#d5dfdb]

            transition-all
            duration-200

            hover:bg-[#1f2a27]

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
            rounded-xl

            border
            border-[#2d3b35]

            bg-[#18211f]

            px-4
            py-2

            text-sm
            font-medium

            text-[#d5dfdb]

            transition-all
            duration-200

            hover:bg-[#1f2a27]

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