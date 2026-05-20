import { useMemo } from "react"

import UploadDropzone from "./UploadDropzone.jsx"
import UploadTable from "./UploadTable.jsx"

import { useFileUpload } from "../../hooks/useFileUpload.js"

const UploadSection = () => {
  const {
    inputRef,
    uploadedFiles,
    currentPage,
    totalPages,
    paginatedFiles,
    hasPendingUploads,
    showTable,
    categories,
    selectedCategory,
    setSelectedCategory,
    handleInputChange,
    handleDrop,
    removeFile,
    clearFiles,
    confirmUpload,
    uploading,
    uploadProgress,
    setCurrentPage,
  } = useFileUpload()

  /* ========================================
     STABLE DROPZONE PROPS (OPTIMIZED)
  ======================================== */
  const dropzoneProps = useMemo(
    () => ({
      uploadedFiles,
      inputRef,
      handleDrop,
      handleInputChange,
      clearFiles,
      confirmUpload,
      uploading,
      uploadProgress,
      hasPendingUploads,
      categories,
      selectedCategory,
      setSelectedCategory,
    }),
    [
      uploadedFiles,
      inputRef,
      handleDrop,
      handleInputChange,
      clearFiles,
      confirmUpload,
      uploading,
      uploadProgress,
      hasPendingUploads,
      categories,
      selectedCategory,
      setSelectedCategory,
    ]
  )

  return (
    <div
      className="
        mx-auto
        flex
        h-full
        min-h-0
        w-full
        max-w-[1800px]
        flex-col
        overflow-hidden
      "
    >
      {/* HEADER */}
      <div className="mb-4 shrink-0 md:mb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              Upload Knowledge Files
            </h1>

            <p className="mt-1 text-sm text-[#7f948b]">
              Upload PDFs to extend the AI knowledge base in realtime.
            </p>
          </div>

          {hasPendingUploads && (
            <div className="inline-flex w-fit items-center rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300">
              Pending uploads in queue
            </div>
          )}
        </div>
      </div>

      {/* EMPTY STATE */}
      {!showTable && (
        <div className="flex flex-1 min-h-0 items-start justify-center overflow-y-auto">
          <div className="w-full max-w-3xl">
            <UploadDropzone {...dropzoneProps} />
          </div>
        </div>
      )}

      {/* FILES STATE */}
      {showTable && (
        <>
          {/* MOBILE FLOATING */}
          <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#26332d] bg-[#0d1412]/95 px-3 py-3 backdrop-blur-xl md:hidden">
            <div className="mx-auto max-w-[700px]">
              <UploadDropzone {...dropzoneProps} />
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex flex-1 min-h-0 gap-4 overflow-hidden">
            {/* DESKTOP SIDEBAR */}
            <div className="hidden h-full xl:block xl:w-[340px] xl:shrink-0">
              <UploadDropzone {...dropzoneProps} />
            </div>

            {/* TABLE AREA */}
            <div className="flex-1 min-h-0 overflow-hidden pb-[170px] md:pb-0">
              <UploadTable
                uploadedFiles={uploadedFiles}
                paginatedFiles={paginatedFiles}
                currentPage={currentPage}
                totalPages={totalPages}
                removeFile={removeFile}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UploadSection