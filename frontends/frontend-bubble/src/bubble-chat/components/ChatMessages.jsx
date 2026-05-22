import {
  useEffect,
  useMemo,
  useRef,
} from "react"

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

const NeedTicketPrompt = ({ onOpenTicket }) => (
  <div className="flex items-end gap-2 animate-[fadeIn_.15s_ease-out] justify-start">
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 ring-2 ring-violet-50">
      <span className="text-[11px] font-semibold">!</span>
    </div>

    <div className="max-w-[85%] rounded-xl px-3 py-2.5 backdrop-blur-md border border-violet-100/60 bg-white/85 text-slate-800 shadow-[0_3px_10px_rgba(139,92,246,0.06)]">
      <p className="text-[12px] leading-snug mb-2.5 font-medium text-slate-600">
        This conversation should be escalated to a ticket.
      </p>

      <button
        onClick={onOpenTicket}
        className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700 transition-all hover:bg-violet-100 active:scale-95"
      >
        Submit Ticket
      </button>
    </div>
  </div>
)

const ChatMessages = ({
  messages = [],
  loading = false,
  resolved = false,
  resolutionCheck = {
    showResolutionPrompt: false,
    allowTicketSubmission: true,
  },
  onResolve,
  onOpenTicket,
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

        {/* RESOLUTION PROMPT AS A MESSAGE */}
        {(!resolved && resolutionCheck.resolutionAction === "need_ticket" && !loading) && (
          <NeedTicketPrompt onOpenTicket={onOpenTicket} />
        )}

        {!resolved && resolutionCheck.showResolutionPrompt && !loading && (
          <ResolutionPrompt
            onResolve={onResolve}
            onOpenTicket={onOpenTicket}
            allowTicketSubmission={resolutionCheck.allowTicketSubmission}
          />
        )}

      </div>

      {/* SCROLL TARGET */}
      <div
        ref={messagesEndRef}
      />

    </div>
  )
}

export default ChatMessages