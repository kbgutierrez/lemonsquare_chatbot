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
              {file.file_name}
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
        <CategoryBadge
          category={
            file.category
          }
        />
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
        {file.chunk_count}
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
        <ActionButtons
          file={file}
          deleting={deleting}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  )
}

export default FileTableRow