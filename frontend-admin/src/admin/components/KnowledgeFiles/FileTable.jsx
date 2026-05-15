import {
  useState,
} from "react"

import FileTableHeader
  from "./components/FileTableHeader"

import FileTableRow
  from "./components/FileTableRow"

import EditFileModal
  from "./modals/EditFileModal"

import EmptyState
  from "../../../shared/components/EmptyState"

const FileTable = ({
  files = [],
  categories = [],
  onDelete,
  onUpdate,
}) => {

  const [
    editingFile,
    setEditingFile,
  ] = useState(null)

  const hasFiles =
    files.length > 0

  return (
    <>
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
            w-full
            min-w-[900px]

            border-separate
            border-spacing-0
          "
        >
          {/* HEADER */}
          <FileTableHeader />

          {/* BODY */}
          {hasFiles && (
            <tbody>
              {files.map(
                (file) => (
                  <FileTableRow
                    key={
                      file.document_id
                    }

                    file={file}

                    onEdit={
                      setEditingFile
                    }

                    onDelete={
                      onDelete
                    }
                  />
                )
              )}
            </tbody>
          )}
        </table>

        {/* EMPTY */}
        {!hasFiles && (
          <div className="py-20">
            <EmptyState
              title="No files found"
              message="
No knowledge files matched your current filters.
              "
            />
          </div>
        )}
      </div>

      {/* MODAL */}
      <EditFileModal
        open={Boolean(
          editingFile
        )}

        file={editingFile}

        categories={
          categories
        }

        onClose={() =>
          setEditingFile(
            null
          )
        }

        onSave={
          onUpdate
        }
      />
    </>
  )
}

export default FileTable