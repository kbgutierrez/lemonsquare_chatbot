const SettingsInput = ({
  label,
  ...props
}) => {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#74877f]">
          {label}
        </p>
      </div>

      <input
        {...props}
        className="
          w-full
          rounded-2xl
          border
          border-[#2a3732]
          bg-[#141d1a]
          px-4
          py-3.5
          text-sm
          font-medium
          text-white
          outline-none
          transition-all
          duration-200
          placeholder:text-[#667870]
          focus:border-[#f5d547]/30
          focus:bg-[#18211f]
          focus:shadow-[0_0_0_4px_rgba(245,213,71,0.06)]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      />
    </div>
  )
}

export default SettingsInput