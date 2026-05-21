import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FileText, X } from "lucide-react"

const ManualEntryModal = ({ open, onClose, onSave, onDelete, entry, loading }) => {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")

  useEffect(() => {
    if (entry) { setTitle(entry.title || ""); setCategory(entry.category || ""); setContent(entry.content || "") }
    else { setTitle(""); setCategory(""); setContent("") }
  }, [entry, open])

  const isEdit = Boolean(entry)

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: "spring", damping: 24, stiffness: 240 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#2a3a33] bg-[#111917] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
            onClick={e => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{isEdit ? "Edit Entry" : "Add Manual Entry"}</h2>
              <button onClick={onClose} className="rounded-xl p-2 text-[#8ea59b] hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-label mb-1.5 block">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Entry title..." className="input-base" />
              </div>
              <div>
                <label className="text-label mb-1.5 block">Category</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., FAQ, Troubleshooting..." className="input-base" />
              </div>
              <div>
                <label className="text-label mb-1.5 block">Content</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} placeholder="Entry content..." className="input-base resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                {isEdit && (
                  <button onClick={() => onDelete(entry)} className="btn-danger">Delete</button>
                )}
                <button onClick={() => onSave({ id: entry?.id, title, category, content })} disabled={loading} className="btn-primary flex-1">
                  {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Entry"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ManualEntryModal
