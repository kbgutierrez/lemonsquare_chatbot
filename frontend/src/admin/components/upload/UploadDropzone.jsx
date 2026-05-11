import {
  Upload,
} from "lucide-react"

const UploadDropzone = ({
  uploadedFiles,
  inputRef,
  handleDrop,
  handleInputChange,
}) => {

  if (
    uploadedFiles.length > 0
  ) {
    return null
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(event) =>
        event.preventDefault()
      }
      className="
        rounded-2xl

        border
        border-dashed
        border-violet-300

        bg-violet-50/60

        p-10

        transition-all
        duration-200

        hover:bg-violet-100/50
      "
    >
      <div
        className="
          flex
          flex-col
          items-center
          justify-center

          text-center
        "
      >
        <div
          className="
            mb-3

            rounded-2xl

            bg-white

            p-3

            shadow-sm
          "
        >
          <Upload className="h-6 w-6 text-violet-600" />
        </div>

        <h3 className="text-base font-semibold text-violet-900">
          Drag & Drop PDF Files
        </h3>

        <p className="mt-1 text-sm text-violet-600">
          Upload manuals into Qdrant + SQL
        </p>

        <button
          onClick={() =>
            inputRef.current.click()
          }
          className="
            mt-4

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
          Choose Files
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
    </div>
  )
}

export default UploadDropzone