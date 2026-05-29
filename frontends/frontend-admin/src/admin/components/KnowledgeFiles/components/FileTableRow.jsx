import { FileText } from "lucide-react"
import CategoryBadge from "./CategoryBadge"
import ActionButtons from "./ActionButtons"

const FileTableRow = ({
  file,
  onEdit,
  onDelete,
  onHardDelete,
  onRestore,
  deleting,
}) => {
  const formatDate = (date) => {
    if (!date) return "-"
    return new Date(date).toLocaleString()
  }

  const cellClass =
    "border-b theme-border px-5 py-3.5"

  return (
    <tr className="group transition-colors duration-200 hover:bg-[var(--panel-light)]">
      {/* FILE */}
      <td className={cellClass}>
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 shrink-0 text-[var(--accent)]" />

          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">
              {file.file_name}
            </p>

            <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
              PDF Document
            </p>
          </div>
        </div>
      </td>

      {/* CATEGORY */}
      <td className={cellClass}>
        <CategoryBadge
          category={file.category}
        />
      </td>

      {/* CHUNKS */}
      <td
        className={`${cellClass} text-[13px] font-medium text-[var(--text-primary)]`}
      >
        {file.chunk_count}
      </td>

      {/* DATE */}
      <td
        className={`${cellClass} text-[13px] text-[var(--text-secondary)]`}
      >
        {formatDate(
          file.uploaded_at
        )}
      </td>

      {/* ACTIONS */}
      <td className={cellClass}>
        <ActionButtons
          file={file}
          deleting={deleting}
          onEdit={onEdit}
          onDelete={onDelete}
          onHardDelete={
            onHardDelete
          }
          onRestore={onRestore}
        />
      </td>
    </tr>
  )
}

export default FileTableRow