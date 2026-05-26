const FileTableHeader = () => {
  return (
    <thead className="sticky top-0 z-10 bg-[var(--background)]">
      <tr className="border-b theme-border">
        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          File
        </th>
        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Category
        </th>
        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Chunks
        </th>
        <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Uploaded
        </th>
        <th className="px-5 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Actions
        </th>
      </tr>
    </thead>
  )
}

export default FileTableHeader