import {
  useEffect,
  useState,
} from "react"

import {
  Pencil,
  Trash2,
  Save,
  X,
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

        console.log(
          "CARD_UPDATE_ITEM",
          item
        )

        console.log(
          "CARD_UPDATE_ID",
          item?.id
        )

        console.log(
          "CARD_UPDATE_FORM",
          form
        )

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

        console.log(
          "CARD_DELETE_ITEM",
          item
        )

        console.log(
          "CARD_DELETE_ID",
          item?.id
        )

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
      }

    return (
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
                  onClick={
                    handleDelete
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

            {/* TITLE */}
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

            {/* CATEGORY */}
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

            {/* CONTENT */}
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
    )
  }

export default ManualEntryCard