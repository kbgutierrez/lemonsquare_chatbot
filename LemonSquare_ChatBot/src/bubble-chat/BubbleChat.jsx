import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import ChatBubble from './components/ChatBubble.jsx'
import ChatWindow from './components/ChatWindow.jsx'

import ChatHistoryModal from './modals/ChatHistoryModal.jsx'
import ClearConversationModal from './modals/ClearConversationModal.jsx'
import SubmitTicketModal from './modals/SubmitTicketModal.jsx'
import CallAgentModal from './modals/CallAgentModal.jsx'
import ResolveConversationModal from './modals/ResolveConversationModal.jsx'
import AboutHelpDeskModal from './modals/AboutHelpDeskModal.jsx'

import {
  mockMessages
} from './data/mockMessages.js'

const SIZE = 64
const PADDING = 20
const CHAT_WIDTH = 380
const EXPANDED = 224

const BubbleChat = () => {

  const [open, setOpen] =
    useState(false)

  const [activeModal, setActiveModal] =
    useState(null)

  const [dragging, setDragging] =
    useState(false)

  const [messages, setMessages] =
    useState(mockMessages)

  const [position, setPosition] =
    useState({
      x:
        window.innerWidth - 100,

      y:
        window.innerHeight - 100
    })

  const dragOffset =
    useRef({
      x: 0,
      y: 0
    })

  const dragTimer =
    useRef(null)

  /* SIDE */
  const isLeftSide =
    useMemo(
      () =>
        position.x <
        window.innerWidth / 2,

      [position.x]
    )

  const isTopSide =
    useMemo(
      () =>
        position.y <
        window.innerHeight / 2,

      [position.y]
    )

  /* SNAP */
  const getSnapPosition =
    (x, y) => {

      const left =
        x <
        window.innerWidth / 2

      const top =
        y <
        window.innerHeight / 2

      return {
        x:
          left
            ? PADDING
            : window.innerWidth -
              SIZE -
              PADDING,

        y:
          top
            ? PADDING
            : window.innerHeight -
              SIZE -
              PADDING
      }
    }

  /* DRAG */
  useEffect(() => {

    const move =
      (event) => {

        if (!dragging) return

        setPosition({
          x: Math.min(
            Math.max(
              0,
              event.clientX -
              dragOffset.current.x
            ),
            window.innerWidth -
            SIZE
          ),

          y: Math.min(
            Math.max(
              0,
              event.clientY -
              dragOffset.current.y
            ),
            window.innerHeight -
            SIZE
          )
        })
      }

    const up = () => {

      if (!dragging) return

      setPosition(
        getSnapPosition(
          position.x,
          position.y
        )
      )

      setDragging(false)
    }

    const resize = () => {
      setPosition(
        getSnapPosition(
          position.x,
          position.y
        )
      )
    }

    window.addEventListener(
      'mousemove',
      move
    )

    window.addEventListener(
      'mouseup',
      up
    )

    window.addEventListener(
      'resize',
      resize
    )

    return () => {

      window.removeEventListener(
        'mousemove',
        move
      )

      window.removeEventListener(
        'mouseup',
        up
      )

      window.removeEventListener(
        'resize',
        resize
      )
    }

  }, [dragging, position])

  /* START DRAG */
  const startDrag =
    (event) => {

      dragOffset.current = {
        x:
          event.clientX -
          position.x,

        y:
          event.clientY -
          position.y
      }

      dragTimer.current =
        setTimeout(() => {
          setDragging(true)
        }, 150)
    }

  const stopDrag = () => {
    clearTimeout(
      dragTimer.current
    )
  }

  /* TOGGLE */
  const handleToggle =
    () => {

      if (!dragging) {
        setOpen(
          (prev) => !prev
        )
      }
    }

  /* LOAD CHAT */
  const handleLoadConversation =
    (
      conversationMessages
    ) => {

      const loaded =
        conversationMessages.map(
          (
            message,
            index
          ) => ({
            id:
              `loaded-${index}`,

            sender:
              message.sender,

            text:
              message.text,

            time:
              new Date()
                .toLocaleTimeString(
                  [],
                  {
                    hour: '2-digit',
                    minute: '2-digit'
                  }
                )
          })
        )

      setMessages(loaded)

      setOpen(true)

      setActiveModal(null)
    }

  /* SEND */
  const handleSendMessage =
    (
      text,
      isAgent = false
    ) => {

      const message = {
        id:
          Date.now().toString(),

        sender:
          isAgent
            ? 'agent'
            : 'user',

        text,

        time:
          new Date()
            .toLocaleTimeString(
              [],
              {
                hour: '2-digit',
                minute: '2-digit'
              }
            )
      }

      setMessages(
        (prev) => [
          ...prev,
          message
        ]
      )
    }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        overflow-hidden
      "
    >

      {/* CHAT */}
      <div
        className="
          absolute
          pointer-events-auto
        "

        style={{
          left:
            `${position.x}px`,

          top:
            `${position.y}px`
        }}
      >

        {/* WINDOW */}
        <div
          className="
            absolute

            overflow-hidden

            rounded-[30px]

            border
            border-violet-200/70

            bg-white/90
            backdrop-blur-xl

            shadow-[0_20px_60px_rgba(139,92,246,0.25)]

            transition-all
            duration-300
            ease-out

            w-[min(92vw,380px)]
            h-[min(72vh,520px)]

            sm:w-[380px]
            sm:h-[520px]
          "

          style={{
            left:
              isLeftSide
                ? '18px'
                : `-${CHAT_WIDTH - 40}px`,

            top:
              isTopSide
                ? 'clamp(12px, 5vh, 80px)'
                : 'auto',

            bottom:
              !isTopSide
                ? 'clamp(12px, 5vh, 80px)'
                : 'auto',

            opacity:
              open ? 1 : 0,

            transform:
              open
                ? `
                  translateY(0)
                  scale(1)
                `
                : `
                  translateY(18px)
                  scale(0.92)
                `,

            pointerEvents:
              open
                ? 'auto'
                : 'none'
          }}
        >
          <ChatWindow
            messages={messages}

            onSendMessage={
              handleSendMessage
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
            h-16
          "

          style={{
            width:
              open
                ? `${EXPANDED}px`
                : `${SIZE}px`,

            marginLeft:
              !isLeftSide &&
              open
                ? `-${EXPANDED - SIZE}px`
                : 0
          }}

          onMouseDown={
            startDrag
          }

          onMouseUp={
            stopDrag
          }

          onMouseLeave={
            stopDrag
          }

          onClick={
            handleToggle
          }
        >
          <ChatBubble
            isOpen={open}

            expandDirection={
              isLeftSide
                ? 'right'
                : 'left'
            }
          />
        </div>
      </div>

      {/* MODALS */}
      {activeModal ===
        'history' && (
        <ChatHistoryModal
          onClose={() =>
            setActiveModal(null)
          }

          onLoadConversation={
            handleLoadConversation
          }
        />
      )}

      {activeModal ===
        'clear' && (
        <ClearConversationModal
          onClose={() =>
            setActiveModal(null)
          }
        />
      )}

      {activeModal ===
        'ticket' && (
        <SubmitTicketModal
          onClose={() =>
            setActiveModal(null)
          }
        />
      )}

      {activeModal ===
        'call' && (
        <CallAgentModal
          onClose={() =>
            setActiveModal(null)
          }
        />
      )}

      {activeModal ===
        'resolve' && (
        <ResolveConversationModal
          onClose={() =>
            setActiveModal(null)
          }
        />
      )}

      {activeModal ===
        'about' && (
        <AboutHelpDeskModal
          onClose={() =>
            setActiveModal(null)
          }
        />
      )}
    </div>
  )
}

export default BubbleChat