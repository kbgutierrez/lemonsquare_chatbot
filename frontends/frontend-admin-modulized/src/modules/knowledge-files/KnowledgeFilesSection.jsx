import {
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react"

import {
  Search,
  X,
} from "lucide-react"

import {
  useKnowledgeFiles,
} from "./useKnowledgeFiles.js"

import FileTable
  from "./FileTable.jsx"

import EditFileModal
  from "./EditFileModal.jsx"

import EmptyState
  from "../../shared/components/EmptyState.jsx"

import LoadingSpinner
  from "../../shared/components/LoadingSpinner.jsx"

import ErrorState
  from "../../shared/components/ErrorState.jsx"

import Pagination
  from "../../shared/components/Pagination.jsx"

import ConfirmDialog
  from "../../shared/components/ConfirmDialog.jsx"

import {
  useHorizontalDragScroll,
} from "../../shared/hooks/useHorizontalDragScroll.js"

const KnowledgeFilesSection = ({
  onRefreshDocs,
}) => {

  const {
    allFiles,
    filteredFiles,
    categories,

    loading,
    error,
    refresh,

    deleteFile,
    updateFile,

    query,
    setQuery,

    selectedCategory,
    setSelectedCategory,

    page,
    setPage,
    totalPages,
    paginatedItems,
  } = useKnowledgeFiles()

  const [
    editFile,
    setEditFile,
  ] = useState(null)

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    confirmDialog,
    setConfirmDialog,
  ] = useState({
    open: false,
    file: null,
  })

  const tabsRef =
    useRef(null)

  useHorizontalDragScroll(
    tabsRef
  )

  /* ========================================
     SAFE PAGINATED FILES
  ======================================== */

  const safePaginatedFiles =
    useMemo(() => {

      return Array.isArray(
        paginatedItems
      )
        ? paginatedItems
        : []

    }, [paginatedItems])

  /* ========================================
     DELETE
  ======================================== */

  const handleDelete =
    useCallback(
      async (
        file
      ) => {

        if (
          !file?.document_id
        ) {

          alert(
            "Missing document ID"
          )

          return
        }

        try {

          await deleteFile(
            file.document_id
          )

          setConfirmDialog({
            open: false,
            file: null,
          })

          /* FORCE UI SYNC */
          await refresh()

          onRefreshDocs?.()

        } catch (error) {

          console.error(
            "DELETE_DOCUMENT_ERROR",
            error
          )

          alert(
            error?.message ||
            "Failed to delete file"
          )
        }
      },
      [
        deleteFile,
        refresh,
        onRefreshDocs,
      ]
    )

  /* ========================================
     UPDATE
  ======================================== */

  const handleUpdate =
    useCallback(
      async (
        documentId,
        fileName,
        category
      ) => {

        try {

          setSaving(true)

          await updateFile(
            documentId,
            fileName,
            category
          )

          /* CLOSE MODAL */
          setEditFile(null)

          /* FORCE CACHE + UI SYNC */
          await refresh()

          onRefreshDocs?.()

        } catch (error) {

          console.error(
            "UPDATE_DOCUMENT_ERROR",
            error
          )

          alert(
            error?.message ||
            "Failed to update file"
          )

        } finally {

          setSaving(false)
        }
      },
      [
        updateFile,
        refresh,
        onRefreshDocs,
      ]
    )

  return (
    <div
      className="
        mx-auto
        flex
        h-full
        w-full
        max-w-[1500px]
        min-h-0
        flex-col
        gap-4
      "
    >
      {/* CATEGORY TABS */}
      <div className="relative">

        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-10 bg-gradient-to-r from-[#0f1614] to-transparent" />

        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-10 bg-gradient-to-l from-[#0f1614] to-transparent" />

        <div
          ref={tabsRef}

          className="
            cursor-grab
            overflow-x-auto

            active:cursor-grabbing

            border-b
            border-[#24312b]

            pb-2

            select-none

            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          <div className="flex min-w-max items-center gap-2 pr-6">

            {categories.map(
              (category) => {

                const active =
                  selectedCategory ===
                  category.id

                return (
                  <button
                    key={category.id}

                    onClick={() =>
                      setSelectedCategory(
                        category.id
                      )
                    }

                    className={`
                      relative
                      shrink-0

                      rounded-t-xl

                      px-4
                      py-2.5

                      text-[13px]
                      font-medium
                      whitespace-nowrap

                      transition-all
                      duration-200

                      ${
                        active
                          ? `
                            border
                            border-b-0
                            border-[#2d3b35]

                            bg-[#151d1b]

                            text-white
                          `
                          : `
                            text-[#7f948b]

                            hover:text-white
                          `
                      }
                    `}
                  >
                    {category.name}

                    {active && (
                      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#f5d547]" />
                    )}
                  </button>
                )
              }
            )}

          </div>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div
        className="
          flex
          min-h-0
          flex-1
          flex-col

          overflow-hidden

          rounded-[24px]
          border
          border-[#26332d]

          bg-[#121a18]

          shadow-[0_8px_32px_rgba(0,0,0,0.24)]
        "
      >
        {/* TOP BAR */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#24312b] px-4 py-3">

          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Knowledge Files
            </h2>

            <p className="mt-0.5 text-xs text-[#7f948b]">
              {filteredFiles.length} document(s) found
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative flex h-11 w-full items-center gap-2.5 rounded-xl border border-[#2d3b35] bg-[#18211f] px-3.5 sm:w-[300px]">

            <Search className="h-4 w-4 shrink-0 text-[#70847b]" />

            <input
              type="text"

              value={query}

              onChange={(e) =>
                setQuery(
                  e.target.value
                )
              }

              placeholder="Search files..."

              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#70847b]"
            />

            {query && (
              <button
                onClick={() =>
                  setQuery("")
                }

                className="text-[#70847b] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}

          </div>
        </div>

        {/* CONTENT */}
        <div className="min-h-0 flex-1 overflow-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

          {loading &&
          !allFiles.length ? (

            <div className="flex h-full items-center justify-center">
              <LoadingSpinner label="Loading files..." />
            </div>

          ) : error ? (

            <ErrorState
              title="Failed to load files"

              message={
                typeof error === "string"
                  ? error
                  : error?.message ||
                    "Unknown error"
              }

              onRetry={refresh}
            />

          ) : filteredFiles.length === 0 ? (

            <EmptyState
              title={
                query
                  ? "No files match your search"
                  : "No files found"
              }

              message={
                query
                  ? "Try different search terms."
                  : "Upload files to see them here."
              }
            />

          ) : (

            <FileTable
              files={safePaginatedFiles}

              onEdit={(
                file
              ) =>
                setEditFile(
                  file
                )
              }

              onDelete={(file) =>
                setConfirmDialog({
                  open: true,
                  file,
                })
              }
            />

          )}
        </div>

        {/* PAGINATION */}
        <div className="border-t border-[#24312b] px-4 py-3">

          <Pagination
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />

        </div>
      </div>

      {/* EDIT MODAL */}
      {editFile && (
        <EditFileModal
          file={editFile}

          categories={
            categories
              .filter(
                (category) =>
                  category.id !==
                  "all"
              )
              .map(
                (category) =>
                  category.name
              )
          }

          onClose={() =>
            setEditFile(null)
          }

          onSave={handleUpdate}

          saving={saving}
        />
      )}

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        open={confirmDialog.open}

        onClose={() =>
          setConfirmDialog({
            open: false,
            file: null,
          })
        }

        onConfirm={() =>
          handleDelete(
            confirmDialog.file
          )
        }

        title="Delete File"

        message={`Delete "${
          confirmDialog.file
            ?.file_name ||
          "this document"
        }"? This cannot be undone.`}

        confirmLabel="Delete"

        danger
      />
    </div>
  )
}

export default KnowledgeFilesSection