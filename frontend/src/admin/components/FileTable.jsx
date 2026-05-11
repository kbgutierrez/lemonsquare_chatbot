import {
  Trash2,
  ShieldCheck,
  ShieldOff,
} from "lucide-react"

const FileTable = ({
  files = [],
  onToggleFile,
  onDeleteFile,
}) => {

  const formatDate =
    (date) => {

      if (!date)
        return "-"

      return new Date(
        date
      ).toLocaleString()
    }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead
          className="
            border-b
            border-violet-200
            bg-violet-50
          "
        >
          <tr>
            <th
              className="
                px-6
                py-3
                text-left
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-violet-900
              "
            >
              File Name
            </th>

            <th
              className="
                px-6
                py-3
                text-left
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-violet-900
              "
            >
              Category
            </th>

            <th
              className="
                px-6
                py-3
                text-left
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-violet-900
              "
            >
              Chunks
            </th>

            <th
              className="
                px-6
                py-3
                text-left
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-violet-900
              "
            >
              Uploaded
            </th>

            <th
              className="
                px-6
                py-3
                text-left
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-violet-900
              "
            >
              AI Status
            </th>

            <th
              className="
                px-6
                py-3
                text-center
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-violet-900
              "
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody
          className="
            divide-y
            divide-violet-100
          "
        >
          {files.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="
                  px-6
                  py-10
                  text-center
                  text-sm
                  text-violet-400
                "
              >
                No uploaded documents found
              </td>
            </tr>
          )}

          {files.map((file) => {

            const isActive =
              file.is_active !== false

            return (
              <tr
                key={
                  file.document_id
                }
                className="
                  transition-colors
                  duration-200
                  hover:bg-violet-50
                "
              >
                {/* FILE NAME */}
                <td
                  className="
                    px-6
                    py-4
                    font-medium
                    text-violet-900
                  "
                >
                  {file.file_name}
                </td>

                {/* CATEGORY */}
                <td
                  className="
                    px-6
                    py-4
                    text-violet-700
                  "
                >
                  {file.category}
                </td>

                {/* CHUNKS */}
                <td
                  className="
                    px-6
                    py-4
                    text-violet-700
                  "
                >
                  {file.chunk_count}
                </td>

                {/* DATE */}
                <td
                  className="
                    px-6
                    py-4
                    text-violet-700
                  "
                >
                  {formatDate(
                    file.uploaded_at
                  )}
                </td>

                {/* STATUS */}
                <td
                  className="
                    px-6
                    py-4
                  "
                >
                  <span
                    className={`
                      inline-flex
                      items-center

                      rounded-full
                      border

                      px-3
                      py-1

                      text-xs
                      font-semibold

                      ${
                        isActive
                          ? `
                            border-emerald-200
                            bg-emerald-100
                            text-emerald-700
                          `
                          : `
                            border-red-200
                            bg-red-100
                            text-red-700
                          `
                      }
                    `}
                  >
                    {isActive
                      ? "Active"
                      : "Blocked"}
                  </span>
                </td>

                {/* ACTIONS */}
                <td
                  className="
                    px-6
                    py-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >
                    {/* TOGGLE */}
                    <button
                      onClick={() =>
                        onToggleFile?.(
                          file.document_id,
                          isActive
                        )
                      }
                      className={`
                        inline-flex
                        items-center
                        gap-2

                        rounded-lg
                        border

                        px-3
                        py-1.5

                        text-sm
                        font-medium

                        transition-all
                        duration-200

                        ${
                          isActive
                            ? `
                              border-red-200
                              bg-red-50
                              text-red-600

                              hover:bg-red-100
                            `
                            : `
                              border-emerald-200
                              bg-emerald-50
                              text-emerald-600

                              hover:bg-emerald-100
                            `
                        }
                      `}
                    >
                      {isActive ? (
                        <>
                          <ShieldOff className="h-4 w-4" />

                          <span className="hidden sm:inline">
                            Block
                          </span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />

                          <span className="hidden sm:inline">
                            Enable
                          </span>
                        </>
                      )}
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() =>
                        onDeleteFile?.(
                          file.document_id
                        )
                      }
                      className="
                        inline-flex
                        items-center
                        gap-2

                        rounded-lg

                        border
                        border-red-200

                        bg-red-50

                        px-3
                        py-1.5

                        text-sm
                        font-medium
                        text-red-600

                        transition-all
                        duration-200

                        hover:bg-red-100
                      "
                    >
                      <Trash2 className="h-4 w-4" />

                      <span className="hidden sm:inline">
                        Delete
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default FileTable