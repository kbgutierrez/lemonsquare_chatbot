import {
  Pencil,
  Trash2,
} from "lucide-react"

const ActionButtons = ({
  file,
  deleting,
  onEdit,
  onDelete,
}) => {

  return (
    <div
      className="
        flex
        items-center
        justify-center
        gap-3
      "
    >
      {/* EDIT */}
      <button
        onClick={() =>
          onEdit?.(file)
        }
        className="
          flex
          items-center
          gap-2

          rounded-xl

          border
          border-[#2d3b35]

          bg-[#18211f]

          px-4
          py-2.5

          text-sm
          font-medium

          text-white

          transition-all
          duration-200

          hover:bg-[#202b27]
        "
      >
        <Pencil className="h-4 w-4" />

        Edit
      </button>

      {/* DELETE */}
      <button
        disabled={deleting}
        onClick={() =>
          onDelete?.(
            file.document_id
          )
        }
        className="
          flex
          items-center
          gap-2

          rounded-xl

          border
          border-red-500/20

          bg-red-500/10

          px-4
          py-2.5

          text-sm
          font-medium

          text-red-400

          transition-all
          duration-200

          hover:bg-red-500/20

          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        <Trash2 className="h-4 w-4" />

        Delete
      </button>
    </div>
  )
}

export default ActionButtons