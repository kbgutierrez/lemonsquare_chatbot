import { useEffect, useState, useCallback } from "react"

import { Pencil, Trash2, Save, X, AlertTriangle } from "lucide-react"

const ManualEntryCard = ({
  item,
  submitting,
  handleUpdateEntry,
  handleDeleteEntry,
}) => {
  const [editing, setEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [form, setForm] = useState({
    title: "",
    category: "",
    content: "",
  })

  /* ========================================
     SYNC ITEM → FORM
  ======================================== */

  useEffect(() => {
    setForm({
      title: item?.title || "",
      category: item?.category || "",
      content: item?.content || "",
    })
  }, [item])

  /* ========================================
     HANDLERS
  ======================================== */

  const handleCancel = useCallback(() => {
    setForm({
      title: item?.title || "",
      category: item?.category || "",
      content: item?.content || "",
    })
    setEditing(false)
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
  }, [item, handleDeleteEntry])

  /* ========================================
     RENDER
  ======================================== */

  return (
    <>
      {/* CARD */}
      <div className="group rounded-3xl border border-[#26332d] bg-[#18211f] p-5 transition-all duration-300 hover:border-[#3a4a43] hover:shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
        {/* TOP */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="rounded-2xl border border-[#95c11f]/10 bg-[#95c11f]/10 px-3 py-1 text-xs font-semibold text-[#95c11f]">
            {form.category || "General"}
          </div>

          <div className="flex items-center gap-2">
            {!editing ? (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-xl border border-[#2d3b35] bg-[#121a18] p-2 text-[#d7e0dc] hover:text-[#f5d547]"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  disabled={submitting}
                  onClick={handleSave}
                  className="rounded-xl border border-[#95c11f]/20 bg-[#95c11f]/10 p-2 text-[#95c11f]"
                >
                  <Save className="h-4 w-4" />
                </button>

                <button
                  onClick={handleCancel}
                  className="rounded-xl border border-[#2d3b35] bg-[#121a18] p-2 text-[#d7e0dc]"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* CONTENT */}
        {editing ? (
          <div className="space-y-4">
            <input
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              className="w-full rounded-2xl border border-[#2d3b35] bg-[#121a18] px-4 py-3 text-white"
            />

            <input
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value }))
              }
              className="w-full rounded-2xl border border-[#2d3b35] bg-[#121a18] px-4 py-3 text-white"
            />

            <textarea
              rows={7}
              value={form.content}
              onChange={(e) =>
                setForm((p) => ({ ...p, content: e.target.value }))
              }
              className="w-full rounded-2xl border border-[#2d3b35] bg-[#121a18] px-4 py-3 text-white"
            />
          </div>
        ) : (
          <>
            <h3 className="mb-3 text-lg font-semibold text-white">
              {form.title}
            </h3>

            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#d7e0dc]">
              {form.content}
            </p>
          </>
        )}
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-red-500/20 bg-[#161f1c] p-6">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-white">Delete Entry?</h2>

            <p className="mt-3 text-sm text-[#9cb0a8]">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-2xl border border-[#2d3b35] bg-[#1b2421] py-3 text-white"
              >
                Cancel
              </button>

              <button
                disabled={submitting}
                onClick={handleDelete}
                className="flex-1 rounded-2xl bg-red-500 py-3 font-semibold text-white"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ManualEntryCard