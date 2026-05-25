import {
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react"

import {
  useState,
} from "react"

import DeleteConfirmationModal
  from "../modals/DeleteConfirmationModal"

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

  const [
    showArchiveModal,
    setShowArchiveModal,
  ] = useState(false)

  const isInactive =
    file?.is_active === false

  const handleArchive =
    async (
      documentId
    ) => {

      try {

        await onDelete?.(
          documentId
        )

      } finally {

        setShowArchiveModal(
          false
        )
      }
    }

  return (
    <>
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

              hover-surface
            `}

            style={{
              borderColor:
                "var(--border)",

              background:
                "var(--panel-light)",

              color:
                "var(--text-primary)",
            }}
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
              setShowArchiveModal(
                true
              )
            }

            className={`
              ${buttonBaseClass}

              disabled:cursor-not-allowed
              disabled:opacity-60

              hover:brightness-110
            `}

            style={{
              borderColor:
                "rgba(239, 68, 68, 0.22)",

              background:
                "rgba(239, 68, 68, 0.12)",

              color:
                "#ef4444",
            }}
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

              hover:brightness-110
            `}

            style={{
              borderColor:
                "rgba(16, 185, 129, 0.22)",

              background:
                "rgba(16, 185, 129, 0.12)",

              color:
                "#10b981",
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" />

            Restore
          </button>
        )}
      </div>

      {/* ========================================
          GLOBAL PORTAL MODAL
      ======================================== */}

      <DeleteConfirmationModal
        open={
          showArchiveModal
        }

        file={file}

        deleting={deleting}

        onClose={() =>
          setShowArchiveModal(
            false
          )
        }

        onConfirm={
          handleArchive
        }
      />
    </>
  )
}

export default ActionButtons