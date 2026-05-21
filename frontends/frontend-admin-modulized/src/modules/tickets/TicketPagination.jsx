const TicketPagination = ({ page, setPage, totalPages }) => {
  if (totalPages <= 1) return null
  return (
    <div className="flex shrink-0 items-center justify-between border-t border-[#24312b] px-5 py-4">
      <p className="text-xs tracking-wide text-[#74877e]">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-2">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
          className="rounded-xl border border-[#2d3b35] bg-[#18211f] px-4 py-2 text-sm font-medium text-[#d5dfdb] transition-all hover:bg-[#1f2a27] disabled:cursor-not-allowed disabled:opacity-40">Prev</button>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
          className="rounded-xl border border-[#2d3b35] bg-[#18211f] px-4 py-2 text-sm font-medium text-[#d5dfdb] transition-all hover:bg-[#1f2a27] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
      </div>
    </div>
  )
}

export default TicketPagination
