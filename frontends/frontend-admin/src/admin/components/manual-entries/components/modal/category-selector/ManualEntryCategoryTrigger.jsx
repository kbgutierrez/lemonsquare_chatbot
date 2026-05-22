// FILE:
// frontends/frontend-admin/src/admin/components/manual-entries/components/modal/category-selector/ManualEntryCategoryTrigger.jsx

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
              border-[#d8b93d]/50
              bg-[#1f2925]
              shadow-[0_0_0_4px_rgba(216,185,61,0.08)]
            `
            : `
              border-[#2f3c36]
              bg-[#1a2320]

              hover:border-[#46544e]
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
                ? "bg-[#f5d547]"
                : "bg-[#6f847b]"
            }
          `}
        />

        <span
          className={`
            truncate

            ${
              category
                ? "text-white"
                : "text-[#8ea59b]"
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

          text-[#8ea59b]

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