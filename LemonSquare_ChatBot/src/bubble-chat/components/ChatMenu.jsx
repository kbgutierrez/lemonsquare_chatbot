const options = [
  { id: 'history', label: 'Chat History' },
  { id: 'clear', label: 'Clear Conversation' },
  { id: 'ticket', label: 'Submit Ticket' },
  { id: 'call', label: 'Call Agent' },
  { id: 'resolve', label: 'Resolve Conversation' },
  { id: 'about', label: 'About Help Desk AI' },
]

const ChatMenu = ({ onSelect }) => {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default ChatMenu
