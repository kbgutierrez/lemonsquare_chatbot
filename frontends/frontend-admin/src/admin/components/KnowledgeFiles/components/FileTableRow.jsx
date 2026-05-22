import {
  FileText,
} from "lucide-react"

import CategoryBadge
  from "./CategoryBadge"

import ActionButtons
  from "./ActionButtons"

const FileTableRow = ({
  file,

  onEdit,
  onDelete,
  onRestore,

  deleting,
}) => {

  const formatDate =
    (date) => {

      if (!date)
        return "-"

      return new Date(
        date
      ).toLocaleString()
    }

  const cellClass =
    `
      border-b
      border-[#202b27]

      px-5
      py-3.5
    `

  return (
    <tr
      className="
        group

        transition-all
        duration-200

        hover:bg-[#18211f]/70
      "
    >
      {/* FILE */}
      <td
        className={
          cellClass
        }
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

              rounded-xl

              border
              border-[#2a3732]

              bg-[#18211f]
            "
          >
            <FileText
              className="
                h-4.5
                w-4.5

                text-[#f5d547]
              "
            />
          </div>

          <div className="min-w-0">

            <p
              className="
                truncate

                text-[13px]
                font-medium

                text-white
              "
            >
              {file.file_name}
            </p>

            <p
              className="
                mt-0.5

                text-[11px]

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
        className={
          cellClass
        }
      >
        <CategoryBadge
          category={
            file.category
          }
        />
      </td>

      {/* CHUNKS */}
      <td
        className={`
          ${cellClass}

          text-[13px]
          font-medium

          text-white
        `}
      >
        {file.chunk_count}
      </td>

      {/* DATE */}
      <td
        className={`
          ${cellClass}

          text-[13px]

          text-[#8ca097]
        `}
      >
        {formatDate(
          file.uploaded_at
        )}
      </td>

      {/* ACTIONS */}
      <td
        className={
          cellClass
        }
      >
        <ActionButtons
          file={file}

          deleting={deleting}

          onEdit={onEdit}

          onDelete={onDelete}

          onRestore={onRestore}
        />
      </td>
    </tr>
  )
}

export default FileTableRow