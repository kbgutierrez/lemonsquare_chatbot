import { useRef, useState } from 'react'
import { Upload, FileText, X, Plus } from 'lucide-react'

const ITEMS_PER_PAGE = 5

const UploadSection = () => {
  const inputRef = useRef(null)

  const [uploadedFiles, setUploadedFiles] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  const handleFiles = (files) => {
    const mappedFiles = Array.from(files).map((file, index) => ({
      id: `${file.name}-${Date.now()}-${index}`,
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.name.split('.').pop()?.toUpperCase(),
      status: 'Processing',
      uploadedAt: new Date().toLocaleString()
    }))

    setUploadedFiles((prev) => [...mappedFiles, ...prev])
  }

  const handleInputChange = (event) => {
    handleFiles(event.target.files)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    handleFiles(event.dataTransfer.files)
  }

  const removeFile = (id) => {
    setUploadedFiles((prev) =>
      prev.filter((file) => file.id !== id)
    )
  }

  const totalPages = Math.ceil(uploadedFiles.length / ITEMS_PER_PAGE)

  const paginatedFiles = uploadedFiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-violet-900">
          Upload Knowledge Files
        </h2>

        <p className="mt-1 text-sm text-violet-600">
          Upload documents for categorization and embedding preparation.
        </p>
      </div>

      {/* LARGE DROPZONE WHEN EMPTY */}
      {uploadedFiles.length === 0 ? (
        <div
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          className="rounded-2xl border border-dashed border-violet-300 bg-violet-50/60 p-10 transition-all duration-200 hover:bg-violet-100/50"
        >
          <div className="flex flex-col items-center justify-center text-center">

            <div className="mb-3 rounded-2xl bg-white p-3 shadow-sm">
              <Upload className="h-6 w-6 text-violet-600" />
            </div>

            <h3 className="text-base font-semibold text-violet-900">
              Drag & Drop Files
            </h3>

            <p className="mt-1 text-sm text-violet-600">
              PDF, TXT, DOCX, XLSX, CSV
            </p>

            <button
              onClick={() => inputRef.current.click()}
              className="mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02]"
            >
              Choose Files
            </button>

            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              onChange={handleInputChange}
            />
          </div>
        </div>
      ) : (
        /* MINIMIZED TOOLBAR WHEN FILES EXIST */
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-violet-50/70 px-4 py-3">

          <div>
            <h3 className="text-sm font-semibold text-violet-900">
              Files Uploaded
            </h3>

            <p className="text-xs text-violet-600">
              {uploadedFiles.length} file(s) ready for categorization
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={() => inputRef.current.click()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              Add More Files
            </button>

            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              onChange={handleInputChange}
            />
          </div>
        </div>
      )}

      {/* FILE TABLE */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-violet-100 bg-white">

        <div className="flex items-center justify-between border-b border-violet-100 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-violet-900">
              Uploaded Files
            </h3>

            <p className="text-xs text-violet-500">
              {uploadedFiles.length} file(s)
            </p>
          </div>
        </div>

        {/* EMPTY */}
        {uploadedFiles.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Upload className="h-10 w-10 text-violet-300" />

            <p className="mt-3 text-sm font-medium text-violet-700">
              No uploaded files yet
            </p>

            <p className="mt-1 text-xs text-violet-500">
              Upload files to begin categorization
            </p>
          </div>
        ) : (
          <>
            {/* TABLE */}
            <div className="flex-1 overflow-auto">

              <table className="min-w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-violet-50">
                  <tr className="text-left">

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-violet-700">
                      File
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-violet-700">
                      Size
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-violet-700">
                      Status
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-violet-700">
                      Uploaded
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-violet-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedFiles.map((file) => (
                    <tr
                      key={file.id}
                      className="border-t border-violet-100 hover:bg-violet-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-violet-100 p-2">
                            <FileText className="h-4 w-4 text-violet-700" />
                          </div>

                          <div>
                            <p className="max-w-[220px] truncate text-sm font-medium text-violet-900">
                              {file.name}
                            </p>

                            <p className="text-xs text-violet-500">
                              {file.type}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-violet-700">
                        {file.size}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                          {file.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-violet-600">
                        {file.uploadedAt}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeFile(file.id)}
                          className="rounded-lg p-2 text-red-500 transition-all hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-violet-100 px-4 py-3">

                <p className="text-xs text-violet-500">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex gap-2">

                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => prev - 1)
                    }
                    className="rounded-lg border border-violet-200 px-3 py-1 text-sm text-violet-700 transition hover:bg-violet-50 disabled:opacity-40"
                  >
                    Prev
                  </button>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => prev + 1)
                    }
                    className="rounded-lg border border-violet-200 px-3 py-1 text-sm text-violet-700 transition hover:bg-violet-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default UploadSection