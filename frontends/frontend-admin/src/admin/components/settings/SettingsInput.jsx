const SettingsInput = ({
  label,
  className = "",
  ...props
}) => {

  return (
    <div className="space-y-3">

      {/* LABEL */}
      <div>
        <p
          className="
            text-[11px]
            font-semibold
            uppercase

            tracking-[0.18em]

            text-[var(--text-secondary)]
          "
        >
          {label}
        </p>
      </div>

      {/* INPUT */}
      <input
        {...props}
        className={`
          input-base

          text-sm
          font-medium

          ${className}
        `}
      />
    </div>
  )
}

export default SettingsInput