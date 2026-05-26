const ManualEntriesPagination = ({ page, setPage, totalPages }) => {
  if (!totalPages || totalPages <= 1) return null

  const safeTotalPages = Math.max(1, totalPages)

  const handlePageChange = (number) => {
    if (number < 1 || number > safeTotalPages) return
    setPage(number)
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: safeTotalPages }, (_, i) => i + 1).map((number) => {
        const isActive = page === number
        return (
          <button
            key={number}
            type="button"
            disabled={isActive}
            onClick={() => handlePageChange(number)}
            className={`h-9 w-9 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "cursor-default rounded-md bg-[var(--accent)] text-[var(--background)]"
                : "rounded-md border theme-border bg-[var(--panel)] text-[var(--text-primary)] hover:bg-[var(--hover)]"
            }`}
          >
            {number}
          </button>
        )
      })}
    </div>
  )
}

export default ManualEntriesPagination