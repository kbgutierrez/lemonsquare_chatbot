import UploadTableRow from "./UploadTableRow"
import UploadPagination from "./UploadPagination"
import UploadMobileCard from "./UploadMobileCard"

import EmptyState from "../../../shared/components/EmptyState"

const UploadTable = ({
  uploadedFiles,
  paginatedFiles,
  currentPage,
  totalPages,
  removeFile,
  setCurrentPage,
}) => {
  const hasFiles = paginatedFiles.length > 0

  const renderContent = () => {
    if (!hasFiles) {
      return (
        <EmptyState
          title="No uploaded files"
          message="Uploaded documents will appear here once added to the knowledge base."
        />
      )
    }

    return (
      <>
        {/* MOBILE VIEW */}
        <div className="h-full overflow-y-auto p-3 md:hidden">
          <div className="space-y-3">
            {paginatedFiles.map((file) => (
              <UploadMobileCard
                key={file.id}
                file={file}
                removeFile={removeFile}
              />
            ))}
          </div>
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden h-full overflow-auto md:block">
          <table className="w-full min-w-[900px] border-collapse">
            {/* TABLE HEAD */}
            <thead
              className="
                sticky
                top-0
                z-10
                backdrop-blur-xl
              "
              style={{
                borderBottom: "1px solid var(--border)",
                background: "color-mix(in srgb, var(--panel) 92%, transparent)",
              }}
            >
              <tr>
                {[
                  { label: "File", width: "w-[40%]" },
                  { label: "Size", width: "w-[12%]" },
                  { label: "Category", width: "w-[18%]" },
                  { label: "Status", width: "w-[16%]" },
                  { label: "Uploaded", width: "w-[10%]" },
                  { label: "", width: "w-[4%]" },
                ].map(({ label, width }) => (
                  <th
                    key={label}
                    className={`
                      ${width}
                      px-4
                      py-3
                      text-left
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                    `}
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {paginatedFiles.map((file) => (
                <UploadTableRow
                  key={file.id}
                  file={file}
                  removeFile={removeFile}
                />
              ))}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  return (
    <div
      className="
        panel-base
        flex
        h-full
        min-h-0
        flex-1
        flex-col
        overflow-hidden
        rounded-[24px]
      "
    >
      {/* CONTENT */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {renderContent()}
      </div>

      {/* PAGINATION */}
      {uploadedFiles.length > 0 && (
        <div
          className="shrink-0"
          style={{
            borderTop: "1px solid var(--border)",
            background: "var(--panel-light)",
          }}
        >
          <UploadPagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}

export default UploadTable