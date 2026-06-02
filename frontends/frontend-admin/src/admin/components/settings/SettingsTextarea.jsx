import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FileText, Edit3 } from "lucide-react"
import PromptEditorModal from "./PromptEditorModal"

const SettingsTextarea = ({
  label,
  value = "",
  onChange,
  placeholder = "",
}) => {
  const [showPreview, setShowPreview] = useState(false)
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="group relative"
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-xl border theme-border bg-[var(--panel)] p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--hover)] hover:shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                {label}
              </p>

              <div className="mt-3 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <FileText className="h-4 w-4" />
                <span>{value?.length || 0} characters</span>
              </div>

              <p className="mt-3 text-sm font-medium text-[var(--accent)]">
                Click to Edit
              </p>
            </div>

            <Edit3 className="h-5 w-5 text-[var(--text-secondary)] transition-all duration-300 group-hover:text-[var(--accent)]" />
          </div>
        </button>

        <AnimatePresence>
          {showPreview && value?.trim() && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.2,
              }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-xl border theme-border bg-[var(--panel-light)] p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Preview
                </div>

                <div className="max-h-[180px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
                  {value}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PromptEditorModal
        open={open}
        title={label}
        value={value}
        placeholder={placeholder}
        onClose={() => setOpen(false)}
        onSave={(newValue) => {
          onChange?.({
            target: {
              value: newValue,
            },
          })

          setOpen(false)
        }}
      />
    </>
  )
}

export default SettingsTextarea