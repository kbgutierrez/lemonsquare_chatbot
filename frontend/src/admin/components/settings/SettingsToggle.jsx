const SettingsToggle = ({
  value,
  onChange,
}) => {

  return (
    <button
      type="button"

      onClick={() =>
        onChange(!value)
      }

      className={`
        relative
        h-7
        w-12

        rounded-full

        transition-all
        duration-300

        ${
          value
            ? "bg-violet-600"
            : "bg-slate-300"
        }
      `}
    >
      <div
        className={`
          absolute
          top-1

          h-5
          w-5

          rounded-full
          bg-white

          transition-all
          duration-300

          ${
            value
              ? "left-6"
              : "left-1"
          }
        `}
      />
    </button>
  )
}

export default SettingsToggle