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

const ChatFooter = ({
  onSendMessage,

  /*
    ONLY AI reply state.
  */
  loading = false,

  resolved = false,
}) => {

  const [message, setMessage] =
    useState("")

  const [
    showQuestions,
    setShowQuestions,
  ] = useState(true)

  const textareaRef =
    useRef(null)

  /*
    Prevent duplicate
    manual sends.
  */

  const sendingRef =
    useRef(false)

  /* ========================================
     AUTO RESIZE TEXTAREA
  ======================================== */

  useEffect(() => {

    const textarea =
      textareaRef.current

    if (!textarea)
      return

    textarea.style.height =
      "auto"

    textarea.style.height =
      `${Math.min(
        textarea.scrollHeight,
        160
      )}px`

  }, [message])

  /* ========================================
     RESET DRAFT ON RESOLVE
  ======================================== */

  useEffect(() => {

    if (
      resolved
    ) {

      setMessage("")
    }

  }, [resolved])

  /* ========================================
     SEND
  ======================================== */

  const handleSend =
    useCallback(
      async (
        customMessage
      ) => {

        /*
          Hard block:
          resolved chat
        */

        if (
          resolved
        ) {
          return
        }

        /*
          Prevent spam double click
          while request in-flight.
        */

        if (
          sendingRef.current
        ) {
          return
        }

        const finalMessage =
          (
            customMessage ??
            message
          )
            ?.trim?.()

        if (
          !finalMessage
        ) {
          return
        }

        try {

          sendingRef.current =
            true

          /*
            Clear immediately
            for smoother UX.
          */

          setMessage("")

          await onSendMessage(
            finalMessage
          )

        } catch (error) {

          console.error(
            "CHAT_SEND_ERROR",
            error
          )

          /*
            Restore message
            if failed.
          */

          setMessage(
            finalMessage
          )

        } finally {

          sendingRef.current =
            false
        }
      },
      [
        message,
        resolved,
        onSendMessage,
      ]
    )

  /* ========================================
     ENTER
  ======================================== */

  const handleKeyDown =
    useCallback(
      (
        event
      ) => {

        if (
          event.key ===
            "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault()

          handleSend()
        }
      },
      [handleSend]
    )

  /* ========================================
     QUICK QUESTION
  ======================================== */

  const handleQuickQuestion =
    useCallback(
      async (
        question
      ) => {

        if (
          resolved
        ) {
          return
        }

        await handleSend(
          question
        )
      },
      [
        resolved,
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

        {/* ====================================
            RESOLVED
        ==================================== */}

        {resolved && (
          <ChatFooterResolved />
        )}

        {/* ====================================
            FAQ
        ==================================== */}

        {!resolved && (
          <ChatFooterFAQ
            loading={
              loading
            }
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

        {/* ====================================
            INPUT
        ==================================== */}

        <ChatFooterInput
          textareaRef={
            textareaRef
          }
          message={
            message
          }
          setMessage={
            setMessage
          }
          loading={
            loading
          }
          resolved={
            resolved
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