import { useRef, useState } from "react"
import FileTableHeader from "./components/FileTableHeader"
import FileTableRow from "./components/FileTableRow"
import EditFileModal from "./modals/EditFileModal"
import EmptyState from "../../../shared/components/EmptyState"
import { useHorizontalDragScroll } from "../../../shared/hooks/useHorizontalDragScroll"

const FileTable = ({
  files = [],
  categories = [],
  onDelete,
  onHardDelete,
  onRestore,
  onUpdate,
}) => {
  const [editingFile, setEditingFile] = useState(null)

  const hasFiles =
    files.length > 0

  const tableRef =
    useRef(null)

  useHorizontalDragScroll(
    tableRef
  )

  return (
    <>
      <div
        ref={tableRef}
        className="h-full cursor-grab overflow-auto active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <table className="w-full min-w-[1050px] border-separate border-spacing-0">
          <FileTableHeader />

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
                    onHardDelete={
                      onHardDelete
                    }
                    onRestore={
                      onRestore
                    }
                  />
                )
              )}
            </tbody>
          )}
        </table>

        {!hasFiles && (
          <div className="py-16">
            <EmptyState
              title="No files found"
              message="No knowledge files matched your current filters."
            />
          </div>
        )}
      </div>

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
        onSave={onUpdate}
      />
    </>
  )
}

export default FileTable