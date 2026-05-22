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
              border-[var(--accent)]/25
              bg-[var(--accent)]
            `
            : `
              border-[var(--border)]
              bg-[var(--panel-light)]
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

                bg-[#1b211e]
              `
              : `
                left-1

                bg-[var(--panel)]
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
                ? `
                  bg-[var(--accent)]
                `
                : `
                  bg-[var(--text-secondary)]
                `
            }
          `}
        />
      </div>
    </button>
  )
}

export default SettingsToggle