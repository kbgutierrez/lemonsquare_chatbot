const CallAgentModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Call an agent</h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-900">Close</button>
        </div>
        <p className="mt-4 text-sm text-slate-600">A live support agent will assist you shortly.</p>
        <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
          <p>Agent escalation placeholder</p>
        </div>
      </div>
    </div>
  )
}

export default CallAgentModal
