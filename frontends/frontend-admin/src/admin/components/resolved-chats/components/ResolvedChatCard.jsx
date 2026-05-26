import { useState, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X, RotateCcw, Archive, ChevronRight, Minimize2 } from "lucide-react"
import { parseResolvedChat } from "../utils/parseResolvedChat"

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

const ResolvedChatCard = ({ item, lifecycle = "active", onDelete, onRestore }) => {
  const [expanded, setExpanded] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const parsed = parseResolvedChat(item.content)
  const isInactive = lifecycle === "inactive"

  const handleDelete = async () => {
    try {
      setLoading(true)
      await onDelete(item.id)
      setShowDeleteModal(false)
      setExpanded(false)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    try {
      setLoading(true)
      await onRestore?.(item.id)
      setExpanded(false)
    } finally {
      setLoading(false)
    }
  }

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
                isInactive ? "text-[var(--text-muted)]" : "text-[var(--accent)]"
              }`}
            >
              {isInactive ? "Inactive" : "Active"}
            </span>
            <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {item.source}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-[var(--text-secondary)]">
            {parsed["Issue Reported"] || "No issue summary available."}
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
                        isInactive ? "text-[var(--text-muted)]" : "text-[var(--accent)]"
                      }`}
                    >
                      {isInactive ? "Inactive Chat" : "Resolved Chat"}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)]">{item.source}</span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-[var(--text-primary)]">
                    AI Learned Conversation
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
                <div className="divide-y theme-border">
                  <FieldBlock
                    title="Issue Reported"
                    value={parsed["Issue Reported"]}
                    color="text-[var(--accent)]"
                  />
                  <FieldBlock
                    title="Issue Found"
                    value={parsed["Issue Found"]}
                    color="text-[var(--accent-green)]"
                  />
                  <FieldBlock
                    title="Root Cause"
                    value={parsed["Root Cause"]}
                    color="text-orange-400"
                  />
                  <FieldBlock
                    title="Work Done"
                    value={parsed["Work Done"]}
                    color="text-sky-400"
                  />
                </div>
              </div>

              {/* FOOTER — rounded-md buttons */}
              <div className="border-t theme-border px-6 py-4">
                {isInactive ? (
                  <button
                    disabled={loading}
                    onClick={handleRestore}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 py-3 text-sm font-semibold text-emerald-500 transition-all hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {loading ? "Restoring..." : "Restore Chat"}
                  </button>
                ) : (
                  <button
                    disabled={loading}
                    onClick={() => setShowDeleteModal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-red-500/20 bg-red-500/5 py-3 text-sm font-semibold text-red-500 transition-all hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Archive className="h-4 w-4" />
                    Archive Chat
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL — rounded-md buttons */}
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

              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Archive Resolved Chat?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                This removes the AI memory from active retrieval while preserving the data for future restoration.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-md border theme-border bg-[var(--panel-light)] py-3 font-medium text-[var(--text-primary)] transition-all hover:bg-[var(--hover)]"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  onClick={handleDelete}
                  className="flex-1 rounded-md bg-red-500 py-3 font-semibold text-white transition-all hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Archiving..." : "Archive"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default memo(ResolvedChatCard)