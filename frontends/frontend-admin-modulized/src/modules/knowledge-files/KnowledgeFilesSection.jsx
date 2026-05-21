import { useState, useCallback } from "react"
import { Search, X } from "lucide-react"
import { useKnowledgeFiles } from "./useKnowledgeFiles.js"
import FileTable from "./FileTable.jsx"
import EditFileModal from "./EditFileModal.jsx"
import EmptyState from "../../shared/components/EmptyState.jsx"
import LoadingSpinner from "../../shared/components/LoadingSpinner.jsx"
import ErrorState from "../../shared/components/ErrorState.jsx"
import Pagination from "../../shared/components/Pagination.jsx"
import ConfirmDialog from "../../shared/components/ConfirmDialog.jsx"

const KnowledgeFilesSection = ({ onRefreshDocs }) => {
  const { allFiles, loading, error, refresh, deleteFile, updateFile, query, setQuery, page, setPage, totalPages, paginatedItems } = useKnowledgeFiles()
  const [editFile, setEditFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, file: null })

  const handleDelete = useCallback(async (file) => {
    try {
      await deleteFile(file.id || file.document_id)
      setConfirmDialog({ open: false, file: null })
    } catch (e) {
      alert(e.message || "Failed to delete file")
    }
  }, [deleteFile])

  const handleUpdate = useCallback(async (documentId, title, status) => {
    try {
      setSaving(true)
      await updateFile(documentId, title, status)
      setEditFile(null)
    } catch (e) {
      alert(e.message || "Failed to update file")
    } finally { setSaving(false) }
  }, [updateFile])

  return (
    <div className="section-padding space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex items-center max-w-sm">
          <Search className="absolute left-4 h-4 w-4 shrink-0 text-[#74877f]" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search files..." className="input-base pl-10 pr-10" />
          {query && <button onClick={() => setQuery("")} className="absolute right-3 rounded-lg p-1 text-[#74877f] hover:text-white"><X className="h-4 w-4" /></button>}
        </div>
        <span className="text-xs text-[#74877f]">{allFiles.length} file{allFiles.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="card-surface overflow-hidden">
        {loading && !allFiles.length ? (
          <LoadingSpinner label="Loading files..." />
        ) : error ? (
          <ErrorState title="Failed to load files" message={error} onRetry={refresh} />
        ) : paginatedItems.length === 0 ? (
          <EmptyState title={query ? "No files match your search" : "No files found"}
            message={query ? "Try different search terms." : "Upload files to see them here."} />
        ) : (
          <FileTable files={paginatedItems} onEdit={setEditFile} onDelete={f => setConfirmDialog({ open: true, file: f })} />
        )}
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </div>

      {editFile && <EditFileModal file={editFile} onClose={() => setEditFile(null)} onSave={handleUpdate} saving={saving} />}

      <ConfirmDialog open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, file: null })}
        onConfirm={() => handleDelete(confirmDialog.file)}
        title="Delete File"
        message={`Delete ${confirmDialog.file?.filename || confirmDialog.file?.name || "this file"}? This cannot be undone.`}
        confirmLabel="Delete" danger />
    </div>
  )
}

export default KnowledgeFilesSection
