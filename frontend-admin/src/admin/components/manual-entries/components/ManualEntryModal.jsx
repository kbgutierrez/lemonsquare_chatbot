import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  X,
  ChevronDown,
  Check,
  Trash2,
} from "lucide-react"

const ManualEntryModal =
  ({
    showModal,
    setShowModal,
    categories,
    submitting,
    error,

    /* CREATE */
    handleCreateEntry,

    /* UPDATE */
    handleUpdateEntry,

    /* DELETE */
    handleDeleteEntry,

    /* EDIT MODE */
    editingEntry = null,
  }) => {

    const dropdownRef =
      useRef(null)

    const [
      dropdownOpen,
      setDropdownOpen,
    ] = useState(false)

    const [form, setForm] =
      useState({
        title: "",
        category: "",
        content: "",
      })

    const isEditMode =
      Boolean(
        editingEntry
      )

    /* ========================================
       SYNC EDIT DATA
    ======================================== */

    useEffect(() => {

      if (
        editingEntry
      ) {

        console.log(
          "EDITING_ENTRY",
          editingEntry
        )

        setForm({
          title:
            editingEntry.title ||
            "",

          category:
            editingEntry.category ||
            "",

          content:
            editingEntry.content ||
            "",
        })

      } else {

        setForm({
          title: "",
          category: "",
          content: "",
        })
      }

    }, [editingEntry])

    /* ========================================
       CLOSE OUTSIDE CLICK
    ======================================== */

    useEffect(() => {

      const handleClickOutside =
        (event) => {

          if (
            dropdownRef.current &&
            !dropdownRef.current.contains(
              event.target
            )
          ) {

            setDropdownOpen(
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

    }, [])

    if (!showModal) {
      return null
    }

    /* ========================================
       RESET FORM
    ======================================== */

    const resetForm =
      () => {

        setForm({
          title: "",
          category: "",
          content: "",
        })
      }

    /* ========================================
       CLOSE MODAL
    ======================================== */

    const closeModal =
      () => {

        resetForm()

        setShowModal(
          false
        )
      }

    /* ========================================
       SUBMIT
    ======================================== */

    const handleSubmit =
      async () => {

        console.log(
          "SUBMIT_FORM",
          form
        )

        if (
          isEditMode
        ) {

          console.log(
            "UPDATING_ENTRY_ID",
            editingEntry?.id
          )

          await handleUpdateEntry(
            editingEntry?.id,
            form,
            closeModal
          )

        } else {

          await handleCreateEntry(
            form,
            resetForm,
            closeModal
          )
        }
      }

    /* ========================================
       DELETE
    ======================================== */

    const handleDelete =
      async () => {

        console.log(
          "DELETING_ENTRY_ID",
          editingEntry?.id
        )

        await handleDeleteEntry(
          editingEntry?.id
        )

        closeModal()
      }

    const selectedCategory =
      form.category ||
      "Auto Detect Category"

    return (
      <div
        className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/50
          p-4
        "
      >
        <div
          className="
            w-full
            max-w-2xl
            rounded-[32px]
            border
            border-[#2a3a33]
            bg-[#111917]
            p-6
            shadow-[0_20px_80px_rgba(0,0,0,0.45)]
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
                text-white
              "
            >
              {isEditMode
                ? "Edit Manual Entry"
                : "Add Manual Entry"}
            </h2>

            <button
              onClick={
                closeModal
              }
              className="
                rounded-xl
                p-2
                transition-all
                hover:bg-white/5
              "
            >
              <X className="text-white" />
            </button>
          </div>

          {/* FORM */}
          <div className="space-y-4">

            {/* ERROR */}
            {error && (
              <div
                className="
                  rounded-2xl
                  border
                  border-red-500/30
                  bg-red-500/10
                  px-4
                  py-3
                  text-sm
                  text-red-300
                "
              >
                {error}
              </div>
            )}

            {/* TITLE */}
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title:
                    e.target.value,
                })
              }
              className="
                w-full
                rounded-2xl
                border
                border-[#2d3b35]
                bg-[#18211f]
                px-4
                py-3
                text-white
                outline-none
                transition-all
                focus:border-[#f5d547]
                focus:ring-2
                focus:ring-[#f5d547]/20
              "
            />

            {/* CATEGORY */}
            <div
              ref={dropdownRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setDropdownOpen(
                    (prev) =>
                      !prev
                  )
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  border-[#2d3b35]
                  bg-[#18211f]
                  px-4
                  py-3
                  text-left
                  text-white
                "
              >
                <span
                  className={`
                    text-sm
                    ${
                      form.category
                        ? "text-white"
                        : "text-[#8ea59b]"
                    }
                  `}
                >
                  {selectedCategory}
                </span>

                <ChevronDown
                  className={`
                    h-4
                    w-4
                    text-[#8ea59b]
                    transition-transform
                    duration-300
                    ${
                      dropdownOpen
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />
              </button>

              {/* DROPDOWN */}
              <div
                className={`
                  absolute
                  left-0
                  right-0
                  top-[calc(100%+10px)]
                  z-50
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#2d3b35]
                  bg-[#18211f]
                  shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                  transition-all
                  duration-300

                  ${
                    dropdownOpen
                      ? `
                        pointer-events-auto
                        translate-y-0
                        opacity-100
                      `
                      : `
                        pointer-events-none
                        -translate-y-2
                        opacity-0
                      `
                  }
                `}
              >

                {/* AUTO DETECT */}
                <button
                  type="button"
                  onClick={() => {

                    setForm({
                      ...form,
                      category: "",
                    })

                    setDropdownOpen(
                      false
                    )
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    border-b
                    border-[#22302b]
                    px-4
                    py-3
                    text-sm
                    text-white
                    hover:bg-[#202b27]
                  "
                >
                  <span>
                    Auto Detect Category
                  </span>

                  {!form.category && (
                    <Check
                      className="
                        h-4
                        w-4
                        text-[#f5d547]
                      "
                    />
                  )}
                </button>

                {/* CATEGORIES */}
                <div
                  className="
                    max-h-[240px]
                    overflow-y-auto
                  "
                >
                  {categories
                    .filter(
                      (category) =>
                        category !==
                        "All"
                    )
                    .map((category) => {

                      const active =
                        form.category ===
                        category

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {

                            setForm({
                              ...form,
                              category,
                            })

                            setDropdownOpen(
                              false
                            )
                          }}
                          className="
                            flex
                            w-full
                            items-center
                            justify-between
                            px-4
                            py-3
                            text-sm
                            text-white
                            hover:bg-[#202b27]
                          "
                        >
                          <span>
                            {category}
                          </span>

                          {active && (
                            <Check
                              className="
                                h-4
                                w-4
                                text-[#f5d547]
                              "
                            />
                          )}
                        </button>
                      )
                    })}
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <textarea
              rows={8}
              placeholder="Knowledge content..."
              value={form.content}
              onChange={(e) =>
                setForm({
                  ...form,
                  content:
                    e.target.value,
                })
              }
              className="
                w-full
                rounded-2xl
                border
                border-[#2d3b35]
                bg-[#18211f]
                px-4
                py-3
                text-white
                outline-none
                transition-all
                focus:border-[#f5d547]
                focus:ring-2
                focus:ring-[#f5d547]/20
              "
            />

            {/* ACTIONS */}
            <div
              className="
                flex
                gap-3
              "
            >

              {/* DELETE */}
              {isEditMode && (
                <button
                  onClick={
                    handleDelete
                  }
                  disabled={
                    submitting
                  }
                  className="
                    flex
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-red-500/30
                    bg-red-500/10
                    px-5
                    text-red-300
                    transition-all
                    hover:bg-red-500/20
                  "
                >
                  <Trash2
                    className="
                      h-5
                      w-5
                    "
                  />
                </button>
              )}

              {/* SUBMIT */}
              <button
                onClick={
                  handleSubmit
                }
                disabled={
                  submitting
                }
                className="
                  w-full
                  rounded-2xl
                  bg-[#f5d547]
                  py-3
                  font-semibold
                  text-[#111917]
                  transition-all
                  duration-200
                  hover:scale-[1.01]
                  hover:brightness-105
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {submitting
                  ? (
                      isEditMode
                        ? "Updating..."
                        : "Creating..."
                    )
                  : (
                      isEditMode
                        ? "Update Entry"
                        : "Create Entry"
                    )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

export default ManualEntryModal