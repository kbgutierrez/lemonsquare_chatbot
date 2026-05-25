const paginationButtonClassName = `
  hover-surface
  rounded-xl
  border
  px-4
  py-2
  text-sm
  font-medium
  transition-all
  duration-200
  disabled:cursor-not-allowed
  disabled:opacity-40
`

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
        shrink-0
        items-center
        justify-between
        px-5
        py-4
      "
    >
      {/* LEFT */}
      <p
        className="
          text-xs
          tracking-wide
        "
        style={{
          color: "var(--text-secondary)",
        }}
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
          className={
            paginationButtonClassName
          }
          style={{
            borderColor:
              "var(--border)",

            background:
              "var(--panel-light)",

            color:
              "var(--text-primary)",
          }}
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
          className={
            paginationButtonClassName
          }
          style={{
            borderColor:
              "var(--border)",

            background:
              "var(--panel-light)",

            color:
              "var(--text-primary)",
          }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default UploadPagination