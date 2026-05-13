import {
  useState,
} from "react"

import {
  Upload,
  FileUp,
  Plus,
  X,
  Sparkles,
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

      setIsDragging(true)
    }

  const handleDragLeave =
    (event) => {

      event.preventDefault()

      setIsDragging(false)
    }

  const onDrop =
    (event) => {

      setIsDragging(false)

      handleDrop(event)
    }

  /* =========================================
     COMPACT MODE
  ========================================= */

  if (hasFiles) {

    return (
      <div
        className="
          relative

          overflow-hidden

          rounded-[24px]
          md:rounded-[28px]

          border
          border-[#26332d]

          bg-[#121a18]

          p-4
          sm:p-5
        "
      >
        {/* BACKGROUND */}
        <div
          className="
            pointer-events-none

            absolute
            inset-0
          "
        >
          <div
            className="
              absolute
              right-[-40px]
              top-[-40px]

              h-40
              w-40

              rounded-full

              bg-[#d8b93d]/[0.04]

              blur-3xl
            "
          />
        </div>

        {/* CONTENT */}
        <div className="relative z-10">
          {/* TOP */}
          <div
            className="
              flex
              flex-col
              gap-4

              lg:flex-row
              lg:items-start
              lg:justify-between
            "
          >
            {/* LEFT */}
            <div
              className="
                flex
                items-start
                gap-3
                sm:gap-4
              "
            >
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
              <div className="min-w-0">
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >
                  <h3
                    className="
                      text-lg
                      font-semibold

                      text-white
                    "
                  >
                    Files Ready
                  </h3>

                  <div
                    className="
                      inline-flex
                      items-center
                      gap-1

                      rounded-full

                      border
                      border-[#3b4b44]

                      bg-[#1b2522]

                      px-2.5
                      py-1

                      text-[10px]
                      font-semibold
                      uppercase

                      tracking-[0.16em]

                      text-[#cbd7d2]
                    "
                  >
                    <Sparkles className="h-3 w-3" />

                    Queue Active
                  </div>
                </div>

                <p
                  className="
                    mt-1

                    text-sm
                    leading-relaxed

                    text-[#8ea59b]
                  "
                >
                  {uploadedFiles.length} file(s)
                  selected for upload into the
                  AI knowledge base.
                </p>
              </div>
            </div>

            {/* STATUS */}
            <div
              className="
                inline-flex
                w-fit
                flex-col

                rounded-2xl

                border
                border-[#2f3c36]

                bg-[#1a2320]

                px-4
                py-3
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase

                  tracking-[0.18em]

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
                Pending Files
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div
            className="
              mt-5

              flex
              flex-col
              gap-3

              sm:flex-row
              sm:flex-wrap
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
                  h-12
                  items-center
                  justify-center

                  rounded-2xl

                  border
                  border-[#d8b93d]/20

                  bg-[#d8b93d]

                  px-5

                  text-sm
                  font-semibold

                  text-[#111917]

                  transition-all
                  duration-300

                  hover:scale-[1.01]
                  hover:bg-[#e6c84c]

                  active:scale-[0.99]
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
                h-12
                items-center
                justify-center
                gap-2

                rounded-2xl

                border
                border-[#2f3c36]

                bg-[#1a2320]

                px-5

                text-sm
                font-medium

                text-[#d4dfda]

                transition-all
                duration-300

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
                h-12
                items-center
                justify-center
                gap-2

                rounded-2xl

                border
                border-[#432828]

                bg-[#231818]

                px-5

                text-sm
                font-medium

                text-[#ffb4b4]

                transition-all
                duration-300

                hover:bg-[#2d1d1d]
              "
            >
              <X className="h-4 w-4" />

              Cancel
            </button>
          </div>
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
        group
        relative

        overflow-hidden

        rounded-[28px]
        md:rounded-[32px]

        border-2
        border-dashed

        p-6
        sm:p-8
        md:p-12

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
            duration-500

            ${
              isDragging
                ? `
                  bg-[#d8b93d]/12
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
            duration-500

            group-hover:scale-[1.02]

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

            sm:text-3xl
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

            max-w-xl

            text-sm
            leading-relaxed

            text-[#8ea59b]

            sm:text-base
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

            flex
            h-12
            items-center
            justify-center

            rounded-2xl

            border
            border-[#d8b93d]/20

            bg-[#d8b93d]

            px-6

            text-sm
            font-semibold

            text-[#111917]

            transition-all
            duration-300

            hover:scale-[1.02]
            hover:bg-[#e6c84c]

            active:scale-[0.99]
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