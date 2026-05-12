import {
  useState,
} from "react"

import {
  Upload,
  FileUp,
  Plus,
  X,
} from "lucide-react"

const UploadDropzone = ({
  uploadedFiles,
  inputRef,
  handleDrop,
  handleInputChange,
  clearFiles,
  confirmUpload,
  hasPendingUploads,
}) => {

  const [isDragging, setIsDragging] =
    useState(false)

  const hasFiles =
    uploadedFiles.length > 0

  const handleDragOver =
    (event) => {

      event.preventDefault()

      setIsDragging(
        true
      )
    }

  const handleDragLeave =
    (event) => {

      event.preventDefault()

      setIsDragging(
        false
      )
    }

  const onDrop =
    (event) => {

      setIsDragging(
        false
      )

      handleDrop(event)
    }

  /* =========================================
     COMPACT MODE
  ========================================= */

  if (hasFiles) {

    return (
      <div
        className="
          rounded-[28px]

          border
          border-[#26332d]

          bg-[#121a18]

          p-5
        "
      >
        {/* TOP */}
        <div
          className="
            flex
            items-start
            justify-between

            gap-4
          "
        >
          {/* LEFT */}
          <div className="flex items-start gap-4">

            {/* ICON */}
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center

                rounded-2xl

                border
                border-[#2f3c36]

                bg-[#1a2320]
              "
            >
              <FileUp
                className="
                  h-6
                  w-6

                  text-[#d8b93d]
                "
              />
            </div>

            {/* TEXT */}
            <div>
              <h3
                className="
                  text-lg
                  font-semibold

                  text-white
                "
              >
                Files Ready
              </h3>

              <p
                className="
                  mt-1

                  text-sm

                  text-[#8ea59b]
                "
              >
                {uploadedFiles.length} file(s)
                selected for upload.
              </p>
            </div>
          </div>

          {/* STATUS */}
          <div
            className="
              rounded-xl

              border
              border-[#2f3c36]

              bg-[#1a2320]

              px-3
              py-2
            "
          >
            <p
              className="
                text-[11px]
                font-medium
                uppercase

                tracking-[0.16em]

                text-[#73867d]
              "
            >
              Upload Queue
            </p>

            <p
              className="
                mt-1

                text-sm
                font-semibold

                text-white
              "
            >
              Pending
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div
          className="
            mt-5

            flex
            flex-wrap
            gap-3
          "
        >
          {/* CONFIRM */}
          {hasPendingUploads && (
            <button
              onClick={
                confirmUpload
              }
              className="
                flex
                items-center
                justify-center

                rounded-2xl

                border
                border-[#d8b93d]/20

                bg-[#d8b93d]

                px-5
                py-3

                text-sm
                font-semibold

                text-[#111917]

                transition-all
                duration-200

                hover:scale-[1.01]
                hover:bg-[#e6c84c]
              "
            >
              Confirm Upload
            </button>
          )}

          {/* ADD FILES */}
          <button
            onClick={() =>
              inputRef.current.click()
            }
            className="
              flex
              items-center
              gap-2

              rounded-2xl

              border
              border-[#2f3c36]

              bg-[#1a2320]

              px-5
              py-3

              text-sm
              font-medium

              text-[#d4dfda]

              transition-all
              duration-200

              hover:border-[#46544e]
              hover:bg-[#202b27]
            "
          >
            <Plus className="h-4 w-4" />

            Add Files
          </button>

          {/* CANCEL */}
          <button
            onClick={
              clearFiles
            }
            className="
              flex
              items-center
              gap-2

              rounded-2xl

              border
              border-[#432828]

              bg-[#231818]

              px-5
              py-3

              text-sm
              font-medium

              text-[#ffb4b4]

              transition-all
              duration-200

              hover:bg-[#2d1d1d]
            "
          >
            <X className="h-4 w-4" />

            Cancel
          </button>
        </div>

        {/* INPUT */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf"
          hidden
          onChange={
            handleInputChange
          }
        />
      </div>
    )
  }

  /* =========================================
     EMPTY MODE
  ========================================= */

  return (
    <div
      onDrop={onDrop}

      onDragOver={
        handleDragOver
      }

      onDragLeave={
        handleDragLeave
      }

      className={`
        relative

        overflow-hidden

        rounded-[32px]

        border-2
        border-dashed

        p-10
        md:p-14

        transition-all
        duration-300

        ${
          isDragging
            ? `
              scale-[1.01]

              border-[#d8b93d]

              bg-[#1a241f]

              shadow-[0_0_0_4px_rgba(216,185,61,0.08)]
            `
            : `
              border-[#2c3b35]

              bg-[#141c1a]

              hover:border-[#44524c]
              hover:bg-[#17211e]
            `
        }
      `}
    >
      {/* BACKGROUND */}
      <div
        className="
          pointer-events-none

          absolute
          inset-0

          overflow-hidden
        "
      >
        <div
          className={`
            absolute
            left-1/2
            top-1/2

            h-72
            w-72

            -translate-x-1/2
            -translate-y-1/2

            rounded-full

            blur-3xl

            transition-all
            duration-300

            ${
              isDragging
                ? `
                  bg-[#d8b93d]/10
                `
                : `
                  bg-[#d8b93d]/[0.03]
                `
            }
          `}
        />
      </div>

      {/* CONTENT */}
      <div
        className="
          relative
          z-10

          flex
          flex-col
          items-center
          justify-center

          text-center
        "
      >
        {/* ICON */}
        <div
          className={`
            mb-5

            flex
            h-20
            w-20
            items-center
            justify-center

            rounded-[28px]

            border

            transition-all
            duration-300

            ${
              isDragging
                ? `
                  border-[#d8b93d]/40

                  bg-[#d8b93d]/15
                `
                : `
                  border-[#2f3c36]

                  bg-[#1a2320]
                `
            }
          `}
        >
          {isDragging
            ? (
              <FileUp
                className="
                  h-9
                  w-9

                  text-[#d8b93d]
                "
              />
            )
            : (
              <Upload
                className="
                  h-8
                  w-8

                  text-[#d6e2dc]
                "
              />
            )}
        </div>

        {/* TITLE */}
        <h2
          className="
            text-2xl
            font-bold

            tracking-tight

            text-white
          "
        >
          {isDragging
            ? "Release to upload"
            : "Upload Files"}
        </h2>

        {/* DESCRIPTION */}
        <p
          className="
            mt-3

            max-w-lg

            text-sm
            leading-relaxed

            text-[#8ea59b]
          "
        >
          Drag and drop PDF files here
          or select files manually to
          upload documents into the AI
          knowledge base.
        </p>

        {/* BUTTON */}
        <button
          onClick={() =>
            inputRef.current.click()
          }
          className="
            mt-8

            rounded-2xl

            border
            border-[#d8b93d]/20

            bg-[#d8b93d]

            px-5
            py-3

            text-sm
            font-semibold

            text-[#111917]

            transition-all
            duration-200

            hover:scale-[1.02]
            hover:bg-[#e6c84c]
          "
        >
          Choose Files
        </button>

        {/* FOOTER */}
        <p
          className="
            mt-4

            text-xs

            tracking-wide

            text-[#6f847b]
          "
        >
          Supported format: PDF
        </p>

        {/* INPUT */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf"
          hidden
          onChange={
            handleInputChange
          }
        />
      </div>
    </div>
  )
}

export default UploadDropzone