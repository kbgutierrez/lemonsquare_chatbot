const SettingsSelect = ({
  label,
  value,
  onChange,
  options = [],
}) => {

  return (
    <div className="space-y-2">

      <p
        className="
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-violet-500
        "
      >
        {label}
      </p>

      <select
        value={value}
        onChange={onChange}
        className="
          w-full

          rounded-2xl

          border
          border-violet-200

          bg-violet-50/50

          px-4
          py-3

          text-sm

          outline-none

          transition-all
          duration-200

          focus:border-violet-400
          focus:bg-white
        "
      >
        {options.map(
          (option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          )
        )}
      </select>
    </div>
  )
}

export default SettingsSelect