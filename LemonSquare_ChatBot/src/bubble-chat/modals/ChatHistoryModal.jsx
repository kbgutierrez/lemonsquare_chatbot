const ChatHistoryModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Chat History</h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-900">Close</button>
        </div>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="font-medium">Recent conversation</p>
            <p className="mt-2">This is a preview of your last support interactions.</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="font-medium">Support ticket</p>
            <p className="mt-2">A mock ticket entry is available here for design review.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatHistoryModal
