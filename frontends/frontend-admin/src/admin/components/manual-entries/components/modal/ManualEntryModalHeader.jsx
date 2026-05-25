import { X } from "lucide-react"

const ManualEntryModalHeader = ({
  isEditMode,
  onClose,
}) => {

  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-4

        border-b
        theme-border

        px-5
        py-5
      "
    >

      {/* LEFT */}
      <div>

        <h3
          className="
            text-lg
            font-bold

            text-[color:var(--text-primary)]
          "
        >
          {isEditMode
            ? "Edit Manual Entry"
            : "Add Manual Entry"}
        </h3>

        <p
          className="
            mt-1
            text-sm

            text-[color:var(--text-secondary)]
          "
        >
          Manage manual knowledge entry information.
        </p>

      </div>

      {/* CLOSE BUTTON */}
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
          theme-border

          bg-[color:var(--panel)]

          text-[color:var(--text-secondary)]

          transition-all
          duration-200

          hover:bg-[color:var(--hover)]
          hover:text-[color:var(--text-primary)]
        "
      >

        <X className="h-4 w-4" />

      </button>

    </div>
  )
}

export default ManualEntryModalHeader