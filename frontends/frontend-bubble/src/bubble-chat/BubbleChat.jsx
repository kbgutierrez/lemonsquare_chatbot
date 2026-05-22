import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import ChatBubble from "./components/ChatBubble.jsx"
import ChatWindow from "./components/ChatWindow.jsx"

import ChatHistoryModal from "./modals/ChatHistoryModal.jsx"
import SubmitTicketModal from "./modals/SubmitTicketModal.jsx"
import CallAgentModal from "./modals/CallAgentModal.jsx"
import ResolveConversationModal from "./modals/ResolveConversationModal.jsx"
import AboutHelpDeskModal from "./modals/AboutHelpDeskModal.jsx"

import chatbotService from "./services/chatbotService"

import {
  useBubbleDrag,
} from "./hooks/useBubbleDrag"

import {
  useChatMessages,
} from "./hooks/useChatMessages"

import { cn } from "./utils/cn"

const BubbleChat = () => {

  const [open, setOpen] =
    useState(false)

  const [
    activeModal,
    setActiveModal,
  ] = useState(null)

  const [
    historyRefreshKey,
    setHistoryRefreshKey,
  ] = useState(0)

  const {
    position,
    dragging,
    isLeftSide,
    isTopSide,
    startDrag,
    wasDragged,
    repositionForWindow,
  } = useBubbleDrag()

  const {
    messages,
    loading,
    isLoadingConversation,
    isResolvingConversation,
    sessionId,
    resolved,
    sendMessage,
    clearConversation,
    restoreConversation,
    resolveConversation,
    resolutionCheck,
  } = useChatMessages()

  useEffect(() => {

    if (!sessionId) {
      return
    }

    setHistoryRefreshKey(
      prev => prev + 1
    )

  }, [sessionId])

  useEffect(() => {

    if (!open) {
      return
    }

    repositionForWindow()

  }, [
    open,
    repositionForWindow,
  ])

  /* ========================================
     ACTIONS
  ======================================== */

  const closeModal =
    () =>
      setActiveModal(null)

  const handlePointerDown =
    event => {
      startDrag(event)
    }

  const handlePointerUp =
    () => {

      if (wasDragged()) {
        return
      }

      if (!open) {

        repositionForWindow()

        requestAnimationFrame(
          () => setOpen(true)
        )

        return
      }

      setOpen(false)
    }

  const handleLoadConversation =
    ({ sessionId }) => {

      restoreConversation({
        sessionId,
      })

      repositionForWindow()

      setOpen(true)

      setActiveModal(null)
    }

  const handleResolveConversation =
    async () => {

      try {

        if (
          !sessionId ||
          !messages.length
        ) {
          return
        }

        await resolveConversation()

        setHistoryRefreshKey(
          prev => prev + 1
        )

        setActiveModal(null)

      } catch (error) {

        console.error(
          "RESOLVE_ERROR",
          error
        )
      }
    }

  const handleNewChat =
    () => {

      clearConversation()

      repositionForWindow()

      setOpen(true)

      setActiveModal(null)
    }

  const handleOpenModal =
    modalId => {

      if (
        modalId ===
        "new-chat"
      ) {

        handleNewChat()

        return
      }

      setActiveModal(modalId)
    }

  /* ========================================
     MEMO
  ======================================== */

  const requesterId =
    useMemo(() => {

      try {

        return chatbotService.resolveRequesterId(
          chatbotService.getUserToken()
        )

      } catch {
        return null
      }

    }, [])

  const modals = {
    history: (
      <ChatHistoryModal
        key={historyRefreshKey}
        refreshKey={
          historyRefreshKey
        }
        onClose={closeModal}
        onLoadConversation={
          handleLoadConversation
        }
        onClearConversation={
          clearConversation
        }
      />
    ),

    ticket: (
      <SubmitTicketModal
        onClose={closeModal}
        sessionId={sessionId}
        requesterId={
          requesterId
        }
        messages={messages}
      />
    ),

    call: (
      <CallAgentModal
        onClose={closeModal}
      />
    ),

    resolve: (
      <ResolveConversationModal
        onClose={closeModal}
        onResolve={
          handleResolveConversation
        }
      />
    ),

    about: (
      <AboutHelpDeskModal
        onClose={closeModal}
      />
    ),
  }

  return (
    <div
      className={cn(
        "lemonsquare-chat-root",
        "pointer-events-none",
        "fixed bottom-0 left-0",
        "h-0 w-0",
        "z-[9999]"
      )}
    >

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className={cn(
              "pointer-events-none",
              "fixed inset-0",
              "bg-black/[0.02]",
              "backdrop-blur-[1px]"
            )}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={cn(
          "pointer-events-auto",
          "fixed",
          "will-change-transform",

          !dragging &&
            "transition-[left,top] duration-300 ease-out"
        )}
        style={{
          left: position.x,
          top: position.y,
        }}
      >

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 14,
              }}

              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}

              exit={{
                opacity: 0,
                scale: 0.96,
                y: 10,
              }}

              transition={{
                duration: 0.24,
              }}

              className={cn(
                "absolute z-10",
                "overflow-hidden",
                "rounded-[28px] sm:rounded-[32px]",
                "border border-violet-200/70",
                "bg-white/95",
                "shadow-[0_20px_80px_rgba(139,92,246,0.22)]",
                "backdrop-blur-2xl"
              )}

              style={{
                left:
                  isLeftSide
                    ? 0
                    : "auto",

                right:
                  !isLeftSide
                    ? 0
                    : "auto",

                top:
                  isTopSide
                    ? "calc(100% + 12px)"
                    : "auto",

                bottom:
                  !isTopSide
                    ? "calc(100% + 12px)"
                    : "auto",

                width:
                  "min(96vw,390px)",

                height:
                  "min(680px,calc(100dvh - 110px))",
              }}
            >
              <ChatWindow
                messages={messages}
                loading={loading}
                isLoadingConversation={
                  isLoadingConversation
                }
                isResolvingConversation={
                  isResolvingConversation
                }
                resolved={resolved}
                resolutionCheck={resolutionCheck}
                onSendMessage={
                  sendMessage
                }
                onResolveConversation={
                  handleResolveConversation
                }
                onClose={() =>
                  setOpen(false)
                }
                onOpenModal={
                  handleOpenModal
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="
            relative z-20
            h-16 w-16
            select-none
          "
          onPointerDown={
            handlePointerDown
          }
          onPointerUp={
            handlePointerUp
          }
        >
          <ChatBubble
            isOpen={open}
          />
        </div>

      </motion.div>

      {activeModal && (
        <div
          className="
            pointer-events-auto
            fixed inset-0
            z-[10000]
          "
        >
          {modals[activeModal]}
        </div>
      )}

    </div>
  )
}

export default BubbleChat