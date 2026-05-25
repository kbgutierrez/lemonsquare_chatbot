import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  X,
  ChevronDown,
  Check,
} from "lucide-react"

import {
  createPortal,
} from "react-dom"

const EditFileModal = ({
  open,
  file,
  categories = [],
  onClose,
  onSave,
}) => {
  const modalCardRef =
    useRef(null)

  const categoryModalRef =
    useRef(null)

  const [
    categoryModalOpen,
    setCategoryModalOpen,
  ] = useState(false)

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [form, setForm] =
    useState({
      file_name: "",
      category: "",
    })

  /* ========================================
     SYNC FORM
  ======================================== */
  useEffect(() => {
    if (!file) return

    setForm({
      file_name:
        file.file_name || "",

      category:
        file.category || "",
    })
  }, [file])

  /* ========================================
     BODY LOCK
  ======================================== */
  useEffect(() => {
    if (
      !open &&
      !categoryModalOpen
    ) {
      return
    }

    const originalOverflow =
      document.body.style
        .overflow

    document.body.style.overflow =
      "hidden"

    return () => {
      document.body.style.overflow =
        originalOverflow
    }
  }, [
    open,
    categoryModalOpen,
  ])

  /* ========================================
     ESC CLOSE
  ======================================== */
  useEffect(() => {
    if (!open) return

    const handleEscape =
      (event) => {

        if (
          event.key !==
          "Escape"
        ) {
          return
        }

        if (
          categoryModalOpen
        ) {
          setCategoryModalOpen(
            false
          )

          return
        }

        onClose?.()
      }

    document.addEventListener(
      "keydown",
      handleEscape
    )

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      )
    }
  }, [
    open,
    onClose,
    categoryModalOpen,
  ])

  /* ========================================
     OUTSIDE CLICK
  ======================================== */
  useEffect(() => {
    if (!open) return

    const handleClickOutside =
      (event) => {

        if (
          categoryModalOpen
        ) {
          return
        }

        if (
          modalCardRef.current &&
          !modalCardRef.current.contains(
            event.target
          )
        ) {
          onClose?.()
        }
      }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }
  }, [
    open,
    onClose,
    categoryModalOpen,
  ])

  /* ========================================
     CATEGORY MODAL OUTSIDE CLICK
  ======================================== */
  useEffect(() => {
    if (!categoryModalOpen) {
      return
    }

    const handleClickOutside =
      (event) => {
        if (
          categoryModalRef.current &&
          !categoryModalRef.current.contains(
            event.target
          )
        ) {
          setCategoryModalOpen(
            false
          )
        }
      }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }
  }, [categoryModalOpen])

  /* ========================================
     SAVE
  ======================================== */
  const handleSave =
    async () => {
      if (!file) return

      try {
        setSaving(true)

        await onSave?.(
          file.document_id,
          {
            file_name:
              form.file_name,

            category:
              form.category,
          }
        )

        onClose?.()

      } catch (error) {

        console.error(
          "SAVE_DOCUMENT_ERROR",
          error
        )

      } finally {
        setSaving(false)
      }
    }

  if (!open || !file) {
    return null
  }

  return createPortal(
    <>
      {/* MAIN MODAL */}
      <div
        className="
          fixed
          inset-0
          z-[999]

          flex
          items-center
          justify-center

          p-4
        "
      >
        {/* BACKDROP */}
        <div
          className="
            absolute
            inset-0

            backdrop-blur-md
          "
          style={{
            background:
              "var(--modal-overlay)",
          }}
        />

        {/* MODAL */}
        <div
          ref={modalCardRef}

          className="
            modal-surface
            relative
            z-10

            w-full
            max-w-xl

            rounded-[32px]

            p-6
          "
        >
          {/* HEADER */}
          <div
            className="
              mb-6
              flex
              items-center
              justify-between
            "
          >
            <h2
              className="
                text-xl
                font-bold
              "
              style={{
                color:
                  "var(--text-primary)",
              }}
            >
              Edit Document
            </h2>

            <button
              onClick={onClose}

              className="
                hover-surface
                rounded-xl
                border
                p-2
              "
              style={{
                borderColor:
                  "var(--border)",

                background:
                  "var(--panel-light)",

                color:
                  "var(--text-primary)",
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* FORM */}
          <div className="space-y-4">

            {/* FILE NAME */}
            <input
              value={
                form.file_name
              }

              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  file_name:
                    e.target.value,
                }))
              }

              placeholder="File name"

              className="
                input-base
              "
            />

            {/* CATEGORY */}
            <button
              type="button"

              onClick={() =>
                setCategoryModalOpen(
                  true
                )
              }

              className="
                hover-surface
                flex
                w-full
                items-center
                justify-between

                rounded-2xl
                border

                px-4
                py-3
              "
              style={{
                borderColor:
                  "var(--border)",

                background:
                  "var(--panel-light)",

                color:
                  "var(--text-primary)",
              }}
            >
              <span>
                {form.category ||
                  "Select category"}
              </span>

              <ChevronDown
                className="
                  h-4
                  w-4
                "
                style={{
                  color:
                    "var(--text-secondary)",
                }}
              />
            </button>

            {/* ACTIONS */}
            <div
              className="
                flex
                gap-3
              "
            >
              <button
                onClick={onClose}

                className="
                  hover-surface
                  w-full

                  rounded-2xl
                  border

                  py-3
                "
                style={{
                  borderColor:
                    "var(--border)",

                  background:
                    "var(--panel-light)",

                  color:
                    "var(--text-primary)",
                }}
              >
                Cancel
              </button>

              <button
                disabled={saving}

                onClick={
                  handleSave
                }

                className="
                  w-full

                  rounded-2xl

                  py-3

                  font-semibold

                  transition-all
                  duration-200

                  disabled:opacity-70
                "
                style={{
                  background:
                    "var(--accent)",

                  color:
                    "#111917",
                }}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY MODAL */}
      {categoryModalOpen && (
        <div
          className="
            fixed
            inset-0
            z-[1000]

            flex
            items-center
            justify-center

            p-4
          "
        >
          {/* BACKDROP */}
          <div
            className="
              absolute
              inset-0

              backdrop-blur-md
            "
            style={{
              background:
                "rgba(0,0,0,0.45)",
            }}
          />

          {/* CATEGORY CARD */}
          <div
            ref={categoryModalRef}

            className="
              modal-surface
              relative
              z-10

              flex
              w-full
              max-w-[520px]
              flex-col

              overflow-hidden

              rounded-[28px]
            "
          >
            {/* HEADER */}
            <div
              className="
                flex
                items-start
                justify-between
                gap-4

                px-5
                py-5
              "
              style={{
                borderBottom:
                  "1px solid var(--border)",
              }}
            >
              <div>
                <h3
                  className="
                    text-lg
                    font-bold
                  "
                  style={{
                    color:
                      "var(--text-primary)",
                  }}
                >
                  Select Category
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                  "
                  style={{
                    color:
                      "var(--text-secondary)",
                  }}
                >
                  Choose a document category.
                </p>
              </div>

              <button
                type="button"

                onClick={() =>
                  setCategoryModalOpen(
                    false
                  )
                }

                className="
                  hover-surface
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center

                  rounded-xl
                  border
                "
                style={{
                  borderColor:
                    "var(--border)",

                  background:
                    "var(--panel-light)",

                  color:
                    "var(--text-primary)",
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* OPTIONS */}
            <div
              className="
                max-h-[420px]
                overflow-y-auto
                p-3
              "
            >
              <div className="space-y-2">
                {categories.map(
                  (category) => {

                    const active =
                      form.category ===
                      category

                    return (
                      <button
                        key={category}

                        type="button"

                        onClick={() => {

                          setForm(
                            (p) => ({
                              ...p,
                              category,
                            })
                          )

                          setCategoryModalOpen(
                            false
                          )
                        }}

                        className="
                          hover-surface
                          flex
                          w-full
                          items-center
                          justify-between

                          rounded-2xl
                          border

                          px-4
                          py-4

                          text-left
                          transition-all
                          duration-200
                        "
                        style={{
                          borderColor:
                            active
                              ? "rgba(245, 213, 71, 0.25)"
                              : "transparent",

                          background:
                            active
                              ? "rgba(245, 213, 71, 0.10)"
                              : "var(--panel-light)",
                        }}
                      >
                        <span
                          className="
                            text-sm
                            font-medium
                          "
                          style={{
                            color:
                              "var(--text-primary)",
                          }}
                        >
                          {category}
                        </span>

                        {active && (
                          <div
                            className="
                              flex
                              h-7
                              w-7
                              items-center
                              justify-center

                              rounded-full
                            "
                            style={{
                              background:
                                "var(--accent)",
                            }}
                          >
                            <Check
                              className="
                                h-4
                                w-4
                              "
                              style={{
                                color:
                                  "#111917",
                              }}
                            />
                          </div>
                        )}
                      </button>
                    )
                  }
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  )
}

export default EditFileModal