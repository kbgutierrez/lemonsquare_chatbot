import { Check } from "lucide-react"

const ManualEntryCategoryOption = ({
  active,
  label,
  description,
  onClick,
}) => {

  return (
    <button
      type="button"
      onClick={onClick}

      className={`
        group

        flex
        w-full
        items-center
        justify-between

        rounded-2xl

        border

        px-4
        py-4

        text-left

        transition-all
        duration-200

        ${
          active
            ? `
              border-[color:var(--accent)]/30

              bg-[color:rgba(245,213,71,0.08)]

              shadow-[0_0_0_1px_rgba(245,213,71,0.06)]
            `
            : `
              border-transparent

              bg-[color:var(--panel)]

              hover:border-[color:var(--border)]
              hover:bg-[color:var(--hover)]
            `
        }
      `}
    >

      <div
        className="
          min-w-0
          flex-1
        "
      >

        <p
          className={`
            truncate

            text-sm
            font-medium

            transition-colors
            duration-200

            ${
              active
                ? "text-[color:var(--text-primary)]"
                : "text-[color:var(--text-primary)] group-hover:text-white"
            }
          `}
        >
          {label}
        </p>

        {description && (
          <p
            className="
              mt-1

              text-xs
              leading-relaxed

              text-[color:var(--text-secondary)]
            "
          >
            {description}
          </p>
        )}

      </div>

      {active && (
        <div
          className="
            ml-4

            flex
            h-7
            w-7

            shrink-0
            items-center
            justify-center

            rounded-full

            bg-[color:var(--accent)]

            shadow-[0_0_18px_rgba(245,213,71,0.28)]
          "
        >

          <Check
            className="
              h-4
              w-4

              text-[#111917]
            "
          />

        </div>
      )}

    </button>
  )
}

export default ManualEntryCategoryOption