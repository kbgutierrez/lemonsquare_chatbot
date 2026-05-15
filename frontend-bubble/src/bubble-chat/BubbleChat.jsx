import {
  useEffect,
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

import {
  useBubbleDrag,
} from "./hooks/useBubbleDrag"

import {
  useChatMessages,
} from "./hooks/useChatMessages"

import {
  CHAT_CONFIG,
} from "./constants/chatConfig"

const BubbleChat = () => {

  const [open, setOpen] =
    useState(false)

  const [activeModal, setActiveModal] =
    useState(null)

  /* ========================================
     DRAG
  ======================================== */

  const {
    position,
    dragging,
    isLeftSide,
    isTopSide,
    startDrag,
    wasDragged,
    repositionForWindow,
  } = useBubbleDrag()

  /* ========================================
     CHAT
  ======================================== */

  const {
    messages,
    loading,
    sessionId,
    resolved,

    sendMessage,

    clearConversation,

    restoreConversation,

    resolveConversation,
  } = useChatMessages()

  /* ========================================
     SMART REPOSITION
  ======================================== */

  useEffect(() => {

    if (open) {

      repositionForWindow()
    }

  }, [
    open,
    repositionForWindow,
  ])

  /* ========================================
     CLOSE MODAL
  ======================================== */

  const closeModal =
    () => setActiveModal(null)

  /* ========================================
     CLICK / DRAG
  ======================================== */

  const handlePointerUp =
    () => {

      if (!wasDragged()) {

        setOpen(
          (prev) => !prev
        )
      }
    }

  /* ========================================
     RESTORE HISTORY CHAT
  ======================================== */

  const handleLoadConversation =
    ({
      sessionId,
    }) => {

      restoreConversation({
        sessionId,
      })

      setOpen(true)

      setActiveModal(null)

      console.log(
        "CONVERSATION_SELECTED",
        {
          sessionId,
        }
      )
    }

  /* ========================================
     RESOLVE CHAT
  ======================================== */

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

        setActiveModal(null)

        console.log(
          "CONVERSATION_RESOLVED",
          {
            sessionId,
          }
        )

      } catch (error) {

        console.error(
          "RESOLVE_ERROR",
          error
        )
      }
    }

  /* ========================================
     NEW CHAT
  ======================================== */

  const handleNewChat =
    () => {

      clearConversation()

      setOpen(true)

      setActiveModal(null)

      console.log(
        "NEW_CHAT_STARTED"
      )
    }

  /* ========================================
     MENU ACTIONS
  ======================================== */

  const handleOpenModal =
    (
      modalId
    ) => {

      if (
        modalId ===
        "new-chat"
      ) {

        handleNewChat()

        return
      }

      setActiveModal(
        modalId
      )
    }

  /* ========================================
     MODALS
  ======================================== */

  const modals = {
    history: (
      <ChatHistoryModal
        onClose={closeModal}
        onLoadConversation={
          handleLoadConversation
        }
      />
    ),

    ticket: (
      <SubmitTicketModal
        onClose={closeModal}
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
      className="
        lemonsquare-chat-root

        pointer-events-none

        fixed
        bottom-0
        left-0

        h-0
        w-0

        z-[9999]
      "
    >
      {/* BACKDROP */}
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
            transition={{
              duration: 0.25,
            }}
            className="
              pointer-events-none

              fixed
              inset-0

              bg-black/[0.02]

              backdrop-blur-[1px]
            "
          />
        )}
      </AnimatePresence>

      {/* FLOATING */}
      <motion.div
        className={`
          pointer-events-auto

          fixed

          will-change-transform

          ${
            dragging
              ? ""
              : `
                transition-[left,top]
                duration-300
                ease-out
              `
          }
        `}
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* WINDOW */}
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
                ease: "easeOut",
              }}
              className="
                absolute
                z-10

                overflow-hidden

                rounded-[28px]
                sm:rounded-[32px]

                border
                border-violet-200/70

                bg-white/95

                shadow-[0_20px_80px_rgba(139,92,246,0.22)]

                backdrop-blur-2xl
              "
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

                maxWidth:
                  "calc(100vw - 24px)",

                height:
                  "min(680px,calc(100dvh - 110px))",

                maxHeight:
                  "calc(100dvh - 110px)",
              }}
            >
              <ChatWindow
                messages={messages}
                loading={loading}
                resolved={resolved}
                onSendMessage={
                  sendMessage
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

        {/* BUBBLE */}
        <motion.div
          className="
            relative
            z-20

            h-16

            select-none
          "
          style={{
            width: open
              ? `${CHAT_CONFIG.BUBBLE_EXPANDED}px`
              : `${CHAT_CONFIG.BUBBLE_SIZE}px`,

            marginLeft:
              !isLeftSide &&
              open
                ? `-${
                    CHAT_CONFIG.BUBBLE_EXPANDED -
                    CHAT_CONFIG.BUBBLE_SIZE
                  }px`
                : 0,
          }}
          whileTap={{
            scale: 0.96,
          }}
          onPointerDown={
            open
              ? undefined
              : startDrag
          }
          onPointerUp={
            handlePointerUp
          }
        >
          <ChatBubble
            isOpen={open}
            expandDirection={
              isLeftSide
                ? "right"
                : "left"
            }
          />
        </motion.div>
      </motion.div>

      {/* MODALS */}
      <div
        className="
          pointer-events-auto

          relative
          z-[120]
        "
      >
        {modals[activeModal]}
      </div>
    </div>
  )
}

export default BubbleChat