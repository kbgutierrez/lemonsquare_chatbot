const ChatHeader = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between bg-slate-900 px-4 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Help Desk AI</p>
        <h2 className="text-lg font-semibold">Virtual support</h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
      >
        Close
      </button>
    </div>
  )
}

export default ChatHeader
