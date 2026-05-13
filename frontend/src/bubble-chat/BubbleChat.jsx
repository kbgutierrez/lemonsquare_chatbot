import {
  useEffect,
  useState,
} from "react"

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

        /*
          Proper backend resolve.
        */
        await resolveConversation()

        /*
          Close modal.
        */
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

      /*
        Backend history is preserved.

        This only resets the current
        frontend session state.
      */
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

      /*
        NEW CHAT
        No modal needed.
      */
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