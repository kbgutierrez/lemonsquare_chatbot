import { useEffect, useRef, useState } from "react"
import { X, ChevronDown, Check } from "lucide-react"

const EditFileModal = ({
  open,
  file,
  categories = [],
  onClose,
  onSave,
}) => {
  const dropdownRef = useRef(null)

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    file_name: "",
    category: "",
  })

  /* ========================================
     SYNC FORM
  ======================================== */
  useEffect(() => {
    if (!file) return

    setForm({
      file_name: file.file_name || "",
      category: file.category || "",
    })
  }, [file])

  /* ========================================
     OUTSIDE CLICK
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

  /* ========================================
     SAVE
  ======================================== */
  const handleSave = async () => {
    if (!file) return

    try {
      setSaving(true)

      await onSave?.(file.document_id, {
        file_name: form.file_name,
        category: form.category,
      })

      onClose?.()
    } catch (error) {
      console.error("SAVE_DOCUMENT_ERROR", error)
    } finally {
      setSaving(false)
    }
  }

  if (!open || !file) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-[32px] border border-[#2a3a33] bg-[#111917] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">

        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Edit Document</h2>

          <button onClick={onClose} className="rounded-xl p-2 hover:bg-white/5">
            <X className="text-white" />
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-4">

          {/* FILE NAME */}
          <input
            value={form.file_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, file_name: e.target.value }))
            }
            placeholder="File name"
            className="w-full rounded-2xl border border-[#2d3b35] bg-[#18211f] px-4 py-3 text-white outline-none focus:border-[#f5d547]"
          />

          {/* CATEGORY */}
          <div ref={dropdownRef} className="relative">

            <button
              type="button"
              onClick={() => setDropdownOpen((p) => !p)}
              className="flex w-full items-center justify-between rounded-2xl border border-[#2d3b35] bg-[#18211f] px-4 py-3 text-white"
            >
              <span>{form.category || "Select category"}</span>

              <ChevronDown
                className={`h-4 w-4 text-[#8ea59b] transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* DROPDOWN */}
            <div
              className={`
                absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-[#2d3b35] bg-[#18211f] shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                transition-all duration-300
                ${
                  dropdownOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0"
                }
              `}
            >
              <div className="max-h-[240px] overflow-y-auto">

                {categories.map((category) => {
                  const active = form.category === category

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setForm((p) => ({ ...p, category }))
                        setDropdownOpen(false)
                      }}
                      className="flex w-full items-center justify-between px-4 py-3 text-sm text-white hover:bg-[#202b27]"
                    >
                      <span>{category}</span>

                      {active && (
                        <Check className="h-4 w-4 text-[#f5d547]" />
                      )}
                    </button>
                  )
                })}

              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="w-full rounded-2xl border border-[#2d3b35] bg-[#18211f] py-3 text-white hover:bg-[#202b27]"
            >
              Cancel
            </button>

            <button
              disabled={saving}
              onClick={handleSave}
              className="w-full rounded-2xl bg-[#f5d547] py-3 font-semibold text-[#111917] disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default EditFileModal