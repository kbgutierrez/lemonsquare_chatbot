import React from "react"
import { Check, X, Send, Bot } from "lucide-react"
import { cn } from "../utils/cn"

const ResolutionPrompt = ({
  onResolve,
  onOpenTicket,
  allowTicketSubmission = true,
}) => {
  return (
    <div className="flex items-end gap-2 animate-[fadeIn_.15s_ease-out] justify-start">
      {/* AI AVATAR */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-2 ring-emerald-50">
        <Bot className="h-3.5 w-3.5" />
      </div>

      {/* BUBBLE */}
      <div className="max-w-[85%] rounded-xl px-3 py-2.5 backdrop-blur-md border border-emerald-100/60 bg-white/85 text-slate-800 shadow-[0_3px_10px_rgba(16,185,129,0.06)]">
        <p className="text-[12px] leading-snug mb-2.5 font-medium text-slate-600">
          Was this helpful?
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onResolve}
            className={cn(
              "flex items-center gap-1.5",
              "rounded-lg bg-emerald-50 px-2.5 py-1.5",
              "text-[11px] font-semibold text-emerald-700",
              "transition-all hover:bg-emerald-100 active:scale-95"
            )}
          >
            <Check className="h-3.5 w-3.5" />
            Yes, resolved
          </button>

          {allowTicketSubmission && (
            <button
              onClick={onOpenTicket}
              className={cn(
                "flex items-center gap-1.5",
                "rounded-lg bg-violet-50 px-2.5 py-1.5",
                "text-[11px] font-semibold text-violet-700",
                "transition-all hover:bg-violet-100 active:scale-95"
              )}
            >
              <Send className="h-3.5 w-3.5" />
              Escalate
            </button>
          )}

          <button
            onClick={() => onResolve()} 
            className={cn(
              "flex items-center gap-1.5",
              "rounded-lg bg-slate-50 px-2.5 py-1.5",
              "text-[11px] font-semibold text-slate-700",
              "transition-all hover:bg-slate-100 active:scale-95"
            )}
          >
            <X className="h-3.5 w-3.5" />
            No
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResolutionPrompt
