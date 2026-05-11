const UploadPagination = ({
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
        items-center
        justify-end
        gap-2

        border-t
        border-violet-100

        px-4
        py-3
      "
    >
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
          rounded-lg
          border
          border-violet-200

          px-3
          py-1

          text-sm
          text-violet-700

          disabled:opacity-40
        "
      >
        Prev
      </button>

      <span className="text-sm text-violet-700">
        {currentPage} / {totalPages}
      </span>

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
          rounded-lg
          border
          border-violet-200

          px-3
          py-1

          text-sm
          text-violet-700

          disabled:opacity-40
        "
      >
        Next
      </button>
    </div>
  )
}

export default UploadPagination