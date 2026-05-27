import { useState } from "react"
import { Check, X, Send, Bot } from "lucide-react"
import { useTheme } from "../context/ThemeContext.jsx"
import { cn } from "../utils/cn"

const ResolutionPrompt = ({
  onResolve,
  onDismiss,
  onOpenTicket,
  onConsume,
  showResolutionPrompt = false,
  allowTicketSubmission = false,
  resolutionMessage = null,
}) => {
  const { theme } = useTheme()
  const [hasActed, setHasActed] = useState(false)

  if (!showResolutionPrompt && !allowTicketSubmission) return null

  const messageText =
    resolutionMessage ||
    (allowTicketSubmission
      ? "Gusto mo bang gawan na natin ng ticket 'to?"
      : "Nakatulong ba ito sa iyo?")

  const handleAction = (callback) => {
    if (hasActed) return
    setHasActed(true)
    onConsume?.()
    requestAnimationFrame(() => {
      callback?.()
    })
  }

  const bubbleStyle = {
    backgroundColor: theme.agentBubbleBg,
    borderColor: theme.agentBubbleBorder,
    color: theme.agentText,
    boxShadow: `0 3px 10px ${theme.agentBubbleShadow}`,
  }

  const avatarStyle = {
    backgroundColor: theme.agentAvatarBg,
    color: theme.agentAvatarText,
    boxShadow: `0 0 0 2px ${theme.agentAvatarRing}`,
  }

  return (
    <div className="group flex items-end gap-2 cursor-pointer animate-[fadeIn_.15s_ease-out] justify-start">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={avatarStyle}
      >
        <Bot className="h-3.5 w-3.5" />
      </div>

      <div
        className="max-w-[75%] rounded-xl px-3 py-2 backdrop-blur-md transition-all duration-150 border"
        style={bubbleStyle}
      >
        <p className="whitespace-pre-wrap break-words text-[12px] leading-snug">
          {messageText}
        </p>

        <div className="flex flex-wrap gap-2 mt-2.5">
          {allowTicketSubmission && (
            <>
              <button
                onClick={() => handleAction(onOpenTicket)}
                disabled={hasActed}
                className={cn(
                  "flex items-center gap-1.5",
                  "rounded-lg px-2.5 py-1.5",
                  "text-[11px] font-semibold text-white shadow-sm",
                  "transition-all hover:scale-[1.02] active:scale-95",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                )}
                style={{
                  background: `linear-gradient(135deg, ${theme.headerGradientStart}, ${theme.headerGradientEnd})`,
                }}
              >
                <Send className="h-3 w-3" />
                Submit Ticket
              </button>
              <button
                onClick={() => handleAction(onDismiss)}
                disabled={hasActed}
                className={cn(
                  "flex items-center gap-1.5",
                  "rounded-lg px-2.5 py-1.5",
                  "text-[11px] font-semibold border shadow-sm",
                  "transition-all hover:opacity-80 active:scale-95",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-100"
                )}
                style={{
                  backgroundColor: theme.windowWrapperBg,
                  borderColor: theme.inputBorder,
                  color: theme.agentText,
                }}
              >
                <X className="h-3 w-3" />
                No thanks
              </button>
            </>
          )}

          {showResolutionPrompt && !allowTicketSubmission && (
            <>
              <button
                onClick={() => handleAction(onResolve)}
                disabled={hasActed}
                className={cn(
                  "flex items-center gap-1.5",
                  "rounded-lg px-2.5 py-1.5",
                  "text-[11px] font-semibold border shadow-sm",
                  "transition-all hover:opacity-80 active:scale-95",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-100"
                )}
                style={{
                  backgroundColor: theme.resolvedBannerBg,
                  borderColor: theme.resolvedBannerBorder,
                  color: theme.resolvedBannerText,
                }}
              >
                <Check className="h-3 w-3" />
                Yes, resolved
              </button>
              <button
                onClick={() => handleAction(onDismiss)}
                disabled={hasActed}
                className={cn(
                  "flex items-center gap-1.5",
                  "rounded-lg px-2.5 py-1.5",
                  "text-[11px] font-semibold border shadow-sm",
                  "transition-all hover:opacity-80 active:scale-95",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-100"
                )}
                style={{
                  backgroundColor: theme.windowWrapperBg,
                  borderColor: theme.inputBorder,
                  color: theme.agentText,
                }}
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