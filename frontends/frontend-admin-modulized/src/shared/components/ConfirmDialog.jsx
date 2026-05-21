import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"
import Modal from "./Modal.jsx"

const ConfirmDialog = ({ open, onClose, onConfirm, title = "Confirm Action", message = "Are you sure?", confirmLabel = "Confirm", danger = true, loading = false }) => {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center">
        <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border ${danger ? "border-red-500/20 bg-red-500/10" : "border-[#2d3b35] bg-[#18211f]"}`}>
          <AlertTriangle className={`h-8 w-8 ${danger ? "text-red-400" : "text-[#f5d547]"}`} />
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm text-[#9cb0a8]">{message}</p>
        <div className="mt-6 flex w-full gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button disabled={loading} onClick={onConfirm} className={`flex-1 ${danger ? "btn-danger" : "btn-primary"}`}>
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
