import { useState, useCallback } from "react"
import { Search, X, Plus } from "lucide-react"
import { useManualEntries } from "./useManualEntries.js"
import ManualEntryCard from "./ManualEntryCard.jsx"
import ManualEntryModal from "./ManualEntryModal.jsx"
import EmptyState from "../../shared/components/EmptyState.jsx"
import LoadingSpinner from "../../shared/components/LoadingSpinner.jsx"
import ErrorState from "../../shared/components/ErrorState.jsx"
import Pagination from "../../shared/components/Pagination.jsx"
import ConfirmDialog from "../../shared/components/ConfirmDialog.jsx"

const ManualEntriesSection = () => {
  const { allEntries, loading, error, refresh, query, setQuery, page, setPage, totalPages, paginatedItems } = useManualEntries()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState({ open: false, entry: null })

  const handleAdd = useCallback(() => { setEditingEntry(null); setModalOpen(true) }, [])
  const handleEdit = useCallback((entry) => { setEditingEntry(entry); setModalOpen(true) }, [])

  const handleSave = useCallback(async ({ id, title, category, content }) => {
    try {
      setSaving(true)
      const body = { title, category, content }
      if (id) {
        const res = await fetch(`/api/documents/manual/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body) })
        if (!res.ok) throw new Error(await res.text())
      } else {
        const res = await fetch("/api/documents/manual", { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body) })
        if (!res.ok) throw new Error(await res.text())
      }
      setModalOpen(false)
      refresh()
    } catch (e) {
      alert(e.message || "Failed to save entry")
    } finally { setSaving(false) }
  }, [refresh])

  const handleDelete = useCallback(async (entry) => {
    if (!entry?.id) return
    try {
      const res = await fetch(`/api/documents/manual/${entry.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      setConfirmDelete({ open: false, entry: null })
      setModalOpen(false)
      refresh()
    } catch (e) {
      alert(e.message || "Failed to delete entry")
    }
  }, [refresh])

  return (
    <div className="section-padding space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex items-center max-w-sm">
          <Search className="absolute left-4 h-4 w-4 shrink-0 text-[#74877f]" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search entries..." className="input-base pl-10 pr-10" />
          {query && <button onClick={() => setQuery("")} className="absolute right-3 rounded-lg p-1 text-[#74877f] hover:text-white"><X className="h-4 w-4" /></button>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#74877f]">{allEntries.length} entry{allEntries.length !== 1 ? "ies" : "y"}</span>
          <button onClick={handleAdd} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Entry
          </button>
        </div>
      </div>

      {loading && !allEntries.length ? (
        <LoadingSpinner label="Loading entries..." fullScreen />
      ) : error ? (
        <ErrorState title="Failed to load entries" message={error} onRetry={refresh} />
      ) : paginatedItems.length === 0 ? (
        <EmptyState title={query ? "No entries match your search" : "No manual entries"}
          message={query ? "Try different search terms." : "Add your first manual entry."}
          action={!query && <button onClick={handleAdd} className="btn-primary"><Plus className="h-4 w-4" /> Add Entry</button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedItems.map(entry => <ManualEntryCard key={entry.id || entry.title} entry={entry} onEdit={handleEdit} onDelete={e => setConfirmDelete({ open: true, entry: e })} />)}
        </div>
      )}

      <Pagination page={page} setPage={setPage} totalPages={totalPages} />

      <ManualEntryModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} onDelete={e => setConfirmDelete({ open: true, entry: e })} entry={editingEntry} loading={saving} />

      <ConfirmDialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, entry: null })}
        onConfirm={() => handleDelete(confirmDelete.entry)} title="Delete Entry"
        message={`Delete "${confirmDelete.entry?.title || "this entry"}"? This cannot be undone.`} confirmLabel="Delete" />
    </div>
  )
}

export default ManualEntriesSection
