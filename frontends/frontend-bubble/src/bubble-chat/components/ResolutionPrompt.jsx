import React from "react"
import { Check, X, Send, Bot } from "lucide-react"
import { cn } from "../utils/cn"

const ResolutionPrompt = ({
  onResolve,
  onDismiss,
  onOpenTicket,
  showResolutionPrompt = false,
  allowTicketSubmission = false,
  resolutionMessage = null,
}) => {
  // If neither flag is true, don't render anything
  if (!showResolutionPrompt && !allowTicketSubmission) return null;

  const messageText =
    resolutionMessage ||
    (allowTicketSubmission
      ? "Gusto mo bang gawan na natin ng ticket 'to?"
      : "Nakatulong ba ito sa iyo?");

  return (
    <div className="group flex items-end gap-2 cursor-pointer animate-[fadeIn_.15s_ease-out] justify-start">
      {/* AI AVATAR - EXACT CLONE FROM ChatMessage.jsx */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-2 ring-emerald-50">
        <Bot className="h-3.5 w-3.5" />
      </div>

      {/* BUBBLE - EXACT CLONE FROM ChatMessage.jsx agent style */}
      <div className="max-w-[75%] rounded-xl px-3 py-2 backdrop-blur-md transition-all duration-150 border border-emerald-100/60 bg-white/85 text-slate-800 shadow-[0_3px_10px_rgba(16,185,129,0.06)]">
        
        {/* MESSAGE CONTENT - HARDCODED TAGLISH */}
        <p className="whitespace-pre-wrap break-words text-[12px] leading-snug">
          {messageText}
        </p>

        {/* BUTTONS AREA - INTERNAL SPACING ONLY FOR BUTTONS */}
        <div className="flex flex-wrap gap-2 mt-2.5">
          {/* TICKET FLOW */}
          {allowTicketSubmission && (
            <>
              <button
                onClick={onOpenTicket}
                className={cn(
                  "flex items-center gap-1.5",
                  "rounded-lg bg-violet-600 px-2.5 py-1.5",
                  "text-[11px] font-semibold text-white shadow-sm",
                  "transition-all hover:bg-violet-700 active:scale-95"
                )}
              >
                <Send className="h-3 w-3" />
                Submit Ticket
              </button>
              <button
                onClick={() => onDismiss()} 
                className={cn(
                  "flex items-center gap-1.5",
                  "rounded-lg bg-slate-50 px-2.5 py-1.5",
                  "text-[11px] font-semibold text-slate-700 border border-slate-200/50",
                  "transition-all hover:bg-slate-100 active:scale-95"
                )}
              >
                <X className="h-3 w-3" />
                No thanks
              </button>
            </>
          )}

          {/* RESOLVE FLOW */}
          {showResolutionPrompt && !allowTicketSubmission && (
            <>
              <button
                onClick={onResolve}
                className={cn(
                  "flex items-center gap-1.5",
                  "rounded-lg bg-emerald-50 px-2.5 py-1.5",
                  "text-[11px] font-semibold text-emerald-700 border border-emerald-200/50",
                  "transition-all hover:bg-emerald-100 active:scale-95"
                )}
              >
                <Check className="h-3 w-3" />
                Yes, resolved
              </button>
              <button
                onClick={() => onDismiss()} 
                className={cn(
                  "flex items-center gap-1.5",
                  "rounded-lg bg-slate-50 px-2.5 py-1.5",
                  "text-[11px] font-semibold text-slate-700 border border-slate-200/50",
                  "transition-all hover:bg-slate-100 active:scale-95"
                )}
              >
                <X className="h-3 w-3" />
                No
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResolutionPrompt
