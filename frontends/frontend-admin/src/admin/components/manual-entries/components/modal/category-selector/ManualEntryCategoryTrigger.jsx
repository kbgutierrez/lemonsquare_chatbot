import { ChevronDown } from "lucide-react"

const ManualEntryCategoryTrigger = ({
  category,
  open,
  onClick,
}) => {

  return (
    <button
      type="button"
      onClick={onClick}

      className={`
        flex
        h-12
        w-full
        items-center
        justify-between

        rounded-2xl

        border

        px-4

        text-left
        text-sm

        transition-all
        duration-300

        ${
          open
            ? `
              border-[color:var(--accent)]

              bg-[color:var(--hover)]

              shadow-[0_0_0_4px_rgba(245,213,71,0.08)]
            `
            : `
              theme-border

              bg-[color:var(--panel)]

              hover:bg-[color:var(--hover)]
            `
        }
      `}
    >

      <div
        className="
          flex
          min-w-0
          items-center
          gap-2
        "
      >

        <div
          className={`
            h-2.5
            w-2.5

            shrink-0

            rounded-full

            ${
              category
                ? "bg-[color:var(--accent)]"
                : "bg-[color:var(--text-muted)]"
            }
          `}
        />

        <span
          className={`
            truncate

            ${
              category
                ? "text-[color:var(--text-primary)]"
                : "text-[color:var(--text-secondary)]"
            }
          `}
        >
          {category ||
            "Auto Detect Category"}
        </span>

      </div>

      <ChevronDown
        className={`
          h-4
          w-4

          shrink-0

          text-[color:var(--text-secondary)]

          transition-transform
          duration-300

          ${
            open
              ? "rotate-180"
              : ""
          }
        `}
      />

    </button>
  )
}

export default ManualEntryCategoryTrigger