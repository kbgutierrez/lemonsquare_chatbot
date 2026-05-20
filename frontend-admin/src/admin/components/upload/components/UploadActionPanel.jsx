import {
  Plus,
  X,
} from "lucide-react"

import UploadCategorySelector
  from "./UploadCategorySelector"

const UploadActionPanel = ({
  inputRef,

  clearFiles,
  confirmUpload,

  uploading,
  uploadProgress,

  hasPendingUploads,

  categories,
  selectedCategory,
  setSelectedCategory,
}) => {

  return (
    <div
      className="
        flex
        flex-col
        gap-3

        rounded-[24px]

        border
        border-[#26332d]

        bg-[#121a18]

        p-4
      "
    >
      {/* CATEGORY */}
      <UploadCategorySelector
        categories={
          categories
        }

        selectedCategory={
          selectedCategory
        }

        setSelectedCategory={
          setSelectedCategory
        }
      />

      {/* ACTIONS */}
      <div
        className="
          flex
          flex-col
          gap-3
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

              disabled:cursor-not-allowed
              disabled:opacity-60

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
  )
}

export default UploadActionPanel