import { useState } from 'react'
import ChatBubble from './components/ChatBubble.jsx'
import ChatWindow from './components/ChatWindow.jsx'
import ChatHistoryModal from './modals/ChatHistoryModal.jsx'
import ClearConversationModal from './modals/ClearConversationModal.jsx'
import SubmitTicketModal from './modals/SubmitTicketModal.jsx'
import CallAgentModal from './modals/CallAgentModal.jsx'
import ResolveConversationModal from './modals/ResolveConversationModal.jsx'
import AboutHelpDeskModal from './modals/AboutHelpDeskModal.jsx'

const BubbleChat = () => {
  const [open, setOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(null)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {open && (
        <div className="w-[360px] rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
          <ChatWindow onClose={() => setOpen(false)} onOpenModal={setActiveModal} />
        </div>
      )}

      <ChatBubble isOpen={open} onToggle={() => setOpen((value) => !value)} />

      {activeModal === 'history' && <ChatHistoryModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'clear' && <ClearConversationModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'ticket' && <SubmitTicketModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'call' && <CallAgentModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'resolve' && <ResolveConversationModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'about' && <AboutHelpDeskModal onClose={() => setActiveModal(null)} />}
    </div>
  )
}

export default BubbleChat
