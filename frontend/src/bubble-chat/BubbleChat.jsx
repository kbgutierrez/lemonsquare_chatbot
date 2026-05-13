import {
  useEffect,
  useState,
} from "react"

import ChatBubble from "./components/ChatBubble.jsx"
import ChatWindow from "./components/ChatWindow.jsx"

import ChatHistoryModal from "./modals/ChatHistoryModal.jsx"
import ClearConversationModal from "./modals/ClearConversationModal.jsx"
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
    sendMessage,
    clearConversation,
    restoreConversation,
  } = useChatMessages()

  /* ========================================
     SMART REPOSITION
  ======================================== */

  useEffect(() => {

    if (open) {
      repositionForWindow()
    }

  }, [open])

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
      messages,
    }) => {

      restoreConversation({
        sessionId,
        messages,
      })

      /*
        Automatically open chat window
        after restoring conversation.
      */
      setOpen(true)

      /*
        Close modal
      */
      setActiveModal(null)
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

    clear: (
      <ClearConversationModal
        onClose={closeModal}

        onClearConversation={
          clearConversation
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
        pointer-events-none
        fixed
        inset-0
        z-50
      "
    >
      {/* FLOATING */}
      <div
        className={`
          pointer-events-auto
          absolute
          will-change-transform
          touch-none

          ${
            dragging
              ? "transition-none"
              : `
                transition-transform
                duration-300
                ease-out
              `
          }
        `}
        style={{
          transform: `
            translate3d(
              ${position.x}px,
              ${position.y}px,
              0
            )
          `,
        }}
      >
        {/* CHAT WINDOW */}
        <div
          className="
            absolute
            z-10
            overflow-hidden
            rounded-[30px]

            border
            border-violet-200/70

            bg-white/95
            backdrop-blur-xl

            shadow-[0_20px_60px_rgba(139,92,246,0.25)]

            transition-all
            duration-300
            ease-out
          "
          style={{
            left:
              isLeftSide
                ? "18px"
                : "auto",

            right:
              !isLeftSide
                ? "18px"
                : "auto",

            top:
              isTopSide
                ? "72px"
                : "auto",

            bottom:
              !isTopSide
                ? "72px"
                : "auto",

            width:
              "min(94vw,380px)",

            maxWidth:
              "calc(100vw - 40px)",

            height:
              "min(520px,calc(100vh - 120px))",

            maxHeight:
              "calc(100vh - 120px)",

            opacity:
              open ? 1 : 0,

            transform:
              open
                ? `
                  translateY(0)
                  scale(1)
                `
                : `
                  translateY(12px)
                  scale(0.96)
                `,

            pointerEvents:
              open
                ? "auto"
                : "none",
          }}
        >
          <ChatWindow
            messages={messages}

            loading={loading}

            onSendMessage={
              sendMessage
            }

            onClose={() =>
              setOpen(false)
            }

            onOpenModal={
              setActiveModal
            }
          />
        </div>

        {/* BUBBLE */}
        <div
          className="
            relative
            z-20
            h-16
            touch-none
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
          onMouseDown={
            startDrag
          }
          onMouseUp={
            handlePointerUp
          }
          onTouchStart={
            startDrag
          }
          onTouchEnd={
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
        </div>
      </div>

      {/* MODALS */}
      <div
        className="
          pointer-events-auto
        "
      >
        {modals[activeModal]}
      </div>
    </div>
  )
}

export default BubbleChat