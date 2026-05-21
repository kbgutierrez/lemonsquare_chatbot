import { useState, useRef } from "react"
import {
  FileText,
  UploadCloud,
  X,
} from "lucide-react"

import useFileUpload from "./useFileUpload.js"
import UploadStatusBadge from "./UploadStatusBadge.jsx"

const UploadSection = ({ onRefreshDocs }) => {
  const [rename, setRename] = useState("")

  const fileInputRef = useRef(null)

  const {
    files,
    addFiles,
    removeFile,
    uploadFiles,
    status,
    statusType,
    uploadProgress,
    result,
    dragged,
    setDragged,
    processing,
  } = useFileUpload({
    onRefreshDocs,
  })

  const handleDrop = (e) => {
    e.preventDefault()

    setDragged(false)

    addFiles(e.dataTransfer.files)
  }

  const handleFileChange = (e) => {
    addFiles(e.target.files)

    e.target.value = ""
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Upload Panel */}
        <div className="card-surface p-5 md:p-6">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <span className="text-label">
                Upload Files
              </span>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Upload to Knowledge Base
                </h2>

                <p className="mt-1 text-sm text-[#74877f]">
                  Upload and manage documents for the
                  AI knowledge system.
                </p>
              </div>
            </div>

            {/* Dropzone */}
            <div
              className={`relative flex min-h-[280px] flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed bg-[#141d1a] px-6 py-10 text-center transition-all duration-200 ${
                dragged
                  ? "border-[#f5d547] bg-[#f5d547]/5"
                  : "border-[#2a3a33] hover:border-[#f5d547]/30"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) =>
                e.preventDefault()
              }
              onDragEnter={() => setDragged(true)}
              onDragLeave={() => setDragged(false)}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-[#2b3933] bg-[#18211f] text-[#f5d547] shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-all duration-200 hover:scale-[1.02] hover:border-[#f5d547]/20 hover:bg-[#1f2a27]"
              >
                <UploadCloud className="h-10 w-10" />
              </button>

              <div className="max-w-md">
                <p className="text-base font-semibold text-white">
                  Drag & drop files here
                </p>

                <p className="mt-2 text-sm leading-relaxed text-[#81958c]">
                  Or click the upload icon to browse
                  your files.
                </p>

                <p className="mt-4 text-xs text-[#627a71]">
                  Supports PDF, DOCX, TXT, CSV, XLSX,
                  PNG, JPG
                </p>
              </div>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-white">
                    {files.length} file
                    {files.length > 1 ? "s" : ""}{" "}
                    selected
                  </span>

                  <button
                    onClick={() =>
                      files.forEach((f) =>
                        removeFile(f)
                      )
                    }
                    className="text-xs font-medium text-[#74877f] transition-colors hover:text-red-400"
                  >
                    Clear all
                  </button>
                </div>

                <div className="flex max-h-[260px] flex-col gap-2 overflow-y-auto rounded-2xl border border-[#2a3a33] bg-[#141d1a] p-3">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center gap-3 rounded-xl border border-[#26332d] bg-[#18211f] px-3 py-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#111917]">
                        <FileText className="h-4 w-4 text-[#8ea59b]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {file.name}
                        </p>

                        <p className="mt-0.5 text-xs text-[#74877f]">
                          {(
                            file.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          removeFile(file)
                        }
                        className="shrink-0 rounded-lg p-2 text-[#74877f] transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rename + Upload */}
            <div className="flex flex-col gap-3 lg:flex-row">
              <input
                type="text"
                value={rename}
                onChange={(e) =>
                  setRename(e.target.value)
                }
                placeholder="Rename file (optional)"
                className="input-base flex-1"
              />

              <button
                onClick={() =>
                  uploadFiles({ rename })
                }
                disabled={
                  !files.length || processing
                }
                className="btn-primary shrink-0 px-6"
              >
                {processing
                  ? `Uploading ${uploadProgress}%...`
                  : "Upload Files"}
              </button>
            </div>

            {/* Progress */}
            {processing && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#74877f]">
                    Processing...
                  </span>

                  <span className="font-semibold text-white">
                    {uploadProgress}%
                  </span>
                </div>

                <div className="relative h-3 overflow-hidden rounded-full bg-[#0b1110]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#95c11f] transition-all duration-300"
                    style={{
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <UploadStatusBadge
              status={status}
              statusType={statusType}
            />
          </div>
        </div>

        {/* Result Panel */}
        <div className="card-surface flex min-h-[720px] flex-col overflow-hidden">
          <div className="border-b border-[#26332d] px-5 py-4 md:px-6">
            <div className="flex flex-col gap-1">
              <span className="text-label">
                Server Response
              </span>

              <p className="text-sm text-[#74877f]">
                Upload processing results and backend
                responses.
              </p>
            </div>
          </div>

          <div className="flex flex-1 overflow-auto p-5 md:p-6">
            {result ? (
              <pre className="w-full whitespace-pre-wrap break-words rounded-2xl border border-[#26332d] bg-[#111917] p-4 text-xs leading-relaxed text-[#9eb0a9]">
                {result}
              </pre>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-[#26332d] bg-[#111917]/40 p-8 text-center">
                <div className="max-w-sm">
                  <p className="text-sm font-medium text-white">
                    No upload response yet
                  </p>

                  <p className="mt-2 text-sm leading-relaxed text-[#74877f]">
                    Upload a file to view ingestion
                    logs and server responses here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadSection