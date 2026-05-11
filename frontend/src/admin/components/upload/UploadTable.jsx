import UploadTableRow from "./UploadTableRow"
import UploadPagination from "./UploadPagination"

const UploadTable = ({
  uploadedFiles,
  paginatedFiles,
  currentPage,
  totalPages,
  removeFile,
  setCurrentPage,
}) => {

  return (
    <div
      className="
        flex
        flex-1
        flex-col

        overflow-hidden

        rounded-2xl

        border
        border-violet-100

        bg-white
      "
    >
      <div
        className="
          flex
          items-center
          justify-between

          border-b
          border-violet-100

          px-4
          py-3
        "
      >
        <div>
          <h3 className="text-sm font-semibold text-violet-900">
            Uploaded Files
          </h3>

          <p className="text-xs text-violet-500">
            {uploadedFiles.length} file(s)
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="min-w-full border-collapse">

          <thead
            className="
              sticky
              top-0
              z-10

              bg-violet-50
            "
          >
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
            {paginatedFiles.map(
              (file) => (
                <UploadTableRow
                  key={file.id}
                  file={file}
                  removeFile={
                    removeFile
                  }
                />
              )
            )}
          </tbody>
        </table>
      </div>

      <UploadPagination
        currentPage={
          currentPage
        }
        totalPages={
          totalPages
        }
        setCurrentPage={
          setCurrentPage
        }
      />
    </div>
  )
}

export default UploadTable