const ContextItem = ({ title, score, content }) => {
  return (
    <div className="border-b theme-border py-3 last:border-b-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[var(--text-primary)]">{title}</span>
        {score && (
          <span className="rounded-md border theme-border bg-[var(--panel-light)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
            Score: {Number(score).toFixed(3)}
          </span>
        )}
      </div>
      <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[var(--text-secondary)]">
        {content}
      </pre>
    </div>
  )
}

export default ContextItem