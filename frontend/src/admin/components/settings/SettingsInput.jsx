const SettingsInput = ({
  label,
  ...props
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

      <input
        {...props}
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
      />
    </div>
  )
}

export default SettingsInput