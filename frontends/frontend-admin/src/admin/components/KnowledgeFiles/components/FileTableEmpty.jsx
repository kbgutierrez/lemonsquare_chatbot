import { FileText } from "lucide-react"

const FileTableEmpty = () => {
  return (
    <tr>
      <td colSpan={5} className="px-6 py-24 text-center">
        <div className="flex flex-col items-center justify-center">
          <FileText className="mb-5 h-10 w-10 text-[var(--accent)] opacity-40" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            No documents found
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
            Uploaded knowledge documents will appear here once added into the AI system.
          </p>
        </div>
      </td>
    </tr>
  )
}

export default FileTableEmpty