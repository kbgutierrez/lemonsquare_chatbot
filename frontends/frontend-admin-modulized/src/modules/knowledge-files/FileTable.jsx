const statusStyles = (status) =>
  ({
    approved: {
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
    },

    rejected: {
      border: "border-red-500/20",
      bg: "bg-red-500/10",
      text: "text-red-400",
    },

    pending: {
      border: "border-sky-500/20",
      bg: "bg-sky-500/10",
      text: "text-sky-400",
    },
  }[String(status).toLowerCase()] || {
    border: "border-gray-500/20",
    bg: "bg-gray-500/10",
    text: "text-gray-400",
  })

const FileTable = ({ files, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#0e1513]">
          <tr className="border-b border-[#26332d]">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#74877f]">
              File
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#74877f]">
              Status
            </th>

            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#74877f]">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#18211f]">
          {files.map((file) => {
            const styles = statusStyles(file.status)

            return (
              <tr
                key={file.id || file.file_id || file.filename}
                className="transition-colors hover:bg-[#131b19]"
              >
                <td className="px-4 py-3 text-[#d5dfdb]">
                  {file.filename || file.name || "Unnamed File"}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-semibold capitalize ${styles.border} ${styles.bg} ${styles.text}`}
                  >
                    {file.status || "unknown"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(file)}
                      className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-400 transition-colors hover:bg-sky-500/20"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        onDelete(file.id || file.file_id)
                      }
                      className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default FileTable