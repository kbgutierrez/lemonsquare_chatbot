import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  Upload,
  FileUp,
  Plus,
  X,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react"

const UploadDropzone = ({
  uploadedFiles,
  inputRef,
  handleDrop,
  handleInputChange,
  clearFiles,
  confirmUpload,
  hasPendingUploads,

  uploading = false,
  uploadProgress = 0,

  categories = [],
  selectedCategory = "",
  setSelectedCategory,
}) => {

  const [isDragging, setIsDragging] =
    useState(false)

  const [
    dropdownOpen,
    setDropdownOpen,
  ] = useState(false)

  const dropdownRef =
    useRef(null)

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
     OUTSIDE CLICK
  ========================================= */

  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(
            event.target
          )
        ) {

          setDropdownOpen(
            false
          )
        }
      }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }

  }, [])

  const categoryLabel =
    selectedCategory ||
    "Auto Detect Category"

  /* =========================================
     CATEGORY SELECTOR
  ========================================= */

  const CategorySelector =
    () => (
      <div
        ref={dropdownRef}
        className="
          relative
          w-full
          max-w-[280px]
        "
      >
        <button
          type="button"
          onClick={() =>
            setDropdownOpen(
              (prev) =>
                !prev
            )
          }
          className="
            flex
            h-11
            w-full
            items-center
            justify-between

            rounded-2xl

            border
            border-[#2f3c36]

            bg-[#1a2320]

            px-4

            text-left
            text-sm
            text-white

            transition-all
            duration-300

            hover:border-[#46544e]
          "
        >
          <span
            className={
              selectedCategory
                ? "text-white"
                : "text-[#8ea59b]"
            }
          >
            {categoryLabel}
          </span>

          <ChevronDown
            className={`
              h-4
              w-4

              text-[#8ea59b]

              transition-transform
              duration-300

              ${
                dropdownOpen
                  ? "rotate-180"
                  : ""
              }
            `}
          />
        </button>

        {/* DROPDOWN */}
        <div
          className={`
            absolute
            left-0
            right-0
            top-[calc(100%+10px)]
            z-50

            overflow-hidden

            rounded-2xl

            border
            border-[#2d3b35]

            bg-[#18211f]

            shadow-[0_20px_60px_rgba(0,0,0,0.45)]

            transition-all
            duration-300

            ${
              dropdownOpen
                ? `
                  pointer-events-auto
                  translate-y-0
                  opacity-100
                `
                : `
                  pointer-events-none
                  -translate-y-2
                  opacity-0
                `
            }
          `}
        >

          {/* AUTO DETECT */}
          <button
            type="button"
            onClick={() => {

              setSelectedCategory(
                ""
              )

              setDropdownOpen(
                false
              )
            }}
            className="
              flex
              w-full
              items-center
              justify-between

              border-b
              border-[#22302b]

              px-4
              py-3

              text-sm
              text-white

              hover:bg-[#202b27]
            "
          >
            <span>
              Auto Detect Category
            </span>

            {!selectedCategory && (
              <Check
                className="
                  h-4
                  w-4
                  text-[#f5d547]
                "
              />
            )}
          </button>

          {/* CATEGORIES */}
          <div
            className="
              max-h-[220px]
              overflow-y-auto
            "
          >
            {categories.map(
              (category) => {

                const active =
                  selectedCategory ===
                  category

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {

                      setSelectedCategory(
                        category
                      )

                      setDropdownOpen(
                        false
                      )
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      justify-between

                      px-4
                      py-3

                      text-sm
                      text-white

                      hover:bg-[#202b27]
                    "
                  >
                    <span>
                      {category}
                    </span>

                    {active && (
                      <Check
                        className="
                          h-4
                          w-4
                          text-[#f5d547]
                        "
                      />
                    )}
                  </button>
                )
              }
            )}
          </div>
        </div>
      </div>
    )

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

          border
          border-[#26332d]

          bg-[#121a18]

          p-4
        "
      >
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

              h-36
              w-36

              rounded-full

              bg-[#d8b93d]/[0.04]

              blur-3xl
            "
          />
        </div>

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
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
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
                  border-[#2f3c36]

                  bg-[#1a2320]
                "
              >
                <FileUp
                  className="
                    h-5
                    w-5
                    text-[#d8b93d]
                  "
                />
              </div>

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
                      text-base
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

                      px-2
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
                py-2
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

          {/* CATEGORY */}
          <div className="mt-4">
            <CategorySelector />
          </div>

          {/* ACTIONS */}
          <div
            className="
              mt-4

              flex
              flex-col
              gap-3

              sm:flex-row
              sm:flex-wrap
            "
          >
            {hasPendingUploads && (
              <button
                disabled={
                  uploading
                }

                onClick={
                  confirmUpload
                }

                className="
                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  flex
                  h-11
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

                  hover:bg-[#e6c84c]
                "
              >
                {uploading
                  ? `Uploading ${uploadProgress}%`
                  : "Confirm Upload"}
              </button>
            )}

            <button
              onClick={() =>
                inputRef.current.click()
              }
              className="
                flex
                h-11
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

            <button
              onClick={
                clearFiles
              }
              className="
                flex
                h-11
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

        w-full

        overflow-hidden

        rounded-[28px]

        border-2
        border-dashed

        px-6
        py-7

        sm:px-8
        sm:py-8

        transition-all
        duration-300

        ${
          isDragging
            ? `
              scale-[1.005]
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

            h-32
            w-32

            -translate-x-1/2
            -translate-y-1/2

            rounded-full

            blur-3xl

            transition-all
            duration-500

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
        <div
          className={`
            mb-4

            flex
            h-14
            w-14
            items-center
            justify-center

            rounded-[20px]

            border

            transition-all
            duration-500

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
                  h-7
                  w-7
                  text-[#d8b93d]
                "
              />
            )
            : (
              <Upload
                className="
                  h-6
                  w-6
                  text-[#d6e2dc]
                "
              />
            )}
        </div>

        <h2
          className="
            text-xl
            font-bold

            tracking-tight

            text-white
          "
        >
          {isDragging
            ? "Release to upload"
            : "Upload Files"}
        </h2>

        <p
          className="
            mt-2

            max-w-lg

            text-sm
            leading-relaxed

            text-[#8ea59b]
          "
        >
          Drag and drop PDF files here
          or manually select files to
          extend the AI knowledge base.
        </p>

        {/* CATEGORY */}
        <div className="mt-5 flex w-full justify-center">
          <CategorySelector />
        </div>

        <button
          onClick={() =>
            inputRef.current.click()
          }
          className="
            mt-5

            flex
            h-11
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

            hover:bg-[#e6c84c]
          "
        >
          Choose Files
        </button>

        <p
          className="
            mt-3

            text-xs

            tracking-wide

            text-[#6f847b]
          "
        >
          Supported format: PDF
        </p>

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