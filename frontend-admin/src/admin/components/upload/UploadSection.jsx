import UploadDropzone from "./UploadDropzone.jsx"
import UploadTable from "./UploadTable.jsx"

import {
  useFileUpload,
} from "../../hooks/useFileUpload.js"

const UploadSection = () => {

  const {
    inputRef,

    uploadedFiles,

    currentPage,
    totalPages,
    paginatedFiles,

    hasPendingUploads,
    showTable,

    categories,
    selectedCategory,
    setSelectedCategory,

    handleInputChange,
    handleDrop,

    removeFile,
    clearFiles,

    confirmUpload,

    uploading,
    uploadProgress,

    setCurrentPage,
  } = useFileUpload()

  return (
    <div
      className="
        mx-auto

        flex
        h-full
        min-h-0
        w-full
        max-w-[1800px]
        flex-col

        overflow-hidden
      "
    >
      {/* =====================================
          DESKTOP HEADER
      ===================================== */}
      <div
        className={`
          hidden
          shrink-0

          md:block

          ${
            showTable
              ? "mb-4"
              : "mb-6"
          }
        `}
      >
        <div
          className="
            flex
            items-center
            justify-between

            gap-4
          "
        >
          <div>
            <h1
              className="
                text-3xl
                font-black

                tracking-tight

                text-white
              "
            >
              Upload Knowledge Files
            </h1>

            <p
              className="
                mt-2

                text-sm

                text-[#7f948b]
              "
            >
              Upload PDFs to extend the AI
              knowledge base in realtime.
            </p>
          </div>

          {hasPendingUploads && (
            <div
              className="
                rounded-2xl

                border
                border-amber-500/20

                bg-amber-500/10

                px-4
                py-2

                text-sm
                font-medium

                text-amber-300
              "
            >
              Pending uploads in queue
            </div>
          )}
        </div>
      </div>

      {/* =====================================
          EMPTY STATE
      ===================================== */}
      {!showTable && (
        <div
          className="
            flex
            flex-1
            min-h-0

            items-start
            justify-center

            overflow-y-auto
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-3xl
            "
          >
            <UploadDropzone
              uploadedFiles={
                uploadedFiles
              }

              inputRef={
                inputRef
              }

              handleDrop={
                handleDrop
              }

              handleInputChange={
                handleInputChange
              }

              clearFiles={
                clearFiles
              }

              confirmUpload={
                confirmUpload
              }

              uploading={
                uploading
              }

              uploadProgress={
                uploadProgress
              }

              hasPendingUploads={
                hasPendingUploads
              }

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
          </div>
        </div>
      )}

      {/* =====================================
          FILES STATE
      ===================================== */}
      {showTable && (
        <>
          {/* =====================================
              MOBILE FLOATING CONTROLS
          ===================================== */}
          <div
            className="
              fixed
              bottom-0
              left-0
              right-0
              z-50

              border-t
              border-[#26332d]

              bg-[#0c1311]/95

              backdrop-blur-xl

              px-3
              py-3

              md:hidden
            "
          >
            <div
              className="
                mx-auto
                flex
                max-w-[700px]
                flex-col
                gap-2
              "
            >
              <UploadDropzone
                uploadedFiles={
                  uploadedFiles
                }

                inputRef={
                  inputRef
                }

                handleDrop={
                  handleDrop
                }

                handleInputChange={
                  handleInputChange
                }

                clearFiles={
                  clearFiles
                }

                confirmUpload={
                  confirmUpload
                }

                uploading={
                  uploading
                }

                uploadProgress={
                  uploadProgress
                }

                hasPendingUploads={
                  hasPendingUploads
                }

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
            </div>
          </div>

          {/* =====================================
              MAIN LAYOUT
          ===================================== */}
          <div
            className="
              flex
              flex-1
              min-h-0

              gap-4

              overflow-hidden
            "
          >
            {/* =====================================
                DESKTOP SIDEBAR
            ===================================== */}
            <div
              className="
                hidden
                w-[360px]
                shrink-0

                overflow-hidden

                md:block
              "
            >
              <div
                className="
                  h-full
                  overflow-y-auto
                "
              >
                <UploadDropzone
                  uploadedFiles={
                    uploadedFiles
                  }

                  inputRef={
                    inputRef
                  }

                  handleDrop={
                    handleDrop
                  }

                  handleInputChange={
                    handleInputChange
                  }

                  clearFiles={
                    clearFiles
                  }

                  confirmUpload={
                    confirmUpload
                  }

                  uploading={
                    uploading
                  }

                  uploadProgress={
                    uploadProgress
                  }

                  hasPendingUploads={
                    hasPendingUploads
                  }

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
              </div>
            </div>

            {/* =====================================
                TABLE CONTAINER
            ===================================== */}
            <div
              className="
                flex-1
                min-h-0

                overflow-hidden

                rounded-[28px]

                border
                border-[#26332d]

                bg-[#101715]

                pb-[180px]

                md:pb-0
              "
            >
              <div
                className="
                  flex
                  h-full
                  flex-col
                  overflow-hidden
                "
              >
                {/* =====================================
                    STICKY HEADER
                ===================================== */}
                <div
                  className="
                    sticky
                    top-0
                    z-20

                    shrink-0

                    border-b
                    border-[#26332d]

                    bg-[#101715]/95

                    px-4
                    py-4

                    backdrop-blur-xl
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <div>
                      <h2
                        className="
                          text-lg
                          font-bold
                          text-white

                          md:text-xl
                        "
                      >
                        Uploaded Files
                      </h2>

                      <p
                        className="
                          mt-1

                          text-xs
                          text-[#7f948b]

                          md:text-sm
                        "
                      >
                        {uploadedFiles.length} file(s)
                        currently queued
                      </p>
                    </div>

                    {hasPendingUploads && (
                      <div
                        className="
                          rounded-xl

                          border
                          border-amber-500/20

                          bg-amber-500/10

                          px-3
                          py-2

                          text-[11px]
                          font-semibold

                          text-amber-300

                          md:text-xs
                        "
                      >
                        Pending Uploads
                      </div>
                    )}
                  </div>
                </div>

                {/* =====================================
                    SCROLLABLE TABLE
                ===================================== */}
                <div
                  className="
                    flex-1
                    min-h-0

                    overflow-y-auto
                    overflow-x-hidden

                    px-2
                    py-2

                    md:px-4
                    md:py-4
                  "
                >
                  <UploadTable
                    uploadedFiles={
                      uploadedFiles
                    }

                    paginatedFiles={
                      paginatedFiles
                    }

                    currentPage={
                      currentPage
                    }

                    totalPages={
                      totalPages
                    }

                    removeFile={
                      removeFile
                    }

                    setCurrentPage={
                      setCurrentPage
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UploadSection