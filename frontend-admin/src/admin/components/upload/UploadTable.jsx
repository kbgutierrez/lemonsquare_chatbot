import UploadTableRow from "./UploadTableRow"

import UploadPagination
  from "./UploadPagination"

import UploadMobileCard
  from "./UploadMobileCard"

import EmptyState
  from "../../../shared/components/EmptyState"

const UploadTable = ({
  uploadedFiles,
  paginatedFiles,
  currentPage,
  totalPages,
  removeFile,
  setCurrentPage,
}) => {

  const hasFiles =
    paginatedFiles.length > 0

  return (
    <div
      className="
        flex
        h-full
        min-h-0
        flex-1
        flex-col

        overflow-hidden

        rounded-[24px]

        border
        border-[#26332d]

        bg-[#121a18]
      "
    >
      {/* =====================================
          CONTENT
      ===================================== */}
      <div
        className="
          flex-1
          min-h-0
          overflow-hidden
        "
      >
        {/* =====================================
            EMPTY STATE
        ===================================== */}
        {!hasFiles && (
          <EmptyState
            title="No uploaded files"
            message="
Uploaded documents will appear here once added to the knowledge base.
            "
          />
        )}

        {/* =====================================
            MOBILE CARDS
        ===================================== */}
        {hasFiles && (
          <div
            className="
              h-full
              overflow-y-auto

              p-3

              md:hidden
            "
          >
            <div className="space-y-3">
              {paginatedFiles.map(
                (file) => (
                  <UploadMobileCard
                    key={file.id}
                    file={file}
                    removeFile={
                      removeFile
                    }
                  />
                )
              )}
            </div>
          </div>
        )}

        {/* =====================================
            DESKTOP TABLE
        ===================================== */}
        {hasFiles && (
          <div
            className="
              hidden
              h-full
              overflow-auto

              md:block
            "
          >
            <table
              className="
                w-full
                min-w-[900px]
                border-collapse
              "
            >
              {/* =====================================
                  TABLE HEAD
              ===================================== */}
              <thead
                className="
                  sticky
                  top-0
                  z-10

                  border-b
                  border-[#24312b]

                  bg-[#161f1d]/95

                  backdrop-blur-xl
                "
              >
                <tr>
                  {[
                    {
                      label: "File",
                      width: "w-[40%]",
                    },
                    {
                      label: "Size",
                      width: "w-[12%]",
                    },
                    {
                      label: "Category",
                      width: "w-[18%]",
                    },
                    {
                      label: "Status",
                      width: "w-[16%]",
                    },
                    {
                      label: "Uploaded",
                      width: "w-[10%]",
                    },
                    {
                      label: "",
                      width: "w-[4%]",
                    },
                  ].map(
                    ({
                      label,
                      width,
                    }) => (
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

                          text-[#70837a]
                        `}
                      >
                        {label}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              {/* =====================================
                  TABLE BODY
              ===================================== */}
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
        )}
      </div>

      {/* =====================================
          PAGINATION
      ===================================== */}
      {uploadedFiles.length > 0 && (
        <div
          className="
            shrink-0

            border-t
            border-[#24312b]

            bg-[#141c1a]
          "
        >
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
      )}
    </div>
  )
}

export default UploadTable