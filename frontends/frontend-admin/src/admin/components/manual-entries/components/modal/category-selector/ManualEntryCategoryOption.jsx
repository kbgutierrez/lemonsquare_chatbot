// FILE:
// frontends/frontend-admin/src/admin/components/manual-entries/components/modal/category-selector/ManualEntryCategoryOption.jsx

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
              border-[#d8b93d]/30
              bg-[#d8b93d]/10
            `
            : `
              border-transparent
              bg-[#18211f]

              hover:border-[#2f3c36]
              hover:bg-[#1d2724]
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
          className="
            truncate

            text-sm
            font-medium
            text-white
          "
        >
          {label}
        </p>

        {description && (
          <p
            className="
              mt-1

              text-xs
              text-[#8ea59b]
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

            bg-[#f5d547]
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