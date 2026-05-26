import { Pencil, RotateCcw, Trash2 } from "lucide-react"
import { useState } from "react"
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal"

const ActionButtons = ({
  file,
  deleting,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const isInactive = file?.is_active === false || file?.is_active === 0

  const handleArchive = async (documentId) => {
    try {
      await onDelete?.(documentId)
    } finally {
      setShowArchiveModal(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        {!isInactive && (
          <button
            onClick={() => onEdit?.(file)}
            className="flex items-center gap-1.5 rounded-sm border border-[var(--border)] bg-[var(--panel-light)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] transition-all duration-200 hover:bg-[var(--hover)]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}

        {!isInactive && (
          <button
            disabled={deleting}
            onClick={() => setShowArchiveModal(true)}
            className="flex items-center gap-1.5 rounded-sm border border-red-200/30 bg-red-500/5 px-3 py-1.5 text-[12px] font-medium text-red-500 transition-all duration-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Archive
          </button>
        )}

        {isInactive && (
          <button
            onClick={() => onRestore?.(file.document_id)}
            className="flex items-center gap-1.5 rounded-sm border border-emerald-200/30 bg-emerald-500/5 px-3 py-1.5 text-[12px] font-medium text-emerald-500 transition-all duration-200 hover:bg-emerald-500/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restore
          </button>
        )}
      </div>

      <DeleteConfirmationModal
        open={showArchiveModal}
        file={file}
        deleting={deleting}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleArchive}
      />
    </>
  )
}

export default ActionButtons