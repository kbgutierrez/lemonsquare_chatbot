import {
  FileText,
  X,
} from "lucide-react"

import UploadStatusBadge from "./UploadStatusBadge"

const UploadTableRow = ({
  file,
  removeFile,
}) => {
  const isUploading =
    file.statusType === "loading"

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
        hover-surface
        border-t
        transition-all
        duration-300
      "
      style={{
        borderColor: "var(--border)",
      }}
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
            "
            style={{
              borderColor: "var(--border)",
              background: "var(--panel-light)",
            }}
          >
            <FileText
              className="h-4.5 w-4.5"
              style={{
                color: "var(--accent)",
              }}
            />
          </div>

          <div className="min-w-0">
            <p
              className="
                max-w-[260px]
                truncate
                text-sm
                font-semibold
              "
              style={{
                color: "var(--text-primary)",
              }}
            >
              {file.name}
            </p>

            <p
              className="mt-1 text-xs"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {file.type}
            </p>

            {file.created_by_username && (
              <p
                className="mt-1 text-[11px]"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                Created By: {file.created_by_username}
              </p>
            )}

            {file.updated_by_username && (
              <p
                className="text-[11px]"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                Updated By: {file.updated_by_username}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* SIZE */}
      <td
        className="px-5 py-4 text-sm font-medium"
        style={{
          color: "var(--text-primary)",
        }}
      >
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
            px-3
            py-1.5
            text-xs
            font-medium
          "
          style={{
            borderColor: "var(--border)",
            background: "var(--panel-light)",
            color: "var(--text-primary)",
          }}
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
      <td
        className="px-5 py-4 text-xs font-medium"
        style={{
          color: "var(--text-secondary)",
        }}
      >
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
            transition-all
            duration-200
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
          style={{
            color: "var(--text-secondary)",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background =
              "rgba(239, 68, 68, 0.10)"

            event.currentTarget.style.borderColor =
              "rgba(239, 68, 68, 0.20)"

            event.currentTarget.style.color =
              "#f87171"
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background =
              "transparent"

            event.currentTarget.style.borderColor =
              "transparent"

            event.currentTarget.style.color =
              "var(--text-secondary)"
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}

export default UploadTableRow