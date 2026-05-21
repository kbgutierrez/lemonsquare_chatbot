import { useEffect, useRef, useState, useCallback } from "react"

import { X, ChevronDown, Check, Trash2 } from "lucide-react"

const ManualEntryModal = ({
  showModal,
  setShowModal,
  categories,
  submitting,
  error,

  handleCreateEntry,
  handleUpdateEntry,
  handleDeleteEntry,

  editingEntry = null,
}) => {
  const dropdownRef = useRef(null)

  const [dropdownOpen, setDropdownOpen] = useState(false)

  const [form, setForm] = useState({
    title: "",
    category: "",
    content: "",
  })

  const isEditMode = Boolean(editingEntry)

  /* ========================================
     SYNC EDIT DATA
  ======================================== */

  useEffect(() => {
    if (!editingEntry) {
      setForm({ title: "", category: "", content: "" })
      return
    }

    setForm({
      title: editingEntry.title || "",
      category: editingEntry.category || "",
      content: editingEntry.content || "",
    })
  }, [editingEntry])

  /* ========================================
     CLOSE DROPDOWN OUTSIDE
  ======================================== */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!showModal) return null

  /* ========================================
     HELPERS
  ======================================== */

  const resetForm = () =>
    setForm({ title: "", category: "", content: "" })

  const closeModal = () => {
    resetForm()
    setShowModal(false)
  }

  const selectedCategory = form.category || "Auto Detect Category"

  /* ========================================
     ACTIONS
  ======================================== */

  const handleSubmit = async () => {
    if (isEditMode) {
      await handleUpdateEntry(editingEntry?.id, form, closeModal)
    } else {
      await handleCreateEntry(form, resetForm, closeModal)
    }
  }

  const handleDelete = async () => {
    await handleDeleteEntry(editingEntry?.id)
    closeModal()
  }

  /* ========================================
     RENDER
  ======================================== */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-[32px] border border-[#2a3a33] bg-[#111917] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {isEditMode ? "Edit Manual Entry" : "Add Manual Entry"}
          </h2>

          <button onClick={closeModal} className="rounded-xl p-2 hover:bg-white/5">
            <X className="text-white" />
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* FORM */}
        <div className="space-y-4">
          {/* TITLE */}
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full rounded-2xl border border-[#2d3b35] bg-[#18211f] px-4 py-3 text-white outline-none focus:border-[#f5d547]"
          />

          {/* CATEGORY */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((p) => !p)}
              className="flex w-full items-center justify-between rounded-2xl border border-[#2d3b35] bg-[#18211f] px-4 py-3 text-white"
            >
              <span className={form.category ? "text-white" : "text-[#8ea59b]"}>
                {selectedCategory}
              </span>

              <ChevronDown
                className={`h-4 w-4 text-[#8ea59b] transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-[#2d3b35] bg-[#18211f]">
                <button
                  type="button"
                  onClick={() => {
                    setForm((p) => ({ ...p, category: "" }))
                    setDropdownOpen(false)
                  }}
                  className="flex w-full justify-between border-b border-[#22302b] px-4 py-3 text-sm text-white hover:bg-[#202b27]"
                >
                  Auto Detect Category
                  {!form.category && <Check className="h-4 w-4 text-[#f5d547]" />}
                </button>

                <div className="max-h-[240px] overflow-y-auto">
                  {categories
                    .filter((c) => c !== "All")
                    .map((category) => {
                      const active = form.category === category

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            setForm((p) => ({ ...p, category }))
                            setDropdownOpen(false)
                          }}
                          className="flex w-full justify-between px-4 py-3 text-sm text-white hover:bg-[#202b27]"
                        >
                          {category}
                          {active && <Check className="h-4 w-4 text-[#f5d547]" />}
                        </button>
                      )
                    })}
                </div>
              </div>
            )}
          </div>

          {/* CONTENT */}
          <textarea
            rows={8}
            placeholder="Knowledge content..."
            value={form.content}
            onChange={(e) =>
              setForm((p) => ({ ...p, content: e.target.value }))
            }
            className="w-full rounded-2xl border border-[#2d3b35] bg-[#18211f] px-4 py-3 text-white outline-none focus:border-[#f5d547]"
          />

          {/* ACTIONS */}
          <div className="flex gap-3">
            {isEditMode && (
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 px-5 text-red-300"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-2xl bg-[#f5d547] py-3 font-semibold text-[#111917]"
            >
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Entry"
                : "Create Entry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManualEntryModal