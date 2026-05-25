import { Trash2 } from "lucide-react"

const ManualEntryModalActions = ({
  isEditMode,
  submitting,
  onDelete,
  onSubmit,
}) => {

  return (
    <div className="flex gap-3">

      {/* DELETE BUTTON */}
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

            transition-all
            duration-200

            hover:bg-red-500/20
            hover:text-red-200

            disabled:cursor-not-allowed
            disabled:opacity-60
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

      {/* SUBMIT BUTTON */}
      <button
        onClick={onSubmit}

        disabled={submitting}

        className="
          w-full

          rounded-2xl

          bg-[color:var(--accent)]

          py-3

          font-semibold

          text-[color:var(--background)]

          transition-all
          duration-200

          hover:brightness-105
          hover:scale-[1.01]

          disabled:cursor-not-allowed
          disabled:opacity-60
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