const ClearConversationModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">Clear conversation</h3>
        <p className="mt-3 text-sm text-slate-600">This is a placeholder confirmation modal for clearing the current chat session.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700">Cancel</button>
          <button type="button" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white">Clear</button>
        </div>
      </div>
    </div>
  )
}

export default ClearConversationModal
