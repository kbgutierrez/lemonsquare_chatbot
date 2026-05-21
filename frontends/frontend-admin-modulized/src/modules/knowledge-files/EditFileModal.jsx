import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FileText, X } from "lucide-react"

const STATUS_OPTIONS = ["approved", "review", "rejected", "pending"]

const EditFileModal = ({ file, onClose, onSave, saving }) => {
  const [title, setTitle] = useState(file?.title || "")
  const [status, setStatus] = useState(file?.status || "review")
  if (!file) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ type: "spring", damping: 24, stiffness: 240 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#2a3a33] bg-[#111917] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
          onClick={e => e.stopPropagation()}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Edit File</h2>
            <button onClick={onClose} className="rounded-xl p-2 text-[#8ea59b] hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-[#2a3a33] bg-[#18211f] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#2d3b35] bg-[#18211f]">
                <FileText className="h-5 w-5 text-[#f5d547]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{file.filename || file.name || "(Unnamed)"}</p>
                <p className="text-xs text-[#74877f]">{file.id || file.document_id}</p>
              </div>
            </div>
            <div>
              <label className="text-label mb-1.5 block">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="File title..." className="input-base" />
            </div>
            <div>
              <label className="text-label mb-1.5 block">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="input-base appearance-none bg-[#151d1b]">
                {STATUS_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-[#111917]">{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => onSave(file.id || file.document_id, title, status)} disabled={saving} className="btn-primary flex-1">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default EditFileModal
