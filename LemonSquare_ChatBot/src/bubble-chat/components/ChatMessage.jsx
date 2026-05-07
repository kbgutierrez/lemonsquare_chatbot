const ChatMessage = ({ message }) => {
  const isAgent = message.sender === 'agent'

  return (
    <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm ${isAgent ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900'}`}>
        <p>{message.text}</p>
        <p className="mt-2 text-right text-xs text-slate-400">{message.time}</p>
      </div>
    </div>
  )
}

export default ChatMessage
