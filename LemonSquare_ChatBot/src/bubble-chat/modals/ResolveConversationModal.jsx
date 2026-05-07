const ResolveConversationModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Resolve conversation</h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-900">Close</button>
        </div>
        <p className="mt-4 text-sm text-slate-600">Confirm that the current session is complete and mark it as resolved.</p>
        <div className="mt-6 flex justify-end">
          <button type="button" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white">Resolve</button>
        </div>
      </div>
    </div>
  )
}

export default ResolveConversationModal
