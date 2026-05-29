import {
  FileText,
  Trash2,
} from "lucide-react"

import UploadStatusBadge from "./UploadStatusBadge"

const UploadMobileCard = ({
  file,
  removeFile,
}) => {
  const isUploading =
    file.statusType ===
    "loading"

  return (
    <div
      className="
        panel-base
        hover-surface
        group
        overflow-hidden
        rounded-3xl
      "
    >
      {/* TOP */}
      <div
        className="
          flex
          items-start
          gap-3
          p-4
        "
      >
        {/* ICON */}
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
          "
          style={{
            borderColor: "var(--border)",
            background: "var(--panel-light)",
          }}
        >
          <FileText
            className="
              h-5
              w-5
            "
            style={{
              color: "var(--accent)",
            }}
          />
        </div>

        {/* INFO */}
        <div className="min-w-0 flex-1">
          <h3
            className="
              truncate
              text-sm
              font-semibold
            "
            style={{
              color: "var(--text-primary)",
            }}
          >
            {file.name}
          </h3>

          <p
            className="
              mt-1
              text-xs
            "
            style={{
              color: "var(--text-secondary)",
            }}
          >
            {file.type}
          </p>

          <div className="mt-3">
            <UploadStatusBadge
              status={file.status}
              statusType={file.statusType}
            />
          </div>
        </div>

        {/* DELETE */}
        <button
          disabled={isUploading}
          onClick={() =>
            removeFile(file.id)
          }
          className="
            flex
            h-10
            w-10
            shrink-0
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
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* META */}
      <div
        className="
          grid
          grid-cols-2
          gap-3
          px-4
          py-3
        "
        style={{
          borderTop: "1px solid var(--border)",
        }}
      >
        {/* SIZE */}
        <div>
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
            "
            style={{
              color: "var(--text-muted)",
            }}
          >
            Size
          </p>

          <p
            className="
              mt-1
              text-sm
              font-medium
            "
            style={{
              color: "var(--text-primary)",
            }}
          >
            {file.size}
          </p>
        </div>

        {/* CATEGORY */}
        <div>
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
            "
            style={{
              color: "var(--text-muted)",
            }}
          >
            Category
          </p>

          <div
            className="
              mt-1
              inline-flex
              items-center
              rounded-xl
              border
              px-2.5
              py-1
              text-xs
              font-medium
            "
            style={{
              borderColor: "var(--border)",
              background: "var(--panel-light)",
              color: "var(--text-primary)",
            }}
          >
            {file.category ||
              "General"}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="
          px-4
          py-3
        "
        style={{
          borderTop: "1px solid var(--border)",
        }}
      >
        <div className="space-y-2">

          <div className="flex items-center justify-between">
            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
              "
              style={{
                color: "var(--text-muted)",
              }}
            >
              Uploaded
            </span>

            <span
              className="
                text-xs
                font-medium
              "
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {file.uploadedAt}
            </span>
          </div>

          {file.created_by_username && (
            <div
              className="text-xs"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              Created By: {file.created_by_username}
            </div>
          )}

          {file.updated_by_username && (
            <div
              className="text-xs"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              Updated By: {file.updated_by_username}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default UploadMobileCard