import UploadHeader from "./upload/UploadHeader.jsx"
import UploadDropzone from "./upload/UploadDropzone.jsx"
import UploadTable from "./upload/UploadTable.jsx"

import {
  useFileUpload,
} from "../hooks/useFileUpload"

const UploadSection = () => {

  const {
    inputRef,

    uploadedFiles,

    currentPage,
    totalPages,
    paginatedFiles,

    hasPendingUploads,

    handleInputChange,
    handleDrop,

    removeFile,

    confirmUpload,

    setCurrentPage,
  } = useFileUpload()

  return (
    <div
      className="
        flex
        h-full
        flex-col
        gap-4

        overflow-hidden
      "
    >
      {/* HEADER */}
      <UploadHeader
        uploadedFiles={
          uploadedFiles
        }

        inputRef={
          inputRef
        }
      />

      {/* DROPZONE */}
      <UploadDropzone
        uploadedFiles={
          uploadedFiles
        }

        inputRef={
          inputRef
        }

        handleDrop={
          handleDrop
        }

        handleInputChange={
          handleInputChange
        }
      />

      {/* CONFIRM BUTTON */}
      {hasPendingUploads && (
        <div className="flex justify-end">
          <button
            onClick={
              confirmUpload
            }
            className="
              rounded-xl

              bg-gradient-to-r
              from-violet-600
              to-purple-500

              px-5
              py-2.5

              text-sm
              font-semibold
              text-white

              transition-all
              duration-200

              hover:scale-[1.02]
            "
          >
            Confirm Upload
          </button>
        </div>
      )}

      {/* TABLE */}
      <UploadTable
        uploadedFiles={
          uploadedFiles
        }

        paginatedFiles={
          paginatedFiles
        }

        currentPage={
          currentPage
        }

        totalPages={
          totalPages
        }

        removeFile={
          removeFile
        }

        setCurrentPage={
          setCurrentPage
        }
      />
    </div>
  )
}

export default UploadSection