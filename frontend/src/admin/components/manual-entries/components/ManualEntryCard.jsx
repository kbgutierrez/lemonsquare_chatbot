import {
  useEffect,
  useState,
} from "react"

import {
  Pencil,
  Trash2,
  Save,
  X,
  AlertTriangle,
} from "lucide-react"

const ManualEntryCard =
  ({
    item,
    submitting,
    handleUpdateEntry,
    handleDeleteEntry,
  }) => {

    const [editing,
      setEditing] =
      useState(false)

    const [showDeleteModal,
      setShowDeleteModal] =
      useState(false)

    const [form, setForm] =
      useState({
        title:
          item?.title || "",

        category:
          item?.category || "",

        content:
          item?.content || "",
      })

    /* ========================================
       SYNC FORM WHEN ITEM CHANGES
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
       CANCEL EDIT
    ======================================== */

    const handleCancel =
      () => {

        setForm({
          title:
            item?.title || "",

          category:
            item?.category || "",

          content:
            item?.content || "",
        })

        setEditing(
          false
        )
      }

    /* ========================================
       SAVE
    ======================================== */

    const handleSave =
      async () => {

        if (
          item?.id ===
            undefined ||
          item?.id ===
            null ||
          item?.id === ""
        ) {

          console.error(
            "Missing manual entry ID."
          )

          return
        }

        await handleUpdateEntry(
          item.id,
          form,
          () =>
            setEditing(
              false
            )
        )
      }

    /* ========================================
       DELETE
    ======================================== */

    const handleDelete =
      async () => {

        if (
          item?.id ===
            undefined ||
          item?.id ===
            null ||
          item?.id === ""
        ) {

          console.error(
            "Missing manual entry ID."
          )

          return
        }

        await handleDeleteEntry(
          item.id
        )

        setShowDeleteModal(
          false
        )
      }

    return (
      <>
        {/* CARD */}
        <div
          className="
            group
            rounded-3xl
            border
            border-[#26332d]
            bg-[#18211f]
            p-5
            transition-all
            duration-300
            hover:border-[#3a4a43]
            hover:shadow-[0_10px_40px_rgba(0,0,0,0.25)]
          "
        >

          {/* TOP BAR */}
          <div
            className="
              mb-4
              flex
              items-start
              justify-between
              gap-4
            "
          >

            {/* CATEGORY */}
            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-[#95c11f]/10
                bg-[#95c11f]/10
                px-3
                py-1
                text-xs
                font-semibold
                text-[#95c11f]
              "
            >
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-r
                  from-transparent
                  via-white/10
                  to-transparent
                  opacity-0
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                "
              />

              <span className="relative z-10">
                {form.category ||
                  "General"}
              </span>
            </div>

            {/* ACTIONS */}
            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              {!editing ? (
                <>

                  {/* EDIT */}
                  <button
                    onClick={() =>
                      setEditing(
                        true
                      )
                    }
                    className="
                      flex
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-[#2d3b35]
                      bg-[#121a18]
                      p-2
                      text-[#d7e0dc]
                      transition-all
                      duration-200
                      hover:scale-105
                      hover:border-[#f5d547]
                      hover:text-[#f5d547]
                    "
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() =>
                      setShowDeleteModal(
                        true
                      )
                    }
                    className="
                      flex
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-red-500/20
                      bg-red-500/10
                      p-2
                      text-red-300
                      transition-all
                      duration-200
                      hover:scale-105
                      hover:bg-red-500/20
                    "
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>

                  {/* SAVE */}
                  <button
                    disabled={
                      submitting
                    }
                    onClick={
                      handleSave
                    }
                    className="
                      flex
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-[#95c11f]/20
                      bg-[#95c11f]/10
                      p-2
                      text-[#95c11f]
                      transition-all
                      duration-200
                      hover:scale-105
                      hover:bg-[#95c11f]/20
                      disabled:opacity-60
                    "
                  >
                    <Save className="h-4 w-4" />
                  </button>

                  {/* CANCEL */}
                  <button
                    onClick={
                      handleCancel
                    }
                    className="
                      flex
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-[#2d3b35]
                      bg-[#121a18]
                      p-2
                      text-[#d7e0dc]
                      transition-all
                      duration-200
                      hover:scale-105
                      hover:border-white/20
                    "
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* EDIT MODE */}
          {editing ? (
            <div className="space-y-4">

              <input
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
                  bg-[#121a18]
                  px-4
                  py-3
                  text-white
                  outline-none
                  transition-all
                  focus:border-[#f5d547]
                "
              />

              <input
                value={
                  form.category
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    category:
                      e.target.value,
                  })
                }
                className="
                  w-full
                  rounded-2xl
                  border
                  border-[#2d3b35]
                  bg-[#121a18]
                  px-4
                  py-3
                  text-white
                  outline-none
                  transition-all
                  focus:border-[#95c11f]
                "
              />

              <textarea
                rows={7}
                value={
                  form.content
                }
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
                  bg-[#121a18]
                  px-4
                  py-3
                  text-white
                  outline-none
                  transition-all
                  focus:border-[#f5d547]
                "
              />
            </div>
          ) : (
            <>
              {/* TITLE */}
              <h3
                className="
                  mb-3
                  text-lg
                  font-semibold
                  text-white
                "
              >
                {form.title}
              </h3>

              {/* CONTENT */}
              <p
                className="
                  whitespace-pre-wrap
                  text-sm
                  leading-relaxed
                  text-[#d7e0dc]
                "
              >
                {form.content}
              </p>
            </>
          )}
        </div>

        {/* DELETE MODAL */}
        <div
          className={`
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/60
            backdrop-blur-sm
            transition-all
            duration-300

            ${
              showDeleteModal
                ? `
                  pointer-events-auto
                  opacity-100
                `
                : `
                  pointer-events-none
                  opacity-0
                `
            }
          `}
        >

          {/* MODAL */}
          <div
            className={`
              w-full
              max-w-md
              rounded-[32px]
              border
              border-red-500/20
              bg-[#161f1c]
              p-6
              shadow-[0_20px_80px_rgba(0,0,0,0.45)]
              transition-all
              duration-300

              ${
                showDeleteModal
                  ? `
                    scale-100
                    translate-y-0
                  `
                  : `
                    scale-95
                    translate-y-4
                  `
              }
            `}
          >

            {/* ICON */}
            <div
              className="
                mb-5
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-3xl
                border
                border-red-500/20
                bg-red-500/10
              "
            >
              <AlertTriangle
                className="
                  h-8
                  w-8
                  text-red-400
                "
              />
            </div>

            {/* TITLE */}
            <h2
              className="
                text-2xl
                font-bold
                text-white
              "
            >
              Delete Entry?
            </h2>

            {/* TEXT */}
            <p
              className="
                mt-3
                text-sm
                leading-relaxed
                text-[#9cb0a8]
              "
            >
              This action cannot be undone.
              The AI knowledge linked to this
              entry will also be removed.
            </p>

            {/* BUTTONS */}
            <div
              className="
                mt-6
                flex
                gap-3
              "
            >

              {/* CANCEL */}
              <button
                onClick={() =>
                  setShowDeleteModal(
                    false
                  )
                }
                className="
                  flex-1
                  rounded-2xl
                  border
                  border-[#2d3b35]
                  bg-[#1b2421]
                  py-3
                  font-medium
                  text-white
                  transition-all
                  duration-200
                  hover:bg-[#222d29]
                "
              >
                Cancel
              </button>

              {/* DELETE */}
              <button
                disabled={
                  submitting
                }
                onClick={
                  handleDelete
                }
                className="
                  flex-1
                  rounded-2xl
                  bg-red-500
                  py-3
                  font-semibold
                  text-white
                  transition-all
                  duration-200
                  hover:scale-[1.02]
                  hover:bg-red-400
                  disabled:opacity-60
                "
              >
                {submitting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

export default ManualEntryCard