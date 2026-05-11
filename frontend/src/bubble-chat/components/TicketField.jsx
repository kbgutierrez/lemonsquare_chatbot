const TicketField = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  disabled = false,
  max,
}) => {
  return (
    <div className="min-w-0 max-w-full">
      {/* HEADER */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <label
          className="
            flex
            min-w-0
            items-center
            gap-2

            text-sm
            font-medium
            text-slate-700
          "
        >
          {Icon && (
            <Icon
              className="
                h-4
                w-4
                shrink-0
                text-violet-500
              "
            />
          )}

          <span className="truncate">
            {label}
          </span>
        </label>

        {max && (
          <span
            className="
              shrink-0

              text-xs
              text-slate-400
            "
          >
            {value.length}/{max}
          </span>
        )}
      </div>

      {/* INPUT */}
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) =>
          onChange?.(e.target.value)
        }
        placeholder={placeholder}
        className="
          block

          w-full
          min-w-0
          max-w-full

          overflow-hidden

          truncate

          rounded-2xl

          border
          border-violet-200

          bg-violet-50/50

          px-4
          py-3

          text-sm
          text-slate-700

          outline-none

          transition-all
          duration-200

          focus:border-violet-400
          focus:bg-white
        "
      />
    </div>
  )
}

export default TicketField