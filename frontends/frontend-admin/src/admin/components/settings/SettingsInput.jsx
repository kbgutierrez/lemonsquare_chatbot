const SettingsInput = ({ label, className = "", ...props }) => {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          {label}
        </p>
      </div>
      <input
        {...props}
        className={`input-base text-sm font-medium rounded-md ${className}`}
      />
    </div>
  )
}

export default SettingsInput