
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, Check } from "lucide-react"

const PromptEditorModal = ({
  open,
  title,
  value = "",
  placeholder = "",
  onClose,
  onSave,
}) => {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value || "")
  }, [value])

  useEffect(() => {
    if (!open) return

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose?.()
      }
    }

    window.addEventListener("keydown", handleEscape)

    return () => {
      window.removeEventListener("keydown", handleEscape)
    }
  }, [open, onClose])

  const handleSave = () => {
    onSave?.(draft)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            transition={{
              duration: 0.2,
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border theme-border bg-[var(--panel)] shadow-[var(--shadow-lg)]">
              <div className="flex items-center justify-between border-b theme-border p-5">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {title}
                  </h3>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Edit prompt draft
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 transition-colors hover:bg-[var(--hover)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden p-5">
                <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={placeholder}
                className="input-base h-[55vh] w-full resize-none rounded-xl py-4 text-sm leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 border-t theme-border p-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border theme-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--hover)]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#111917]"
                >
                  <Check className="h-4 w-4" />
                  Save Draft
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default PromptEditorModal
