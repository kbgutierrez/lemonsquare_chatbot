import { useState } from "react"
import { Upload, FileUp, Plus, X } from "lucide-react"
import UploadCategorySelector from "./components/UploadCategorySelector"

const UploadDropzone = ({
  uploadedFiles,
  inputRef,
  handleDrop,
  handleInputChange,
  clearFiles,
  confirmUpload,
  uploading,
  uploadProgress,
  hasPendingUploads,
  categories = [],
  selectedCategory = "",
  setSelectedCategory,
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const hasFiles = uploadedFiles.length > 0

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e) => {
    setIsDragging(false)
    handleDrop(e)
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      multiple
      accept=".pdf"
      hidden
      onChange={handleInputChange}
    />
  )

  /* ========================================
     COMPACT MODE (HAS FILES)
  ======================================== */
  if (hasFiles) {
    return (
      <div className="flex h-full flex-col rounded-[24px] border border-[#26332d] bg-[#141c1a]">
        {/* HEADER */}
        <div className="shrink-0 border-b border-[#24312b] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Upload Controls</h3>
              <p className="mt-0.5 text-[11px] text-[#7f948b]">
                {uploadedFiles.length} file(s) selected
              </p>
            </div>

            {hasPendingUploads && (
              <div className="inline-flex items-center rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-300">
                Pending
              </div>
            )}
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <UploadCategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <button
            onClick={() => inputRef.current.click()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#2d3b35] bg-[#18211f] text-sm font-medium text-white transition-all duration-200 hover:bg-[#202b27]"
          >
            <Plus className="h-4 w-4" />
            Add More Files
          </button>

          {fileInput}
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t border-[#24312b] p-4 space-y-2">
          <button
            disabled={uploading}
            onClick={confirmUpload}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f5d547] text-sm font-semibold text-[#111917] transition-all duration-200 hover:bg-[#e6c84c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {uploading ? `Uploading ${uploadProgress}%` : "Upload Files"}
          </button>

          <button
            disabled={uploading}
            onClick={clearFiles}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>
      </div>
    )
  }

  /* ========================================
     EMPTY MODE (DROPZONE)
  ======================================== */
  return (
    <div
      onDrop={onDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`group relative w-full rounded-[24px] border-2 border-dashed px-6 py-8 sm:px-8 sm:py-10 transition-all duration-300 ${
        isDragging
          ? "scale-[1.005] border-[#d8b93d] bg-[#1a241f] shadow-[0_0_0_4px_rgba(216,185,61,0.08)]"
          : "border-[#2c3b35] bg-[#141c1a] hover:border-[#44524c] hover:bg-[#17211e]"
      }`}
    >
      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
        <div
          className={`absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-all duration-500 ${
            isDragging ? "bg-[#d8b93d]/10" : "bg-[#d8b93d]/[0.03]"
          }`}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        {/* ICON */}
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-[18px] border transition-all duration-500 ${
            isDragging
              ? "border-[#d8b93d]/40 bg-[#d8b93d]/15"
              : "border-[#2f3c36] bg-[#1a2320]"
          }`}
        >
          {isDragging ? (
            <FileUp className="h-6 w-6 text-[#d8b93d]" />
          ) : (
            <Upload className="h-5 w-5 text-[#d6e2dc]" />
          )}
        </div>

        {/* TEXT */}
        <h2 className="text-lg font-bold text-white">
          {isDragging ? "Release to upload" : "Upload Files"}
        </h2>

        <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#8ea59b]">
          Drag and drop PDF files here or manually select files to extend the AI knowledge base.
        </p>

        {/* CONTROLS */}
        <div className="mt-5 flex w-full max-w-[340px] flex-col gap-3">
          <UploadCategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <button
            onClick={() => inputRef.current.click()}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d8b93d]/20 bg-[#d8b93d] px-6 text-sm font-semibold text-[#111917] transition-all duration-300 hover:bg-[#e6c84c]"
          >
            <Upload className="h-4 w-4" />
            Choose Files
          </button>
        </div>

        <p className="mt-4 text-[11px] tracking-wide text-[#6f847b]">
          Supported format: PDF
        </p>

        {fileInput}
      </div>
    </div>
  )
}

export default UploadDropzone