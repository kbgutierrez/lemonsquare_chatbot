import { FileText, X } from "lucide-react"
import UploadStatusBadge from "./UploadStatusBadge"

const UploadTableRow = ({ file, removeFile }) => {
  const isUploading = file.statusType === "loading"

  /* ========================================
     CATEGORY LABEL
  ======================================== */
  const categoryLabel =
    file.category?.trim()
      ? file.category
      : "Auto Detect"

  return (
    <tr
      className="
        border-t
        border-[#24312b]

        transition-all
        duration-300

        hover:bg-[#171f1d]
      "
    >
      {/* FILE */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center

              rounded-2xl

              border
              border-[#2d3934]

              bg-[#1b2422]
            "
          >
            <FileText className="h-4.5 w-4.5 text-[#f5d547]" />
          </div>

          <div className="min-w-0">
            <p
              className="
                max-w-[260px]
                truncate

                text-sm
                font-semibold

                text-white
              "
            >
              {file.name}
            </p>

            <p className="mt-1 text-xs text-[#7f948b]">
              {file.type}
            </p>
          </div>
        </div>
      </td>

      {/* SIZE */}
      <td className="px-5 py-4 text-sm font-medium text-[#c4d1cb]">
        {file.size}
      </td>

      {/* CATEGORY */}
      <td className="px-5 py-4">
        <div
          className="
            inline-flex
            items-center

            whitespace-nowrap

            rounded-xl

            border
            border-[#32403a]

            bg-[#1a2320]

            px-3
            py-1.5

            text-xs
            font-medium

            text-[#d7e2dd]
          "
        >
          {categoryLabel}
        </div>
      </td>

      {/* STATUS */}
      <td className="px-5 py-4">
        <UploadStatusBadge
          status={file.status}
          statusType={file.statusType}
        />
      </td>

      {/* UPLOADED */}
      <td className="px-5 py-4 text-xs font-medium text-[#81958c]">
        {file.uploadedAt}
      </td>

      {/* ACTION */}
      <td className="px-5 py-4">
        <button
          disabled={isUploading}
          onClick={() => removeFile(file.id)}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center

            rounded-xl

            border
            border-transparent

            text-[#9cafa7]

            transition-all
            duration-200

            disabled:cursor-not-allowed
            disabled:opacity-40

            hover:border-red-500/20
            hover:bg-red-500/10
            hover:text-red-400
          "
        >
          <X className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}

export default UploadTableRow