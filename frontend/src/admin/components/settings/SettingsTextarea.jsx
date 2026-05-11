const SettingsTextarea = ({
  label,
  ...props
}) => {

  return (
    <div>
      <p
        className="
          mb-2

          font-semibold
          text-slate-800
        "
      >
        {label}
      </p>

      <textarea
        {...props}
        className="
          w-full
          resize-none

          rounded-2xl

          border
          border-violet-200

          bg-violet-50/50

          px-4
          py-3

          text-sm

          outline-none

          focus:border-violet-400
        "
      />
    </div>
  )
}

export default SettingsTextarea