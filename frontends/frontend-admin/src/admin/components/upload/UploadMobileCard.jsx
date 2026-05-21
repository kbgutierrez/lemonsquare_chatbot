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
        group

        overflow-hidden

        rounded-3xl

        border
        border-[#28352f]

        bg-[#141d1b]

        transition-all
        duration-300

        hover:border-[#3a4b43]
        hover:bg-[#182320]
        hover:shadow-[0_12px_40px_rgba(0,0,0,0.30)]
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
            border-[#2d3934]

            bg-[#1b2422]
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

        {/* INFO */}
        <div className="min-w-0 flex-1">
          <h3
            className="
              truncate

              text-sm
              font-semibold

              text-white
            "
          >
            {file.name}
          </h3>

          <p
            className="
              mt-1

              text-xs

              text-[#81958c]
            "
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

            text-[#9baca5]

            transition-all
            duration-200

            disabled:cursor-not-allowed
            disabled:opacity-40

            hover:border-red-500/20
            hover:bg-red-500/10
            hover:text-red-400
          "
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

          border-t
          border-[#24312b]

          px-4
          py-3
        "
      >
        {/* SIZE */}
        <div>
          <p
            className="
              text-[10px]
              font-semibold
              uppercase

              tracking-[0.18em]

              text-[#70837a]
            "
          >
            Size
          </p>

          <p
            className="
              mt-1

              text-sm
              font-medium

              text-[#d5dfdb]
            "
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

              text-[#70837a]
            "
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
              border-[#32403a]

              bg-[#1a2320]

              px-2.5
              py-1

              text-xs
              font-medium

              text-[#d7e2dd]
            "
          >
            {file.category ||
              "General"}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="
          flex
          items-center
          justify-between

          border-t
          border-[#24312b]

          px-4
          py-3
        "
      >
        <span
          className="
            text-[10px]
            font-semibold
            uppercase

            tracking-[0.18em]

            text-[#70837a]
          "
        >
          Uploaded
        </span>

        <span
          className="
            text-xs
            font-medium

            text-[#c3d0ca]
          "
        >
          {file.uploadedAt}
        </span>
      </div>
    </div>
  )
}

export default UploadMobileCard