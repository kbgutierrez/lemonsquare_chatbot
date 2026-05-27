import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import ModalShell from "../components/ModalShell.jsx"
import { useTheme } from "../context/ThemeContext.jsx"
import { cn } from "../utils/cn"

const ResolveConversationModal = ({ onClose, onResolve }) => {
  const { theme } = useTheme()
  const [resolving, setResolving] = useState(false)

  const handleResolve = async () => {
    if (resolving) return
    try { setResolving(true); await onResolve?.() } catch (e) { console.error("RESOLVE_MODAL_ERROR", e) } finally { setResolving(false) }
  }
  const handleClose = () => { if (resolving) return; onClose?.() }

  return (
    <ModalShell onClose={handleClose} title="Resolve Conversation" subtitle="Session Completion" size="sm" scrollable={false}
      icon={<CheckCircle2 className="h-5 w-5" style={{ color: theme.headerText }} />}>
      <div className="p-5 sm:p-6">
        <div className="rounded-2xl border p-4" style={{ backgroundColor: theme.agentBubbleBg, borderColor: theme.agentBubbleBorder }}>
          <p className="text-sm leading-relaxed" style={{ color: theme.agentText }}>
            Confirm that the current support session has been completed and safely resolve the conversation.
          </p>
          <span className="mt-3 block text-sm font-medium" style={{ color: theme.accent }}>
            The resolved conversation will automatically be learned by the AI and appear in the Admin panel.
          </span>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" disabled={resolving} onClick={handleClose}
            className={cn("rounded-2xl border px-4 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50")}
            style={{ borderColor: theme.inputBorder, backgroundColor: theme.windowWrapperBg, color: theme.agentText }}>
            Cancel
          </button>
          <button type="button" disabled={resolving} onClick={handleResolve}
            className={cn("flex items-center justify-center gap-2 rounded-2xl px-5 py-2 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70")}
            style={{ background: `linear-gradient(135deg, ${theme.headerGradientStart}, ${theme.headerGradientEnd})` }}>
            {resolving ? <><Loader2 className="h-4 w-4 animate-spin" /> Resolving...</> : <><CheckCircle2 className="h-4 w-4" /> Resolve</>}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

export default ResolveConversationModal