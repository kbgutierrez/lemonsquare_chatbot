// FILE:
// frontends/frontend-admin/src/admin/components/manual-entries/components/modal/ManualEntryModalActions.jsx

import { Trash2 } from "lucide-react"

const ManualEntryModalActions = ({
  isEditMode,
  submitting,
  onDelete,
  onSubmit,
}) => {
  return (
    <div className="flex gap-3">
      {isEditMode && (
        <button
          onClick={onDelete}
          disabled={submitting}
          className="
            flex
            items-center
            justify-center

            rounded-2xl

            border
            border-red-500/30

            bg-red-500/10

            px-5

            text-red-300
          "
        >
          <Trash2
            className="
              h-5
              w-5
            "
          />
        </button>
      )}

      <button
        onClick={onSubmit}
        disabled={submitting}
        className="
          w-full

          rounded-2xl

          bg-[#f5d547]

          py-3

          font-semibold
          text-[#111917]
        "
      >
        {submitting
          ? isEditMode
            ? "Updating..."
            : "Creating..."
          : isEditMode
          ? "Update Entry"
          : "Create Entry"}
      </button>
    </div>
  )
}

export default ManualEntryModalActions