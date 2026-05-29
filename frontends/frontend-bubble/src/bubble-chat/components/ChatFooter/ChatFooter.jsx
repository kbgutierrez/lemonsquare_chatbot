import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

import ChatFooterFAQ
  from "./ChatFooterFAQ.jsx"

import ChatFooterInput
  from "./ChatFooterInput.jsx"

import ChatFooterResolved
  from "./ChatFooterResolved.jsx"

const MAX_TEXTAREA_HEIGHT = 160

const ChatFooter = ({
  onSendMessage,

  loading = false,

  resolved = false,

  sessionTicketSubmitted = false,

  locked = false,
}) => {

  const [message, setMessage] =
    useState("")

  const [
    showQuestions,
    setShowQuestions,
  ] = useState(true)

  const textareaRef =
    useRef(null)

  const sendingRef =
    useRef(false)

  /* ========================================
     GLOBAL LOCK
  ======================================== */

  const isLocked =
    locked ||
    resolved ||
    sessionTicketSubmitted

  /* ========================================
     AUTO RESIZE
  ======================================== */

  useEffect(() => {

    const textarea =
      textareaRef.current

    if (!textarea) {
      return
    }

    textarea.style.height =
      "auto"

    textarea.style.height =
      `${Math.min(
        textarea.scrollHeight,
        MAX_TEXTAREA_HEIGHT
      )}px`

  }, [message])

  /* ========================================
     RESET ON LOCK
  ======================================== */

  useEffect(() => {

    if (isLocked) {
      setMessage("")
    }

  }, [isLocked])

  /* ========================================
     SEND
  ======================================== */

  const handleSend =
    useCallback(
      async (
        customMessage
      ) => {

        if (
          isLocked ||
          sendingRef.current
        ) {
          return
        }

        const finalMessage =
          (
            customMessage ??
            message
          )?.trim()

        if (!finalMessage) {
          return
        }

        try {

          sendingRef.current =
            true

          setMessage("")

          await onSendMessage?.(
            finalMessage
          )

        } catch (error) {

          console.error(
            "CHAT_SEND_ERROR",
            error
          )

          setMessage(
            finalMessage
          )

        } finally {

          sendingRef.current =
            false
        }
      },
      [
        isLocked,
        message,
        onSendMessage,
      ]
    )

  /* ========================================
     ENTER SEND
  ======================================== */

  const handleKeyDown =
    useCallback(
      event => {

        if (
          event.key !== "Enter" ||
          event.shiftKey
        ) {
          return
        }

        event.preventDefault()

        handleSend()

      },
      [handleSend]
    )

  /* ========================================
     QUICK QUESTION
  ======================================== */

  const handleQuickQuestion =
    useCallback(
      question =>
        !isLocked &&
        handleSend(question),

      [
        isLocked,
        handleSend,
      ]
    )

  return (
    <div
      className="
        relative

        border-t
        border-emerald-100/40

        bg-transparent

        px-3
        py-2

        sm:px-4
      "
    >

      <div className="relative z-10">

        {/* LOCKED */}
        {isLocked && (
          <ChatFooterResolved />
        )}

        {/* FAQ */}
        {!isLocked && (
          <ChatFooterFAQ
            loading={loading}

            showQuestions={
              showQuestions
            }

            setShowQuestions={
              setShowQuestions
            }

            onQuestionClick={
              handleQuickQuestion
            }
          />
        )}

        {/* INPUT */}
        <ChatFooterInput
          textareaRef={textareaRef}

          message={message}

          setMessage={setMessage}

          loading={loading}

          resolved={isLocked}

          sessionTicketSubmitted={
            isLocked
          }

          onKeyDown={
            handleKeyDown
          }

          onSend={
            handleSend
          }
        />

      </div>

    </div>
  )
}

export default ChatFooter