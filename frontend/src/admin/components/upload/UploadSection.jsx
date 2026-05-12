import UploadDropzone from "./UploadDropzone.jsx"
import UploadTable from "./UploadTable.jsx"

import {
  useFileUpload,
} from "../../hooks/useFileUpload.js"

const UploadSection = () => {

  const {
    inputRef,

    uploadedFiles,

    currentPage,
    totalPages,
    paginatedFiles,

    hasPendingUploads,
    showTable,

    handleInputChange,
    handleDrop,

    removeFile,
    clearFiles,

    confirmUpload,

    setCurrentPage,
  } = useFileUpload()

  return (
    <div
      className="
        mx-auto

        flex
        h-full
        w-full
        max-w-[1600px]
        flex-col

        overflow-hidden
      "
    >
      {/* =====================================
          EMPTY STATE
      ===================================== */}
      {!showTable && (
        <div
          className="
            flex
            flex-1
            items-center
            justify-center
          "
        >
          <div className="w-full max-w-3xl">
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

              clearFiles={
                clearFiles
              }

              confirmUpload={
                confirmUpload
              }

              hasPendingUploads={
                hasPendingUploads
              }
            />
          </div>
        </div>
      )}

      {/* =====================================
          FILES STATE
      ===================================== */}
      {showTable && (
        <div
          className="
            flex
            h-full
            flex-col

            gap-4

            overflow-hidden
          "
        >
          {/* TOP BAR */}
          <div className="shrink-0">
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

              clearFiles={
                clearFiles
              }

              confirmUpload={
                confirmUpload
              }

              hasPendingUploads={
                hasPendingUploads
              }
            />
          </div>

          {/* TABLE */}
          <div
            className="
              min-h-0
              flex-1
            "
          >
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
        </div>
      )}
    </div>
  )
}

export default UploadSection