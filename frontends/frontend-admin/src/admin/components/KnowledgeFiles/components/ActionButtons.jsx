import {
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react"

const buttonBaseClass =
  `
    flex
    items-center
    gap-1.5

    rounded-lg

    border

    px-3
    py-2

    text-[12px]
    font-medium

    transition-all
    duration-200
  `

const ActionButtons = ({
  file,
  deleting,
  onEdit,
  onDelete,
  onRestore,
}) => {

  const isInactive =
    file?.is_active === false

  return (
    <div
      className="
        flex
        items-center
        justify-center
        gap-2
      "
    >
      {/* EDIT */}
      {!isInactive && (
        <button
          onClick={() =>
            onEdit?.(file)
          }
          className={`
            ${buttonBaseClass}

            border-[#2d3b35]

            bg-[#18211f]

            text-white

            hover:bg-[#202b27]
          `}
        >
          <Pencil className="h-3.5 w-3.5" />

          Edit
        </button>
      )}

      {/* DELETE */}
      {!isInactive && (
        <button
          disabled={deleting}

          onClick={() =>
            onDelete?.(
              file.document_id
            )
          }

          className={`
            ${buttonBaseClass}

            border-red-500/20

            bg-red-500/10

            text-red-400

            hover:bg-red-500/20

            disabled:cursor-not-allowed
            disabled:opacity-60
          `}
        >
          <Trash2 className="h-3.5 w-3.5" />

          Archive
        </button>
      )}

      {/* RESTORE */}
      {isInactive && (
        <button
          onClick={() =>
            onRestore?.(
              file.document_id
            )
          }

          className={`
            ${buttonBaseClass}

            border-emerald-500/20

            bg-emerald-500/10

            text-emerald-400

            hover:bg-emerald-500/20
          `}
        >
          <RotateCcw className="h-3.5 w-3.5" />

          Restore
        </button>
      )}
    </div>
  )
}

export default ActionButtons