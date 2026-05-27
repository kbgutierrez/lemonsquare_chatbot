import { Sparkles, SendHorizonal, BrainCircuit, MessageSquareWarning, CheckCircle2, ShieldAlert, LoaderCircle, AlertCircle } from "lucide-react"
import ModalShell from "../components/ModalShell.jsx"
import { useTicketForm } from "../hooks/useTicketForm"
import { useTheme } from "../context/ThemeContext.jsx"
import { cn } from "../utils/cn"

const LoadingLines = ({ theme }) => (
  <div className="mt-4 space-y-3">
    {["w-full", "w-11/12", "w-4/5"].map(w => (
      <div key={w} className={cn("h-3 animate-pulse rounded-full", w)} style={{ backgroundColor: theme.agentBubbleBorder }} />
    ))}
  </div>
)

const ActionButton = ({ children, disabled, onClick, variant = "primary", theme }) => {
  const isPrimary = variant === "primary"
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={cn("rounded-2xl text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        isPrimary ? "flex w-full items-center justify-center gap-2 px-6 py-3 text-white shadow-lg hover:scale-[1.02] sm:w-auto" : "w-full border px-5 py-3 sm:w-auto")}
      style={isPrimary
        ? { background: `linear-gradient(135deg, ${theme.headerGradientStart}, ${theme.headerGradientEnd})` }
        : { borderColor: theme.inputBorder, backgroundColor: theme.windowWrapperBg, color: theme.agentText }}>
      {children}
    </button>
  )
}

const SubmitTicketModal = ({ onClose, sessionId, requesterId, userData, messages = [] }) => {
  const { theme } = useTheme()
  const { form, taxonomy, update, loading, success, submit, aiSummary, summaryLoading } = useTicketForm({
    sessionId, requesterId, userData, messages,
    onSuccess: () => { setTimeout(() => onClose?.(), 1500) },
  })

  const selectedDept = taxonomy.find(d => String(d.department_id) === String(form.department_id))
  const subcategories = selectedDept?.subcategories || []

  const isMissingInfo = summaryLoading === false && aiSummary?.summary?.includes("Unable to")
  const isFrozen = success || isMissingInfo

  const buttonContent = success ? (
    <><CheckCircle2 className="h-4 w-4" /> Submitted</>
  ) : loading ? (
    <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Escalating...</>
  ) : summaryLoading ? (
    <><LoaderCircle className="h-4 w-4 animate-spin" /> Preparing Summary...</>
  ) : (
    <><SendHorizonal className="h-4 w-4" /> Confirm Submit</>
  )

  return (
    <ModalShell onClose={onClose} title="Escalate to Human Agent" subtitle="Edit your escalation details below" size="md"
      icon={<MessageSquareWarning className="h-5 w-5" style={{ color: theme.headerText }} />}>
      <div className="max-h-[70vh] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border p-4" style={{ backgroundColor: theme.resolvedBannerBg, borderColor: theme.resolvedBannerBorder }}>
            <CheckCircle2 className="mt-0.5 h-5 w-5" style={{ color: theme.accent }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: theme.resolvedBannerText }}>Escalation submitted successfully.</p>
              <p className="mt-1 text-xs" style={{ color: theme.resolvedBannerText, opacity: 0.8 }}>Human support agents can now review this conversation.</p>
            </div>
          </div>
        )}
        {isMissingInfo && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border p-4" style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca" }}>
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-700">Missing Information</p>
              <p className="mt-1 text-xs text-red-600">{aiSummary?.summary}</p>
              <p className="mt-2 text-xs text-red-600">Please provide the missing details in the chat above, then try submitting the ticket again.</p>
            </div>
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.agentTimestamp }}>Summary</label>
            <input type="text" value={form.summary} onChange={e => update("summary", e.target.value)} placeholder="Brief summary of the issue"
              disabled={isFrozen}
              className={cn("w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-4", isFrozen && "cursor-not-allowed opacity-50")}
              style={{ backgroundColor: theme.windowWrapperBg, borderColor: theme.inputBorder, color: theme.agentText, "--tw-ring-color": theme.agentBubbleBorder }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.agentTimestamp }}>Description</label>
            <textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Detailed description..." rows={4}
              disabled={isFrozen}
              className={cn("w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-4", isFrozen && "cursor-not-allowed opacity-50")}
              style={{ backgroundColor: theme.windowWrapperBg, borderColor: theme.inputBorder, color: theme.agentText, "--tw-ring-color": theme.agentBubbleBorder }} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.agentTimestamp }}>Department</label>
              <select value={form.department_id} onChange={e => update("department_id", e.target.value)}
                disabled={isFrozen}
                className={cn("w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all focus:ring-4", isFrozen && "cursor-not-allowed opacity-50")}
                style={{ backgroundColor: theme.windowWrapperBg, borderColor: theme.inputBorder, color: theme.agentText, "--tw-ring-color": theme.agentBubbleBorder }}>
                <option value="">Select Department</option>
                {taxonomy.map(dept => <option key={dept.department_id} value={dept.department_id}>{dept.department_name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.agentTimestamp }}>Subcategory</label>
              <select value={form.subcategory_id} onChange={e => update("subcategory_id", e.target.value)}
                className={cn("w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all focus:ring-4", (!form.department_id || isFrozen) && "cursor-not-allowed opacity-50")}
                disabled={!form.department_id || isFrozen}
                style={{ backgroundColor: theme.windowWrapperBg, borderColor: theme.inputBorder, color: theme.agentText, "--tw-ring-color": theme.agentBubbleBorder }}>
                <option value="">Select Subcategory</option>
                {subcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border p-3" style={{ backgroundColor: theme.agentBubbleBg, borderColor: theme.agentBubbleBorder }}>
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" style={{ color: theme.accent }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: theme.agentText }}>Escalation Preview</p>
              <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: theme.agentTimestamp }}>
                The current conversation history and your edited summary will be forwarded to the live support workflow.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <ActionButton variant="secondary" onClick={onClose} disabled={success || loading} theme={theme}>Cancel</ActionButton>
          <ActionButton onClick={submit} disabled={success || loading || summaryLoading || !form.summary || !form.description || !form.department_id || !form.subcategory_id || isMissingInfo} theme={theme}>
            {buttonContent}
          </ActionButton>
        </div>
      </div>
    </ModalShell>
  )
}

export default SubmitTicketModal