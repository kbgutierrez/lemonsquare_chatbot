import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import ChatBubble from "./components/ChatBubble.jsx"
import ChatWindow from "./components/ChatWindow.jsx"
import ChatHistoryModal from "./modals/ChatHistoryModal.jsx"
import SubmitTicketModal from "./modals/SubmitTicketModal.jsx"
import ThemeModal from "./modals/ThemeModal.jsx"
import ResolveConversationModal from "./modals/ResolveConversationModal.jsx"
import AboutHelpDeskModal from "./modals/AboutHelpDeskModal.jsx"
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx"
import chatbotService from "./services/chatbotService"
import ticketService from "./services/ticketService"
import { useBubbleDrag } from "./hooks/useBubbleDrag"
import { useChatMessages } from "./hooks/useChatMessages"
import { cn } from "./utils/cn"

/* ========================================
   INNER COMPONENT — everything inside ThemeProvider
======================================== */

const BubbleChatContent = () => {
  const [open, setOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const [checkingEscalation, setCheckingEscalation] = useState(false)
  const messagesRef = useRef([])
  const openDraftAutoTriggered = useRef(false)

  const { position, dragging, isLeftSide, isTopSide, startDrag, wasDragged, repositionForWindow } = useBubbleDrag()
  const { messages, loading, isLoadingConversation, isResolvingConversation, sessionId, resolved, sendMessage, clearConversation, restoreConversation, resolveConversation, resolutionCheck, dismissResolution, addMessage, removeMessage } = useChatMessages()
  const { theme } = useTheme()

  useEffect(() => { if (!sessionId) return; setHistoryRefreshKey(p => p + 1) }, [sessionId])
  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { if (!open) return; repositionForWindow() }, [open, repositionForWindow])

  const closeModal = () => setActiveModal(null)

  const handlePointerDown = event => { if (open) return; startDrag(event) }
  const handlePointerUp = () => {
    if (wasDragged()) return
    if (!open) { repositionForWindow(); requestAnimationFrame(() => setOpen(true)); return }
    setOpen(false)
  }

  const handleLoadConversation = ({ sessionId }) => { restoreConversation({ sessionId }); repositionForWindow(); setOpen(true); setActiveModal(null) }
  const handleResolveConversation = async () => {
    try { if (!sessionId || !messages.length) return; await resolveConversation(); setHistoryRefreshKey(p => p + 1); setActiveModal(null) }
    catch (e) { console.error("RESOLVE_ERROR", e) }
  }
  const handleNewChat = () => { clearConversation(); repositionForWindow(); setOpen(true); setActiveModal(null) }
  const delay = ms => new Promise(r => setTimeout(r, ms))

  const handleSubmitTicket = async () => {
    try {
      if (!sessionId || checkingEscalation) return
      setCheckingEscalation(true)
      const response = await ticketService.getEscalationDraft(sessionId)
      if (response?.status === "needs_info" && response?.pushback_message) {
        const typing = addMessage("", "agent", true)
        await delay(1800)
        removeMessage(typing.id)
        addMessage(response.pushback_message, "agent")
        setActiveModal(null)
        return
      }
      if (response?.status === "success") { setActiveModal("ticket"); return }
    } catch (e) {
      console.error("SUBMIT_TICKET_ERROR", e)
      addMessage("Hindi ma-generate ang escalation draft sa ngayon. Paki-try ulit mamaya.", "agent")
      setActiveModal(null)
    } finally { setCheckingEscalation(false) }
  }

  useEffect(() => {
    if (resolutionCheck?.resolutionAction === "open_draft" && !openDraftAutoTriggered.current) {
      openDraftAutoTriggered.current = true
      handleSubmitTicket()
    }
    if (resolutionCheck?.resolutionAction !== "open_draft") openDraftAutoTriggered.current = false
  }, [resolutionCheck?.resolutionAction, handleSubmitTicket])

  const handleOpenModal = modalId => {
    if (modalId === "new-chat") { handleNewChat(); return }
    if (modalId === "ticket") { handleSubmitTicket(); return }
    setActiveModal(modalId)
  }

  const requesterId = useMemo(() => {
    try { return chatbotService.resolveRequesterId(chatbotService.getUserToken()) } catch { return null }
  }, [])

  const modals = {
    history: <ChatHistoryModal key={historyRefreshKey} refreshKey={historyRefreshKey} onClose={closeModal} onLoadConversation={handleLoadConversation} onClearConversation={clearConversation} />,
    ticket: <SubmitTicketModal onClose={closeModal} sessionId={sessionId} requesterId={requesterId} messages={messages} />,
    theme: <ThemeModal isOpen={true} onClose={closeModal} />,
    resolve: <ResolveConversationModal onClose={closeModal} onResolve={handleResolveConversation} />,
    about: <AboutHelpDeskModal onClose={closeModal} />,
  }

  return (
    <div className={cn("lemonsquare-chat-root", "pointer-events-none", "fixed bottom-0 left-0", "h-0 w-0", "z-[9999]")}>
      <AnimatePresence>
        {open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("pointer-events-none", "fixed inset-0", "bg-black/[0.02]", "backdrop-blur-[1px]")} />}
      </AnimatePresence>

      <div data-bubble-drag className={cn("pointer-events-auto", "fixed", "z-[9999]", !dragging && "transition-transform duration-300 ease-out")} style={{ left: 0, top: 0, willChange: "transform", touchAction: "none" }}>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.24 }}
              className={cn("absolute z-10", "overflow-hidden", "rounded-[28px] sm:rounded-[32px]", "backdrop-blur-2xl")}
              style={{ left: isLeftSide ? 0 : "auto", right: !isLeftSide ? 0 : "auto", top: isTopSide ? "calc(100% + 12px)" : "auto", bottom: !isTopSide ? "calc(100% + 12px)" : "auto", width: "min(96vw,390px)", height: "min(680px,calc(100dvh - 110px))", backgroundColor: theme.windowWrapperBg, border: `1px solid ${theme.windowBorder}`, boxShadow: `0 20px 80px ${theme.windowShadow}` }}>
              <ChatWindow messages={messages} loading={loading} isLoadingConversation={isLoadingConversation} isResolvingConversation={isResolvingConversation} resolved={resolved} resolutionCheck={resolutionCheck} onSendMessage={sendMessage} onResolveConversation={handleResolveConversation} onDismissResolution={dismissResolution} onClose={() => setOpen(false)} onOpenModal={handleOpenModal} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-20 h-16 w-16 select-none" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
          <ChatBubble isOpen={open} />
        </div>
      </div>

      {/* MODALS — now inside ThemeProvider tree, can use useTheme() */}
      {activeModal && (
        <div className="pointer-events-auto fixed inset-0 z-[10000]">
          {modals[activeModal]}
        </div>
      )}
    </div>
  )
}

/* ========================================
   EXPORT — ThemeProvider wraps EVERYTHING
======================================== */

const BubbleChat = () => (
  <ThemeProvider>
    <BubbleChatContent />
  </ThemeProvider>
)

export default BubbleChat