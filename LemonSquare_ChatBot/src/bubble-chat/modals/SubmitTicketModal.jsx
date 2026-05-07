const SubmitTicketModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Submit a ticket</h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-900">Close</button>
        </div>
        <div className="mt-5 space-y-4 text-sm text-slate-700">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-medium">Ticket title</p>
            <div className="mt-2 h-10 rounded-2xl bg-white p-3 text-slate-500">Placeholder input</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-medium">Description</p>
            <div className="mt-2 h-24 rounded-2xl bg-white p-3 text-slate-500">Placeholder textarea</div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button type="button" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white">Submit ticket</button>
        </div>
      </div>
    </div>
  )
}

export default SubmitTicketModal
