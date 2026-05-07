import ChatHeader from './ChatHeader.jsx'
import ChatMessages from './ChatMessages.jsx'
import ChatFooter from './ChatFooter.jsx'
import ChatMenu from './ChatMenu.jsx'
import { mockMessages } from '../data/mockMessages.js'

const ChatWindow = ({ onClose, onOpenModal }) => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-slate-950 text-white">
      <ChatHeader onClose={onClose} />
      <div className="border-b border-slate-800 px-4 py-4">
        <ChatMenu onSelect={onOpenModal} />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <ChatMessages messages={mockMessages} />
      </div>
      <ChatFooter />
    </div>
  )
}

export default ChatWindow
