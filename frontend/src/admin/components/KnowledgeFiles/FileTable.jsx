import {
  useState,
} from "react"

import FileTableHeader
  from "./components/FileTableHeader"

import FileTableEmpty
  from "./components/FileTableEmpty"

import FileTableRow
  from "./components/FileTableRow"

import EditFileModal
  from "./modals/EditFileModal"

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
          <tbody>
            {files.length ===
            0 ? (
              <FileTableEmpty />
            ) : (
              files.map(
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
              )
            )}
          </tbody>
        </table>
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