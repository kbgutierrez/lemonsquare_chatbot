const SettingsTextarea = ({ label, className = "", ...props }) => {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          {label}
        </p>
      </div>
      <textarea
        {...props}
        className={`input-base resize-none rounded-md py-4 text-sm leading-relaxed ${className}`}
      />
    </div>
  )
}

export default SettingsTextarea