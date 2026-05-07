const ChatBubble = ({ isOpen, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-3 rounded-full bg-slate-900 px-5 py-4 text-white shadow-2xl ring-1 ring-slate-700 transition hover:bg-slate-800"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900">AI</span>
      <span>{isOpen ? 'Close help desk' : 'Open help desk'}</span>
    </button>
  )
}

export default ChatBubble
