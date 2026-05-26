import { useState } from "react"

import {
  Upload,
  FileUp,
  Plus,
  ArrowLeft,
} from "lucide-react"

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

  const [
    isDragging,
    setIsDragging,
  ] = useState(false)

  const hasFiles =
    uploadedFiles.length > 0

  const handleDragOver =
    (e) => {

      if (uploading) {
        return
      }

      e.preventDefault()

      setIsDragging(true)
    }

  const handleDragLeave =
    (e) => {

      e.preventDefault()

      setIsDragging(false)
    }

  const onDrop =
    (e) => {

      if (uploading) {
        return
      }

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
      disabled={uploading}
      onChange={
        handleInputChange
      }
    />
  )

  /* ========================================
     COMPACT MODE
  ======================================== */

  if (hasFiles) {

    return (
      <div
        className="
          panel-base
          flex
          h-full
          flex-col
          rounded-[24px]
        "
      >
        {/* HEADER */}
        <div
          className="shrink-0 p-4"
          style={{
            borderBottom:
              "1px solid var(--border)",
          }}
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <div>
              <h3
                className="
                  text-sm
                  font-semibold
                "
                style={{
                  color:
                    "var(--text-primary)",
                }}
              >
                Upload Controls
              </h3>

              <p
                className="
                  mt-0.5
                  text-[11px]
                "
                style={{
                  color:
                    "var(--text-secondary)",
                }}
              >
                {
                  uploadedFiles.length
                }{" "}
                file(s) selected
              </p>
            </div>

            {hasPendingUploads && (
              <div
                className="
                  inline-flex
                  items-center
                  rounded-lg
                  border
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                "
                style={{
                  borderColor:
                    "rgba(245, 213, 71, 0.20)",

                  background:
                    "rgba(245, 213, 71, 0.10)",

                  color:
                    "var(--accent)",
                }}
              >
                Pending
              </div>
            )}
          </div>
        </div>

        {/* BODY */}
        <div
          className="
            flex-1
            space-y-3
            overflow-y-auto
            p-4
          "
        >
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

          <button
            disabled={uploading}
            onClick={() =>
              inputRef.current.click()
            }
            className="
              hover-surface
              flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              text-sm
              font-medium
              transition-all
              duration-200

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            style={{
              borderColor:
                "var(--border)",

              background:
                "var(--panel-light)",

              color:
                "var(--text-primary)",
            }}
          >
            <Plus
              className="
                h-4
                w-4
              "
            />

            Add More Files
          </button>

          {fileInput}
        </div>

        {/* FOOTER */}
        <div
          className="
            shrink-0
            space-y-2
            p-4
          "
          style={{
            borderTop:
              "1px solid var(--border)",
          }}
        >
          <button
            disabled={
              uploading ||
              !hasPendingUploads
            }
            onClick={
              confirmUpload
            }
            className="
              flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              text-sm
              font-semibold
              transition-all
              duration-200

              disabled:cursor-not-allowed
              disabled:opacity-60
            "
            style={{
              background:
                uploading
                  ? "var(--panel-light)"
                  : "var(--accent)",

              color:
                uploading
                  ? "var(--text-secondary)"
                  : "#111917",
            }}
          >
            <Upload
              className="
                h-4
                w-4
              "
            />

            {uploading
              ? `Uploading ${uploadProgress}%`
              : "Upload Files"}
          </button>

          <button
            disabled={uploading}
            onClick={clearFiles}
            className="
              flex
              h-10
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              text-sm
              font-medium
              transition-all
              duration-200

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            style={{
              borderColor:
                "var(--border)",

              background:
                "var(--panel-light)",

              color:
                "var(--text-primary)",
            }}
          >
            <ArrowLeft
              className="
                h-4
                w-4
              "
            />

            Back
          </button>
        </div>
      </div>
    )
  }

  /* ========================================
     EMPTY MODE
  ======================================== */

  return (
    <div
      onDrop={onDrop}
      onDragOver={
        handleDragOver
      }
      onDragLeave={
        handleDragLeave
      }
      className="
        group
        relative
        w-full
        rounded-[24px]
        border-2
        border-dashed
        px-6
        py-8
        transition-all
        duration-300
        sm:px-8
        sm:py-10
      "
      style={{
        borderColor:
          isDragging
            ? "rgba(245, 213, 71, 0.40)"
            : "var(--border)",

        background:
          isDragging
            ? "var(--hover)"
            : "var(--panel)",

        boxShadow:
          isDragging
            ? "0 0 0 4px rgba(245, 213, 71, 0.08)"
            : "none",

        transform:
          isDragging
            ? "scale(1.005)"
            : "scale(1)",
      }}
    >
      {/* BACKGROUND GLOW */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
          rounded-[24px]
        "
      >
        <div
          className="
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
          "
          style={{
            background:
              isDragging
                ? "rgba(245, 213, 71, 0.10)"
                : "rgba(245, 213, 71, 0.03)",
          }}
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
        {/* ICON */}
        <div
          className="
            mb-4
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-[18px]
            border
            transition-all
            duration-500
          "
          style={{
            borderColor:
              isDragging
                ? "rgba(245, 213, 71, 0.35)"
                : "var(--border)",

            background:
              isDragging
                ? "rgba(245, 213, 71, 0.12)"
                : "var(--panel-light)",
          }}
        >
          {isDragging ? (
            <FileUp
              className="
                h-6
                w-6
              "
              style={{
                color:
                  "var(--accent)",
              }}
            />
          ) : (
            <Upload
              className="
                h-5
                w-5
              "
              style={{
                color:
                  "var(--text-primary)",
              }}
            />
          )}
        </div>

        {/* TEXT */}
        <h2
          className="
            text-lg
            font-bold
          "
          style={{
            color:
              "var(--text-primary)",
          }}
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
          "
          style={{
            color:
              "var(--text-secondary)",
          }}
        >
          Drag and drop PDF files
          here or manually select
          files to extend the AI
          knowledge base.
        </p>

        {/* CONTROLS */}
        <div
          className="
            mt-5
            flex
            w-full
            max-w-[340px]
            flex-col
            gap-3
          "
        >
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

          <button
            disabled={uploading}
            onClick={() =>
              inputRef.current.click()
            }
            className="
              flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              px-6
              text-sm
              font-semibold
              transition-all
              duration-300

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            style={{
              borderColor:
                "rgba(245, 213, 71, 0.20)",

              background:
                "var(--accent)",

              color: "#111917",
            }}
          >
            <Upload
              className="
                h-4
                w-4
              "
            />

            Choose Files
          </button>
        </div>

        <p
          className="
            mt-4
            text-[11px]
            tracking-wide
          "
          style={{
            color:
              "var(--text-muted)",
          }}
        >
          Supported format: PDF
        </p>

        {fileInput}
      </div>
    </div>
  )
}

export default UploadDropzone