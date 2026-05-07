const ChatFooter = () => {
  return (
    <div className="border-t border-slate-800 bg-slate-950 px-4 py-4">
      <div className="flex items-center gap-3 rounded-3xl bg-slate-900 px-3 py-3">
        <input
          type="text"
          readOnly
          placeholder="Type a message..."
          className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
        />
        <button type="button" className="rounded-2xl bg-slate-700 px-4 py-2 text-sm text-white">
          Send
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">Mock input only — no real chat submission.</p>
    </div>
  )
}

export default ChatFooter
