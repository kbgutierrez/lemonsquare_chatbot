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
        h-full
        min-h-0
        flex-1
        flex-col

        overflow-hidden

        rounded-[30px]

        border
        border-[#26332d]

        bg-[#121a18]

        shadow-[0_10px_40px_rgba(0,0,0,0.28)]
      "
    >
      {/* HEADER */}
      <div
        className="
          flex
          shrink-0
          items-center
          justify-between

          border-b
          border-[#24312b]

          px-5
          py-4
        "
      >
        {/* LEFT */}
        <div>
          <h3
            className="
              text-base
              font-semibold

              tracking-tight

              text-white
            "
          >
            Uploaded Files
          </h3>

          <p
            className="
              mt-1

              text-xs

              text-[#7f948b]
            "
          >
            {uploadedFiles.length} file(s)
            uploaded
          </p>
        </div>

        {/* STATUS */}
        <div
          className="
            hidden
            shrink-0
            items-center
            gap-2

            rounded-2xl

            border
            border-[#2f3b36]

            bg-[#18211f]

            px-3
            py-2

            md:flex
          "
        >
          <div
            className="
              h-2
              w-2

              rounded-full

              bg-[#f5d547]
            "
          />

          <span
            className="
              text-xs
              font-medium

              text-[#c7d3ce]
            "
          >
            Knowledge Storage
          </span>
        </div>
      </div>

      {/* TABLE AREA */}
      <div
        className="
          min-h-0
          flex-1
          overflow-hidden
        "
      >
        {/* SCROLL CONTAINER */}
        <div
          className="
            h-full
            overflow-auto

            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          <table
            className="
              min-w-full
              border-collapse
            "
          >
            {/* HEAD */}
            <thead
              className="
                sticky
                top-0
                z-10

                bg-[#161f1d]/95

                backdrop-blur-xl
              "
            >
              <tr className="text-left">

                <th
                  className="
                    px-5
                    py-4

                    text-[11px]
                    font-semibold
                    uppercase

                    tracking-[0.18em]

                    text-[#73867d]
                  "
                >
                  File
                </th>

                <th
                  className="
                    px-5
                    py-4

                    text-[11px]
                    font-semibold
                    uppercase

                    tracking-[0.18em]

                    text-[#73867d]
                  "
                >
                  Size
                </th>

                <th
                  className="
                    px-5
                    py-4

                    text-[11px]
                    font-semibold
                    uppercase

                    tracking-[0.18em]

                    text-[#73867d]
                  "
                >
                  Category
                </th>

                <th
                  className="
                    px-5
                    py-4

                    text-[11px]
                    font-semibold
                    uppercase

                    tracking-[0.18em]

                    text-[#73867d]
                  "
                >
                  Status
                </th>

                <th
                  className="
                    px-5
                    py-4

                    text-[11px]
                    font-semibold
                    uppercase

                    tracking-[0.18em]

                    text-[#73867d]
                  "
                >
                  Uploaded
                </th>

                <th
                  className="
                    px-5
                    py-4

                    text-[11px]
                    font-semibold
                    uppercase

                    tracking-[0.18em]

                    text-[#73867d]
                  "
                >
                  Action
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {paginatedFiles.length >
              0 ? (
                paginatedFiles.map(
                  (file) => (
                    <UploadTableRow
                      key={file.id}
                      file={file}
                      removeFile={
                        removeFile
                      }
                    />
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="
                      px-6
                      py-20

                      text-center
                    "
                  >
                    <div
                      className="
                        flex
                        flex-col
                        items-center
                        justify-center
                      "
                    >
                      <div
                        className="
                          mb-4

                          flex
                          h-16
                          w-16
                          items-center
                          justify-center

                          rounded-3xl

                          border
                          border-[#2b3933]

                          bg-[#18211f]
                        "
                      >
                        <div
                          className="
                            h-3
                            w-3

                            rounded-full

                            bg-[#f5d547]
                          "
                        />
                      </div>

                      <h3
                        className="
                          text-sm
                          font-semibold

                          text-white
                        "
                      >
                        No uploaded files
                      </h3>

                      <p
                        className="
                          mt-2

                          max-w-sm

                          text-sm

                          text-[#81958c]
                        "
                      >
                        Uploaded documents will
                        appear here once added
                        to the knowledge base.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div
        className="
          shrink-0

          border-t
          border-[#24312b]
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
    </div>
  )
}

export default UploadTable