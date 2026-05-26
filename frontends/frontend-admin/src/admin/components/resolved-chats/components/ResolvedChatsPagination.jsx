const ResolvedChatsPagination = ({ page, setPage, totalPages }) => {
  if (totalPages <= 1) return null

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
        const isActive = page === number
        return (
          <button
            key={number}
            onClick={() => setPage(number)}
            className={`
              h-9 w-9 rounded-md border text-sm font-semibold transition-all duration-200
              ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent)] text-[#111917]"
                  : "theme-border bg-[var(--panel)] text-[var(--text-primary)] hover:bg-[var(--hover)]"
              }
            `}
          >
            {number}
          </button>
        )
      })}
    </div>
  )
}

export default ResolvedChatsPagination