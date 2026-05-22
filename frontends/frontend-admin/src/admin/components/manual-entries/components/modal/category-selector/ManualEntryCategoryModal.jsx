// FILE:
// frontends/frontend-admin/src/admin/components/manual-entries/components/modal/category-selector/ManualEntryCategoryModal.jsx

import { X } from "lucide-react"

import ManualEntryCategoryOption
  from "./ManualEntryCategoryOption"

const ManualEntryCategoryModal = ({
  open,
  categories,
  selectedCategory,

  onClose,
  onSelect,
}) => {

  if (!open) {
    return null
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[120]

        flex
        items-center
        justify-center

        px-4
      "
    >
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="
          absolute
          inset-0

          bg-black/70
        "
      />

      {/* CARD */}
      <div
        className="
          relative
          z-10

          flex
          w-full
          max-w-[520px]
          flex-col

          overflow-hidden

          rounded-[28px]

          border
          border-[#2f3c36]

          bg-[#141c1a]

          shadow-[0_30px_80px_rgba(0,0,0,0.55)]
        "
      >
        {/* HEADER */}
        <div
          className="
            flex
            items-start
            justify-between
            gap-4

            border-b
            border-[#24312b]

            px-5
            py-5
          "
        >
          <div>
            <h3
              className="
                text-lg
                font-bold
                text-white
              "
            >
              Select Category
            </h3>

            <p
              className="
                mt-1

                text-sm
                text-[#8ea59b]
              "
            >
              Choose a category or use automatic AI detection.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10

              shrink-0
              items-center
              justify-center

              rounded-xl

              border
              border-[#2d3b35]

              bg-[#18211f]

              text-[#8ea59b]

              transition-all
              duration-200

              hover:border-[#46544e]
              hover:text-white
            "
          >
            <X
              className="
                h-4
                w-4
              "
            />
          </button>
        </div>

        {/* OPTIONS */}
        <div
          className="
            max-h-[420px]
            overflow-y-auto

            p-3
          "
        >
          {/* AUTO DETECT */}
          <div className="mb-2">
            <ManualEntryCategoryOption
              active={!selectedCategory}
              label="Auto Detect Category"
              description="Let the AI automatically determine the best category."
              onClick={() =>
                onSelect("")
              }
            />
          </div>

          {/* CATEGORY LIST */}
          <div className="space-y-2">
            {categories.map(
              (category) => {

                const active =
                  selectedCategory ===
                  category

                return (
                  <ManualEntryCategoryOption
                    key={category}
                    active={active}
                    label={category}
                    onClick={() =>
                      onSelect(category)
                    }
                  />
                )
              }
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManualEntryCategoryModal