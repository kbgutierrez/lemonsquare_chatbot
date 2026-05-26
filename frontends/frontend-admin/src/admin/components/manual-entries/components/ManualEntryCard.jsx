import { useEffect, useState, useCallback, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Pencil,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Check,
  RotateCcw,
  ChevronRight,
  Minimize2,
} from "lucide-react"

const FieldBlock = ({ title, value, color }) => {
  if (!value) return null
  return (
    <div className="py-3">
      <h3 className={`mb-1 text-sm font-semibold ${color}`}>{title}</h3>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  )
}

const ManualEntryCard = ({
  item,
  submitting,
  handleUpdateEntry,
  handleDeleteEntry,
  handleRestoreEntry,
  allowedCategories = [],
  openEditModal,
}) => {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [form, setForm] = useState({ title: "", category: "", content: "" })

  useEffect(() => {
    setForm({
      title: item?.title || "",
      category: item?.category || "",
      content: item?.content || "",
    })
  }, [item])

  const categoryOptions = [
    ...new Set([...(allowedCategories || []), item?.category].filter(Boolean)),
  ]

  const handleCancel = useCallback(() => {
    setForm({
      title: item?.title || "",
      category: item?.category || "",
      content: item?.content || "",
    })
    setEditing(false)
    setShowCategoryModal(false)
  }, [item])

  const handleSave = useCallback(async () => {
    if (!item?.id) {
      console.error("Missing manual entry ID.")
      return
    }
    await handleUpdateEntry(item.id, form, () => setEditing(false))
  }, [item, form, handleUpdateEntry])

  const handleDelete = useCallback(async () => {
    if (!item?.id) {
      console.error("Missing manual entry ID.")
      return
    }
    await handleDeleteEntry(item.id)
    setShowDeleteModal(false)
    setExpanded(false)
  }, [item, handleDeleteEntry])

  const handleRestore = useCallback(async () => {
    if (!item?.id) {
      console.error("Missing manual entry ID.")
      return
    }
    await handleRestoreEntry(item.id)
    setExpanded(false)
  }, [item, handleRestoreEntry])

  const handleSelectCategory = useCallback((category) => {
    setForm((prev) => ({ ...prev, category }))
    setShowCategoryModal(false)
  }, [])

  const isInactive = !item.is_active

  return (
    <>
      {/* LIST ITEM — flat row, no card */}
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="group flex w-full items-center justify-between border-b theme-border px-4 py-4 text-left transition-colors duration-200 hover:bg-[var(--panel-light)]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`text-[11px] font-semibold ${
                isInactive ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {isInactive ? "Inactive" : "Active"}
            </span>
            <span className="text-[11px] font-semibold text-[var(--accent-green)]">
              {form.category || "General"}
            </span>
            <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {form.title || "Untitled Entry"}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-[var(--text-secondary)]">
            {form.content || "No content available."}
          </p>
        </div>
        <div className="ml-4 flex items-center gap-3">
          <ChevronRight className="h-5 w-5 text-[var(--text-muted)] transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </button>

      {/* EXPANDED MODAL */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[var(--modal-overlay)] p-5 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18 }}
              className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border theme-border bg-[var(--panel)] shadow-[var(--shadow-lg)]"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between border-b theme-border px-6 py-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold ${
                        isInactive ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {isInactive ? "Inactive Entry" : "Active Entry"}
                    </span>
                    <span className="text-xs font-semibold text-[var(--accent-green)]">
                      {form.category || "General"}
                    </span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-[var(--text-primary)]">
                    Manual Knowledge Entry
                  </h2>
                </div>

                <button
                  onClick={() => setExpanded(false)}
                  className="rounded-md border theme-border bg-[var(--panel-light)] p-2 text-[var(--text-secondary)] transition-all hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
                >
                  <Minimize2 className="h-5 w-5" />
                </button>
              </div>

              {/* CONTENT */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {!editing ? (
                  <div className="divide-y theme-border">
                    <FieldBlock title="Title" value={form.title} color="text-[var(--accent-green)]" />
                    <FieldBlock title="Category" value={form.category} color="text-sky-400" />
                    <FieldBlock title="Knowledge Content" value={form.content} color="text-[var(--accent)]" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input
                      value={form.title}
                      disabled={submitting}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      className="input-base w-full"
                    />

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setShowCategoryModal(true)}
                      className="flex w-full items-center justify-between rounded-md border theme-border bg-[var(--panel)] px-4 py-3 text-left text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--accent-green)]/40 hover:bg-[var(--hover)]"
                    >
                      <span className="truncate">{form.category || "Select category"}</span>
                      <ChevronDown className="h-4 w-4 text-[var(--accent-green)]" />
                    </button>

                    <textarea
                      rows={12}
                      value={form.content}
                      disabled={submitting}
                      onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                      className="input-base min-h-[280px] w-full resize-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                )}
              </div>

              {/* FOOTER — rounded-md buttons */}
              <div className="border-t theme-border px-6 py-4">
                {!editing ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditing(true)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-md border border-[var(--accent-green)]/20 bg-[var(--accent-green)]/10 py-3 text-sm font-semibold text-[var(--accent-green)] transition-all hover:bg-[var(--accent-green)]/20"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Entry
                    </button>

                    {isInactive ? (
                      <button
                        disabled={submitting}
                        onClick={handleRestore}
                        className="flex flex-1 items-center justify-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 py-3 text-sm font-semibold text-emerald-400 transition-all hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restore Entry
                      </button>
                    ) : (
                      <button
                        disabled={submitting}
                        onClick={() => setShowDeleteModal(true)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-md border border-red-500/20 bg-red-500/5 py-3 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        Archive Entry
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      disabled={submitting}
                      onClick={handleCancel}
                      className="flex-1 rounded-md border theme-border bg-[var(--panel-light)] py-3 font-medium text-[var(--text-primary)] transition-all hover:bg-[var(--hover)]"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={submitting}
                      onClick={handleSave}
                      className="flex flex-1 items-center justify-center gap-2 rounded-md border border-[var(--accent-green)]/20 bg-[var(--accent-green)]/10 py-3 text-sm font-semibold text-[var(--accent-green)] transition-all hover:bg-[var(--accent-green)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CATEGORY MODAL */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center bg-[var(--modal-overlay)] p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18 }}
              className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-lg border theme-border bg-[var(--panel)] shadow-[var(--shadow-lg)]"
            >
              <div className="shrink-0 border-b theme-border px-6 py-5">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Select Category</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Choose the best category for this manual knowledge entry.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="space-y-2">
                  {categoryOptions.map((category, index) => {
                    const selected = form.category === category
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleSelectCategory(category)}
                        className={`flex w-full items-center justify-between rounded-md border px-4 py-4 text-left transition-all duration-200 ${
                          selected
                            ? "border-[var(--accent-green)]/40 bg-[var(--accent-green)]/10 text-[var(--accent-green)]"
                            : "border-[var(--border)] bg-[var(--panel)] text-[var(--text-primary)] hover:bg-[var(--hover)]"
                        }`}
                        style={{ animationDelay: `${index * 25}ms` }}
                      >
                        <span className="font-medium">{category}</span>
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 ${
                            selected ? "scale-100 bg-[var(--accent-green)] text-[var(--background)]" : "scale-0 opacity-0"
                          }`}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="shrink-0 border-t theme-border px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="w-full rounded-md border theme-border bg-[var(--panel-light)] px-5 py-3 text-sm font-medium text-[var(--text-primary)] transition-all duration-200 hover:bg-[var(--hover)]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] flex items-center justify-center bg-[var(--modal-overlay)] p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-md overflow-hidden rounded-lg border border-red-500/20 bg-[var(--panel)] p-6 shadow-[var(--shadow-lg)]"
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute right-4 top-4 rounded-md p-2 text-[var(--text-secondary)] transition-all hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-md border border-red-500/20 bg-red-500/10">
                <AlertTriangle className="h-7 w-7 text-red-400" />
              </div>

              <h2 className="text-xl font-bold text-[var(--text-primary)]">Archive Manual Entry?</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                This removes the manual knowledge entry from active retrieval while preserving the data for future restoration.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  disabled={submitting}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-md border theme-border bg-[var(--panel-light)] py-3 font-medium text-[var(--text-primary)] transition-all hover:bg-[var(--hover)] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  onClick={handleDelete}
                  className="flex flex-1 items-center justify-center rounded-md bg-red-500 py-3 font-semibold text-white transition-all hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Archive"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default memo(ManualEntryCard)