import {
  useRef,
  useMemo,
} from "react"

import {
  Pencil,
  Trash2,
  FileText,
} from "lucide-react"

import EmptyState
  from "../../shared/components/EmptyState.jsx"

import {
  useHorizontalDragScroll,
} from "../../shared/hooks/useHorizontalDragScroll.js"

const resolveCategoryStyles =
  (category) => {

    const value =
      String(
        category || ""
      ).toLowerCase()

    if (
      value.includes(
        "approved"
      )
    ) {

      return {
        border:
          "border-emerald-500/20",

        bg:
          "bg-emerald-500/10",

        text:
          "text-emerald-400",
      }
    }

    if (
      value.includes(
        "rejected"
      )
    ) {

      return {
        border:
          "border-red-500/20",

        bg:
          "bg-red-500/10",

        text:
          "text-red-400",
      }
    }

    return {
      border:
        "border-sky-500/20",

      bg:
        "bg-sky-500/10",

      text:
        "text-sky-400",
    }
  }

const resolveFileName =
  (file) => {

    return (
      file.file_name ||
      file.filename ||
      file.name ||
      file.title ||
      file.source ||
      "Unnamed File"
    )
  }

const resolveFileId =
  (file) => {

    return (
      file.document_id ||
      file.id ||
      file.file_id ||
      resolveFileName(file)
    )
  }

const formatDate =
  (date) => {

    if (!date) {

      return "-"
    }

    try {

      return new Date(
        date
      ).toLocaleString()

    } catch {

      return "-"
    }
  }

const FileTable = ({
  files = [],
  onEdit,
  onDelete,
}) => {

  const tableRef =
    useRef(null)

  useHorizontalDragScroll(
    tableRef
  )

  const normalizedFiles =
    useMemo(() => {

      return Array.isArray(
        files
      )
        ? files
        : []
    }, [files])

  const hasFiles =
    normalizedFiles.length > 0

  return (
    <div
      ref={tableRef}

      className="
        h-full

        cursor-grab
        overflow-auto

        active:cursor-grabbing

        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      {hasFiles ? (
        <table
          className="
            w-full
            min-w-[1050px]

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
            "
          >
            <tr
              className="
                bg-[#0e1513]
              "
            >
              <th
                className="
                  border-b
                  border-[#26332d]

                  px-5
                  py-4

                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider

                  text-[#74877f]
                "
              >
                File
              </th>

              <th
                className="
                  border-b
                  border-[#26332d]

                  px-5
                  py-4

                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider

                  text-[#74877f]
                "
              >
                Category
              </th>

              <th
                className="
                  border-b
                  border-[#26332d]

                  px-5
                  py-4

                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider

                  text-[#74877f]
                "
              >
                Uploaded
              </th>

              <th
                className="
                  border-b
                  border-[#26332d]

                  px-5
                  py-4

                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider

                  text-[#74877f]
                "
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {normalizedFiles.map(
              (file) => {

                const styles =
                  resolveCategoryStyles(
                    file.category
                  )

                return (
                  <tr
                    key={resolveFileId(file)}

                    className="
                      transition-colors
                      duration-150

                      hover:bg-[#131b19]
                    "
                  >
                    {/* FILE */}
                    <td
                      className="
                        border-b
                        border-[#18211f]

                        px-5
                        py-4
                      "
                    >
                      <div className="flex items-center gap-3">

                        <div
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center

                            rounded-2xl
                            border
                            border-[#26332d]

                            bg-[#18211f]
                          "
                        >
                          <FileText className="h-4.5 w-4.5 text-[#f5d547]" />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p
                            className="
                              truncate

                              text-sm
                              font-medium

                              text-[#d5dfdb]
                            "
                          >
                            {resolveFileName(
                              file
                            )}
                          </p>

                          <p
                            className="
                              mt-0.5

                              truncate

                              text-xs

                              text-[#74877f]
                            "
                          >
                            {resolveFileId(
                              file
                            )}
                          </p>

                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td
                      className="
                        border-b
                        border-[#18211f]

                        px-5
                        py-4
                      "
                    >
                      <span
                        className={`
                          inline-flex
                          rounded-lg
                          border

                          px-2.5
                          py-1

                          text-xs
                          font-semibold

                          ${styles.border}
                          ${styles.bg}
                          ${styles.text}
                        `}
                      >
                        {file.category ||
                          "Uncategorized"}
                      </span>
                    </td>

                    {/* UPLOADED */}
                    <td
                      className="
                        border-b
                        border-[#18211f]

                        px-5
                        py-4

                        text-sm
                        text-[#9aac9f]
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
                        border-[#18211f]

                        px-5
                        py-4
                      "
                    >
                      <div className="flex items-center gap-2">

                        <button
                          onClick={() =>
                            onEdit?.(file)
                          }

                          className="
                            flex
                            items-center
                            gap-1.5

                            rounded-xl
                            border
                            border-sky-500/20

                            bg-sky-500/10

                            px-3
                            py-2

                            text-xs
                            font-semibold

                            text-sky-400

                            transition-colors

                            hover:bg-sky-500/20
                          "
                        >
                          <Pencil className="h-3.5 w-3.5" />

                          Edit
                        </button>

                        <button
                          onClick={() =>
                            onDelete?.(file)
                          }

                          className="
                            flex
                            items-center
                            gap-1.5

                            rounded-xl
                            border
                            border-red-500/20

                            bg-red-500/10

                            px-3
                            py-2

                            text-xs
                            font-semibold

                            text-red-400

                            transition-colors

                            hover:bg-red-500/20
                          "
                        >
                          <Trash2 className="h-3.5 w-3.5" />

                          Delete
                        </button>

                      </div>
                    </td>
                  </tr>
                )
              }
            )}
          </tbody>
        </table>
      ) : (
        <div className="py-16">
          <EmptyState
            title="No files found"
            message="No uploaded knowledge files found."
          />
        </div>
      )}
    </div>
  )
}

export default FileTable