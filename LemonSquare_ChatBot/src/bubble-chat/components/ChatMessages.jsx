import ChatMessage from './ChatMessage.jsx'

const ChatMessages = ({ messages }) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  )
}

export default ChatMessages
