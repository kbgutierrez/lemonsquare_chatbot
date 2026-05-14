import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  FileText,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  Check,
} from "lucide-react"

import {
  API_CONFIG,
} from "../../../config/sqlVariables"

const API_URL =
  `${API_CONFIG.BASE_URL}/documents`

const FileTable = ({
  files = [],
  refreshFiles,
}) => {

  const [editingFile, setEditingFile] =
    useState(null)

  const [saving, setSaving] =
    useState(false)

  const [deleting, setDeleting] =
    useState(false)

  const [dropdownOpen, setDropdownOpen] =
    useState(false)

  const dropdownRef =
    useRef(null)

  const [form, setForm] =
    useState({
      file_name: "",
      category: "",
    })

  /* ========================================
     OUTSIDE CLICK
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

  /* ========================================
     CATEGORY OPTIONS
  ======================================== */

  const categories =
    [
      ...new Set(
        files
          .map(
            (file) =>
              file.category
          )
          .filter(Boolean)
      ),
    ]

  /* ========================================
     FORMAT DATE
  ======================================== */

  const formatDate =
    (date) => {

      if (!date)
        return "-"

      return new Date(
        date
      ).toLocaleString()
    }

  /* ========================================
     OPEN EDIT
  ======================================== */

  const openEdit =
    (file) => {

      setEditingFile(file)

      setForm({
        file_name:
          file.file_name || "",

        category:
          file.category || "",
      })
    }

  /* ========================================
     CLOSE EDIT
  ======================================== */

  const closeEdit =
    () => {

      setEditingFile(null)

      setDropdownOpen(
        false
      )

      setForm({
        file_name: "",
        category: "",
      })
    }

  /* ========================================
     SAVE EDIT
  ======================================== */

  const handleSave =
    async () => {

      if (
        !editingFile
      ) {
        return
      }

      try {

        setSaving(true)

        const response =
          await fetch(
            `${API_URL}/${editingFile.document_id}`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    file_name:
                      form.file_name,

                    category:
                      form.category,
                  }
                ),
            }
          )

        if (
          !response.ok
        ) {

          throw new Error(
            "Failed to update document"
          )
        }

        await refreshFiles?.()

        closeEdit()

      } catch (error) {

        console.error(
          "UPDATE_DOCUMENT_ERROR",
          error
        )

      } finally {

        setSaving(false)
      }
    }

  /* ========================================
     DELETE FILE
  ======================================== */

  const handleDelete =
    async (
      documentId
    ) => {

      const confirmed =
        window.confirm(
          "Are you sure you want to permanently delete this document?"
        )

      if (!confirmed) {
        return
      }

      try {

        setDeleting(true)

        const response =
          await fetch(
            `${API_URL}/${documentId}`,
            {
              method:
                "DELETE",
            }
          )

        if (
          !response.ok
        ) {

          throw new Error(
            "Failed to delete document"
          )
        }

        await refreshFiles?.()

      } catch (error) {

        console.error(
          "DELETE_DOCUMENT_ERROR",
          error
        )

      } finally {

        setDeleting(false)
      }
    }

  return (
    <>
      <div
        className="
          h-full
          overflow-auto

          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        <table
          className="
            w-full
            min-w-[900px]

            border-separate
            border-spacing-0
          "
        >
          {/* HEADER */}
          <thead
            className="
              sticky
              top-0
              z-10

              bg-[#121a18]/95

              backdrop-blur-xl
            "
          >
            <tr>

              <th
                className="
                  border-b
                  border-[#24312b]

                  px-6
                  py-4

                  text-left
                  text-[11px]
                  font-semibold
                  uppercase

                  tracking-[0.18em]

                  text-[#70847b]
                "
              >
                File
              </th>

              <th
                className="
                  border-b
                  border-[#24312b]

                  px-6
                  py-4

                  text-left
                  text-[11px]
                  font-semibold
                  uppercase

                  tracking-[0.18em]

                  text-[#70847b]
                "
              >
                Category
              </th>

              <th
                className="
                  border-b
                  border-[#24312b]

                  px-6
                  py-4

                  text-left
                  text-[11px]
                  font-semibold
                  uppercase

                  tracking-[0.18em]

                  text-[#70847b]
                "
              >
                Chunks
              </th>

              <th
                className="
                  border-b
                  border-[#24312b]

                  px-6
                  py-4

                  text-left
                  text-[11px]
                  font-semibold
                  uppercase

                  tracking-[0.18em]

                  text-[#70847b]
                "
              >
                Uploaded
              </th>

              <th
                className="
                  border-b
                  border-[#24312b]

                  px-6
                  py-4

                  text-center
                  text-[11px]
                  font-semibold
                  uppercase

                  tracking-[0.18em]

                  text-[#70847b]
                "
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {files.length ===
              0 && (
              <tr>
                <td
                  colSpan={5}
                  className="
                    px-6
                    py-24

                    text-center
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      items-center
                      justify-center
                    "
                  >
                    <div
                      className="
                        mb-5

                        flex
                        h-20
                        w-20
                        items-center
                        justify-center

                        rounded-3xl

                        border
                        border-[#2a3732]

                        bg-[#18211f]
                      "
                    >
                      <FileText
                        className="
                          h-8
                          w-8

                          text-[#f5d547]
                        "
                      />
                    </div>

                    <h3
                      className="
                        text-lg
                        font-semibold

                        text-white
                      "
                    >
                      No documents found
                    </h3>

                    <p
                      className="
                        mt-2

                        max-w-sm

                        text-sm
                        leading-relaxed

                        text-[#80958b]
                      "
                    >
                      Uploaded knowledge
                      documents will appear
                      here once added into
                      the AI system.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {files.map((file) => {

              return (
                <tr
                  key={
                    file.document_id
                  }
                  className="
                    group

                    transition-all
                    duration-200

                    hover:bg-[#18211f]/70
                  "
                >
                  {/* FILE */}
                  <td
                    className="
                      border-b
                      border-[#202b27]

                      px-6
                      py-5
                    "
                  >
                    <div className="flex items-center gap-4">

                      <div
                        className="
                          flex
                          h-12
                          w-12
                          shrink-0
                          items-center
                          justify-center

                          rounded-2xl

                          border
                          border-[#2a3732]

                          bg-[#18211f]
                        "
                      >
                        <FileText
                          className="
                            h-5
                            w-5

                            text-[#f5d547]
                          "
                        />
                      </div>

                      <div className="min-w-0">

                        <p
                          className="
                            truncate

                            text-sm
                            font-medium

                            text-white
                          "
                        >
                          {
                            file.file_name
                          }
                        </p>

                        <p
                          className="
                            mt-1

                            text-xs

                            text-[#70847b]
                          "
                        >
                          PDF Document
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td
                    className="
                      border-b
                      border-[#202b27]

                      px-6
                      py-5
                    "
                  >
                    <span
                      className="
                        inline-flex
                        items-center

                        rounded-2xl

                        border
                        border-[#2d3b35]

                        bg-[#18211f]

                        px-3
                        py-1.5

                        text-xs
                        font-medium

                        text-[#d4dfdb]
                      "
                    >
                      {file.category}
                    </span>
                  </td>

                  {/* CHUNKS */}
                  <td
                    className="
                      border-b
                      border-[#202b27]

                      px-6
                      py-5

                      text-sm
                      font-medium

                      text-white
                    "
                  >
                    {
                      file.chunk_count
                    }
                  </td>

                  {/* DATE */}
                  <td
                    className="
                      border-b
                      border-[#202b27]

                      px-6
                      py-5

                      text-sm

                      text-[#8ca097]
                    "
                  >
                    {formatDate(
                      file.uploaded_at
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td
                    className="
                      border-b
                      border-[#202b27]

                      px-6
                      py-5
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-center
                        gap-3
                      "
                    >
                      {/* EDIT */}
                      <button
                        onClick={() =>
                          openEdit(
                            file
                          )
                        }
                        className="
                          flex
                          items-center
                          gap-2

                          rounded-xl

                          border
                          border-[#2d3b35]

                          bg-[#18211f]

                          px-4
                          py-2.5

                          text-sm
                          font-medium

                          text-white

                          transition-all
                          duration-200

                          hover:bg-[#202b27]
                        "
                      >
                        <Pencil className="h-4 w-4" />

                        Edit
                      </button>

                      {/* DELETE */}
                      <button
                        disabled={
                          deleting
                        }
                        onClick={() =>
                          handleDelete(
                            file.document_id
                          )
                        }
                        className="
                          flex
                          items-center
                          gap-2

                          rounded-xl

                          border
                          border-red-500/20

                          bg-red-500/10

                          px-4
                          py-2.5

                          text-sm
                          font-medium

                          text-red-400

                          transition-all
                          duration-200

                          hover:bg-red-500/20
                        "
                      >
                        <Trash2 className="h-4 w-4" />

                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ========================================
         EDIT MODAL
      ======================================== */}

      {editingFile && (
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
              max-w-xl

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
                Edit Document
              </h2>

              <button
                onClick={
                  closeEdit
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

              {/* FILE NAME */}
              <input
                value={
                  form.file_name
                }

                onChange={(e) =>
                  setForm({
                    ...form,
                    file_name:
                      e.target.value,
                  })
                }

                placeholder="File name"

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
                  <span>
                    {
                      form.category
                    }
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
                  <div
                    className="
                      max-h-[240px]
                      overflow-y-auto
                    "
                  >
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
                      }
                    )}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div
                className="
                  flex
                  gap-3
                "
              >
                <button
                  onClick={
                    closeEdit
                  }

                  className="
                    w-full

                    rounded-2xl

                    border
                    border-[#2d3b35]

                    bg-[#18211f]

                    py-3

                    font-medium

                    text-white

                    transition-all

                    hover:bg-[#202b27]
                  "
                >
                  Cancel
                </button>

                <button
                  disabled={
                    saving
                  }

                  onClick={
                    handleSave
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
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FileTable