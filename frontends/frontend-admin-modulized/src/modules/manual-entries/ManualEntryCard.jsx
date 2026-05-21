import { FileText, Clock, Tag } from "lucide-react"

const ManualEntryCard = ({ entry, onEdit, onDelete }) => {
  return (
    <div className="rounded-2xl border border-[#2a3a33] bg-[#141d1a] p-4 transition-all hover:border-[#f5d547]/10">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#2d3b35] bg-[#18211f]">
            <FileText className="h-4 w-4 text-[#f5d547]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{entry.title || "Untitled Entry"}</p>
            {entry.category && (
              <span className="inline-flex items-center gap-1 rounded-md border border-[#2d3b35] bg-[#18211f] px-1.5 py-0.5 text-[10px] font-medium text-[#74877f]">
                <Tag className="h-2.5 w-2.5" /> {entry.category}
              </span>
            )}
          </div>
        </div>
      </div>
      {entry.content && (
        <p className="mb-3 text-xs leading-relaxed text-[#9cb0a8] line-clamp-3">{entry.content}</p>
      )}
      <div className="flex items-center justify-between">
        {entry.created_at && (
          <span className="flex items-center gap-1 text-xs text-[#74877f]">
            <Clock className="h-3 w-3" /> {new Date(entry.created_at).toLocaleDateString()}
          </span>
        )}
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(entry)} className="rounded-lg border border-[#2d3b35] bg-[#18211f] px-3 py-1 text-xs font-semibold text-[#d5dfdb] hover:bg-[#1f2a27]">
            Edit
          </button>
          <button onClick={() => onDelete(entry)} className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default ManualEntryCard
