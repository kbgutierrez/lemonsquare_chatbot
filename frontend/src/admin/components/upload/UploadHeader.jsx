import {
  Plus,
} from "lucide-react"

const UploadHeader = ({
  uploadedFiles,
  inputRef,
  handleInputChange,
}) => {

  if (
    uploadedFiles.length === 0
  ) {

    return (
      <div>
        <h2 className="text-xl font-bold text-violet-900">
          Upload Knowledge Files
        </h2>

        <p className="mt-1 text-sm text-violet-600">
          Upload PDF manuals into the AI knowledge base.
        </p>
      </div>
    )
  }

  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        justify-between
        gap-3

        rounded-2xl

        border
        border-violet-200

        bg-violet-50/70

        px-4
        py-3
      "
    >
      <div>
        <h3 className="text-sm font-semibold text-violet-900">
          Uploaded Files
        </h3>

        <p className="text-xs text-violet-600">
          {uploadedFiles.length} file(s)
        </p>
      </div>

      <button
        onClick={() =>
          inputRef.current.click()
        }
        className="
          flex
          items-center
          gap-2

          rounded-xl

          bg-gradient-to-r
          from-violet-600
          to-purple-500

          px-4
          py-2

          text-sm
          font-medium
          text-white

          transition-all
          duration-200

          hover:scale-[1.02]
        "
      >
        <Plus className="h-4 w-4" />

        Add More Files
      </button>

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

export default UploadHeader