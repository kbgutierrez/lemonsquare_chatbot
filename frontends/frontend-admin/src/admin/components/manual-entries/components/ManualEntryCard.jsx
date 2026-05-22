import {
  useEffect,
  useState,
  useCallback,
} from "react"

import {
  Pencil,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Check,
} from "lucide-react"

const ManualEntryCard = ({
  item,
  submitting,
  handleUpdateEntry,
  handleDeleteEntry,
  allowedCategories = [],
}) => {

  const [
    editing,
    setEditing,
  ] = useState(false)

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false)

  const [
    showCategoryModal,
    setShowCategoryModal,
  ] = useState(false)

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
      title:
        item?.title || "",

      category:
        item?.category || "",

      content:
        item?.content || "",
    })

  }, [item])

  /* ========================================
     CATEGORY OPTIONS
  ======================================== */

  const categoryOptions = [
    ...new Set(
      [
        ...(allowedCategories || []),

        item?.category,
      ].filter(Boolean)
    ),
  ]

  /* ========================================
     HANDLERS
  ======================================== */

  const handleCancel =
    useCallback(() => {

      setForm({
        title:
          item?.title || "",

        category:
          item?.category || "",

        content:
          item?.content || "",
      })

      setEditing(false)

      setShowCategoryModal(false)

    }, [item])

  const handleSave =
    useCallback(async () => {

      if (!item?.id) {

        console.error(
          "Missing manual entry ID."
        )

        return
      }

      await handleUpdateEntry(
        item.id,
        form,
        () => setEditing(false)
      )

    }, [
      item,
      form,
      handleUpdateEntry,
    ])

  const handleDelete =
    useCallback(async () => {

      if (!item?.id) {

        console.error(
          "Missing manual entry ID."
        )

        return
      }

      await handleDeleteEntry(
        item.id
      )

      setShowDeleteModal(false)

    }, [
      item,
      handleDeleteEntry,
    ])

  const handleSelectCategory =
    useCallback((category) => {

      setForm((prev) => ({
        ...prev,
        category,
      }))

      setShowCategoryModal(false)

    }, [])

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
                  onClick={() =>
                    setEditing(true)
                  }
                  className="rounded-xl border border-[#2d3b35] bg-[#121a18] p-2 text-[#d7e0dc] transition-all duration-200 hover:scale-105 hover:text-[#f5d547]"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <button
                  onClick={() =>
                    setShowDeleteModal(true)
                  }
                  className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-300 transition-all duration-200 hover:scale-105 hover:opacity-90"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  disabled={submitting}
                  onClick={handleSave}
                  className="flex items-center justify-center rounded-xl border border-[#95c11f]/20 bg-[#95c11f]/10 p-2 text-[#95c11f] transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </button>

                <button
                  disabled={submitting}
                  onClick={handleCancel}
                  className="rounded-xl border border-[#2d3b35] bg-[#121a18] p-2 text-[#d7e0dc] transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
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

            {/* TITLE */}
            <input
              value={form.title}
              disabled={submitting}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  title:
                    e.target.value,
                }))
              }
              className="w-full rounded-2xl border border-[#2d3b35] bg-[#121a18] px-4 py-3 text-white outline-none transition-all duration-200 focus:border-[#95c11f] focus:shadow-[0_0_0_3px_rgba(149,193,31,0.08)]"
            />

            {/* CATEGORY TRIGGER */}
            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                setShowCategoryModal(true)
              }
              className="flex w-full items-center justify-between rounded-2xl border border-[#2d3b35] bg-[#121a18] px-4 py-3 text-left text-white transition-all duration-200 hover:border-[#95c11f]/40 hover:bg-[#18211f] hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="truncate">
                {form.category ||
                  "Select category"}
              </span>

              <ChevronDown className="h-4 w-4 text-[#95c11f]" />
            </button>

            {/* CONTENT */}
            <textarea
              rows={7}
              value={form.content}
              disabled={submitting}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  content:
                    e.target.value,
                }))
              }
              className="w-full rounded-2xl border border-[#2d3b35] bg-[#121a18] px-4 py-3 text-white outline-none transition-all duration-200 focus:border-[#95c11f] focus:shadow-[0_0_0_3px_rgba(149,193,31,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-200">

          <div className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-[32px] border border-[#2f3d37] bg-[#161f1c] shadow-[0_20px_80px_rgba(0,0,0,0.45)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

            {/* HEADER */}
            <div className="shrink-0 border-b border-[#26332d] px-6 py-5">

              <h2 className="text-2xl font-bold text-white">
                Select Category
              </h2>

              <p className="mt-1 text-sm text-[#8ca29a]">
                Choose the best category for this manual knowledge entry.
              </p>
            </div>

            {/* CATEGORY LIST */}
            <div className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

              <div className="space-y-2">

                {categoryOptions.map(
                  (category, index) => {

                    const selected =
                      form.category ===
                      category

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          handleSelectCategory(
                            category
                          )
                        }
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
                          selected
                            ? "border-[#95c11f]/40 bg-[#95c11f]/10 text-[#dff7a3] shadow-[0_10px_30px_rgba(149,193,31,0.08)]"
                            : "border-[#26332d] bg-[#121a18] text-[#d7e0dc] hover:border-[#3a4a43] hover:bg-[#18211f] hover:scale-[1.01]"
                        }`}
                        style={{
                          animationDelay:
                            `${index * 25}ms`,
                        }}
                      >
                        <span className="font-medium">
                          {category}
                        </span>

                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 ${
                            selected
                              ? "bg-[#95c11f] text-[#101710] scale-100"
                              : "scale-0 opacity-0"
                          }`}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                      </button>
                    )
                  }
                )}

              </div>
            </div>

            {/* FOOTER */}
            <div className="shrink-0 border-t border-[#26332d] px-6 py-4">

              <button
                type="button"
                onClick={() =>
                  setShowCategoryModal(false)
                }
                className="w-full rounded-2xl border border-[#2d3b35] bg-[#1b2421] px-5 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-[#3d4b45] hover:bg-[#202b27]"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-[32px] border border-red-500/20 bg-[#161f1c] p-6 animate-in zoom-in-95 duration-200">

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-white">
              Delete Entry?
            </h2>

            <p className="mt-3 text-sm text-[#9cb0a8]">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">

              <button
                disabled={submitting}
                onClick={() =>
                  setShowDeleteModal(false)
                }
                className="flex-1 rounded-2xl border border-[#2d3b35] bg-[#1b2421] py-3 text-white transition-all duration-200 hover:bg-[#202b27] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                disabled={submitting}
                onClick={handleDelete}
                className="flex flex-1 items-center justify-center rounded-2xl bg-red-500 py-3 font-semibold text-white transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ManualEntryCard