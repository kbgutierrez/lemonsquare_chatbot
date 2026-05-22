// FILE:
// frontends/frontend-admin/src/admin/components/manual-entries/components/modal/ManualEntryModalHeader.jsx

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
          {isEditMode
            ? "Edit Manual Entry"
            : "Add Manual Entry"}
        </h3>

        <p
          className="
            mt-1
            text-sm
            text-[#8ea59b]
          "
        >
          Manage manual knowledge entry information.
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
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default ManualEntryModalHeader