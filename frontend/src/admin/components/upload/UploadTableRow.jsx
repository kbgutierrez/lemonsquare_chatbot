import {
  FileText,
  X,
} from "lucide-react"

import UploadStatusBadge from "./UploadStatusBadge"

const UploadTableRow = ({
  file,
  removeFile,
}) => {

  return (
    <tr
      className="
        border-t
        border-violet-100

        transition-colors

        hover:bg-violet-50/50
      "
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">

          <div
            className="
              rounded-xl
              bg-violet-100
              p-2
            "
          >
            <FileText className="h-4 w-4 text-violet-700" />
          </div>

          <div>
            <p
              className="
                max-w-[220px]
                truncate

                text-sm
                font-medium
                text-violet-900
              "
            >
              {file.name}
            </p>

            <p className="text-xs text-violet-500">
              {file.type}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-sm text-violet-700">
        {file.size}
      </td>

      <td className="px-4 py-3">
        <UploadStatusBadge
          status={file.status}
          statusType={file.statusType}
        />
      </td>

      <td className="px-4 py-3 text-xs text-violet-600">
        {file.uploadedAt}
      </td>

      <td className="px-4 py-3">
        <button
          onClick={() =>
            removeFile(file.id)
          }
          className="
            rounded-lg
            p-2

            text-red-500

            transition-all

            hover:bg-red-50
          "
        >
          <X className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}

export default UploadTableRow