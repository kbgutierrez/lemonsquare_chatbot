import {
  useEffect,
  useMemo,
  useRef,
} from "react"

import { AnimatePresence, motion } from "framer-motion"

import ChatMessage from "./ChatMessage.jsx"
import ResolutionPrompt from "./ResolutionPrompt.jsx"

const getMessageKey = (
  message,
  index
) =>
  message?.id ||
  `${message?.sender}-${index}-${message?.text}`

const createWelcomeMessage =
  () => {

    const now =
      new Date()

    return {
      id:
        "default-welcome-message",

      sender:
        "agent",

      text:
        "What can I help you with today?",

      time:
        now.toLocaleTimeString(
          [],
          {
            hour:
              "2-digit",

            minute:
              "2-digit",
          }
        ),

      createdAt:
        now.toISOString(),
    }
  }

const ChatMessages = ({
  messages = [],
  loading = false,
  resolved = false,
  resolutionCheck = {
    showResolutionPrompt: false,
    allowTicketSubmission: false,
    resolutionMessage: null,
    escalationId: null,
  },
  onResolve,
  onDismiss,
  onOpenTicket,
  onMakeEscalationDecision,
  escalationDecision,
  consumedEscalationIds = new Set(),
  onConsumeEscalation,
  sessionTicketSubmitted = false,
}) => {

  const messagesEndRef =
    useRef(null)

  const previousLengthRef =
    useRef(0)

  const initialLoadRef =
    useRef(true)

  /* ========================================
     DEDUPE + NORMALIZE
  ======================================== */

  const normalizedMessages =
    useMemo(
      () => {

        const seen =
          new Set()

        const deduped =
          messages.filter(
            (
              message,
              index
            ) => {

              const key =
                getMessageKey(
                  message,
                  index
                )

              if (
                seen.has(key)
              ) {

                return false
              }

              seen.add(key)

              return true
            }
          )

        return deduped.length
          ? deduped
          : [
              createWelcomeMessage(),
            ]

      },
      [messages]
    )

  /* ========================================
     AUTO SCROLL
  ======================================== */

  useEffect(() => {

    const scrollBehavior =
      initialLoadRef.current
        ? "auto"
        : "smooth"

    if (
      initialLoadRef.current
    ) {

      initialLoadRef.current =
        false
    }

    const hasNewMessage =
      normalizedMessages.length >
      previousLengthRef.current

    if (
      hasNewMessage
    ) {

      requestAnimationFrame(
        () => {

          messagesEndRef.current
            ?.scrollIntoView({
              behavior:
                scrollBehavior,

              block:
                "end",
            })
        }
      )
    }

    previousLengthRef.current =
      normalizedMessages.length

  }, [normalizedMessages])

  /* ========================================
     ESCALATION PROMPT VISIBILITY
     
     Four gates must ALL be open:
     1. Conversation is active (not resolved)
     2. Not currently loading a message
     3. No pending escalation decision
     4. Session has not yet submitted a ticket
     5. resolutionCheck has a valid escalationId
     6. That escalationId has NOT been consumed
     7. Backend signals escalation is appropriate
  ======================================== */

  const shouldShowEscalationPrompt =
    !resolved &&
    !loading &&
    !escalationDecision &&
    !sessionTicketSubmitted &&
    Boolean(resolutionCheck.escalationId) &&
    !consumedEscalationIds.has(resolutionCheck.escalationId) &&
    (
      resolutionCheck.showResolutionPrompt ||
      resolutionCheck.allowTicketSubmission
    )

  return (
    <div
      className="
        flex
        h-full
        flex-col

        overflow-y-auto

        px-3
        py-3

        sm:px-4
        sm:py-5

        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >

      {/* MESSAGES */}
      <div
        className="
          flex
          flex-col
          gap-4
        "
      >

        {normalizedMessages.map(
          (
            message,
            index
          ) => (
            <ChatMessage
              key={
                getMessageKey(
                  message,
                  index
                )
              }
              message={
                message
              }
            />
          )
        )}

        {/* ESCALATION PROMPT — entire block animates out and is removed from DOM after action */}
        <AnimatePresence>
          {shouldShowEscalationPrompt && (
            <motion.div
              key={`resolution-prompt-${resolutionCheck.escalationId}`}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95, height: 0, marginTop: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <ResolutionPrompt
                escalationId={resolutionCheck.escalationId}
                onConsumeEscalation={onConsumeEscalation}
                onResolve={onResolve}
                onDismiss={onDismiss}
                onOpenTicket={onOpenTicket}
                onMakeDecision={onMakeEscalationDecision}
                showResolutionPrompt={resolutionCheck.showResolutionPrompt}
                allowTicketSubmission={resolutionCheck.allowTicketSubmission}
                resolutionMessage={resolutionCheck.resolutionMessage}
                escalationDecision={escalationDecision}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* SCROLL TARGET */}
      <div
        ref={messagesEndRef}
      />

    </div>
  )
}

export default ChatMessages