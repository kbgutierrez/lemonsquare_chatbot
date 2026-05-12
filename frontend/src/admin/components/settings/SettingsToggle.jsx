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

        flex
        h-8
        w-14
        items-center

        rounded-full

        border

        transition-all
        duration-300

        ${
          value
            ? `
              border-[#f5d547]/30
              bg-[#f5d547]
            `
            : `
              border-[#2d3b35]
              bg-[#1a2421]
            `
        }
      `}
    >
      {/* KNOB */}
      <div
        className={`
          absolute

          flex
          h-6
          w-6
          items-center
          justify-center

          rounded-full

          shadow-lg

          transition-all
          duration-300

          ${
            value
              ? `
                left-[30px]

                bg-[#111917]
              `
              : `
                left-1

                bg-[#dce5e1]
              `
          }
        `}
      >
        <div
          className={`
            h-2
            w-2

            rounded-full

            ${
              value
                ? "bg-[#f5d547]"
                : "bg-[#7f938a]"
            }
          `}
        />
      </div>
    </button>
  )
}

export default SettingsToggle