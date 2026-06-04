import { useRef, useCallback } from "react"
import { Sparkles, SendHorizonal, BrainCircuit, MessageSquareWarning, CheckCircle2, ShieldAlert, LoaderCircle, AlertCircle, ImageIcon, X } from "lucide-react"
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
        ? { background: `linear-gradient(135deg, ${theme.headerGradientStart}, ${theme.headerGradientEnd})`, WebkitTextFillColor: "#ffffff" }
        : { borderColor: theme.inputBorder, backgroundColor: theme.windowWrapperBg, color: theme.agentText, WebkitTextFillColor: theme.agentText }}>
      {children}
    </button>
  )
}

/* ========================================
   IMAGE UPLOAD BUTTON
   CONSTRAINT: PNG and JPEG only.
   Validation is centralized in useTicketForm.
======================================== */

const ImageUploadButton = ({ onFileSelect, disabled, theme, hasImage }) => {
  const inputRef = useRef(null)

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }, [disabled])

  const handleChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
    e.target.value = ""
  }, [onFileSelect])

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleChange}
        aria-label="Select image attachment"
      />

      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all duration-200",
          disabled && "cursor-not-allowed opacity-50"
        )}
        style={{
          backgroundColor: theme.windowWrapperBg,
          borderColor: theme.inputBorder,
          color: theme.agentText,
          WebkitTextFillColor: theme.agentText,
        }}
      >
        <ImageIcon
          className="h-3.5 w-3.5"
          style={{ color: theme.accent, WebkitTextFillColor: theme.accent }}
        />

        {hasImage ? "Replace image" : "Attach image"}
      </button>
    </div>
  )
}

const SubmitTicketModal = ({ onClose, onSubmitted, sessionId, requesterId, userData, messages = [], initialDraftData = null }) => {
  const { theme } = useTheme()
  const { form, taxonomy, update, loading, success, submit, aiSummary, summaryLoading, imageFile, imagePreview, imageError } = useTicketForm({
    sessionId, requesterId, userData, messages,
    onSuccess: () => {
      onSubmitted?.()
      setTimeout(() => onClose?.(), 1500)
    },
    initialDraftData,
  })

  const selectedDept = taxonomy.find(d => String(d.department_id) === String(form.department_id))
  const subcategories = selectedDept?.subcategories || []

  const isMissingInfo = summaryLoading === false && aiSummary?.summary?.includes("Unable to")
  const isFrozen = success || isMissingInfo

  const buttonContent = success ? (
    <><CheckCircle2 className="h-4 w-4" style={{ WebkitTextFillColor: "#ffffff" }} /> Submitted</>
  ) : loading ? (
    <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Escalating...</>
  ) : summaryLoading ? (
    <><LoaderCircle className="h-4 w-4 animate-spin" style={{ WebkitTextFillColor: "#ffffff" }} /> Preparing Summary...</>
  ) : (
    <><SendHorizonal className="h-4 w-4" style={{ WebkitTextFillColor: "#ffffff" }} /> Confirm Submit</>
  )

  return (
    <ModalShell onClose={onClose} title="Escalate to Human Agent" subtitle="Edit your escalation details below" size="md"
      icon={<MessageSquareWarning className="h-5 w-5" style={{ color: theme.headerText, WebkitTextFillColor: theme.headerText }} />}>
      <div className="max-h-[70vh] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border p-4" style={{ backgroundColor: theme.resolvedBannerBg, borderColor: theme.resolvedBannerBorder }}>
            <CheckCircle2 className="mt-0.5 h-5 w-5" style={{ color: theme.accent, WebkitTextFillColor: theme.accent }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: theme.resolvedBannerText, WebkitTextFillColor: theme.resolvedBannerText }}>Escalation submitted successfully.</p>
              <p className="mt-1 text-xs" style={{ color: theme.resolvedBannerText, WebkitTextFillColor: theme.resolvedBannerText, opacity: 0.8 }}>Human support agents can now review this conversation.</p>
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
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.agentTimestamp, WebkitTextFillColor: theme.agentTimestamp }}>Summary</label>
            <input type="text" value={form.summary} onChange={e => update("summary", e.target.value)} placeholder="Brief summary of the issue"
              disabled={isFrozen}
              className={cn("w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-4", isFrozen && "cursor-not-allowed opacity-50")}
              style={{ backgroundColor: theme.windowWrapperBg, borderColor: theme.inputBorder, color: theme.agentText, WebkitTextFillColor: theme.agentText, "--tw-ring-color": theme.agentBubbleBorder }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.agentTimestamp, WebkitTextFillColor: theme.agentTimestamp }}>Description</label>
            <textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Detailed description..." rows={4}
              disabled={isFrozen}
              className={cn("w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-4", isFrozen && "cursor-not-allowed opacity-50")}
              style={{ backgroundColor: theme.windowWrapperBg, borderColor: theme.inputBorder, color: theme.agentText, WebkitTextFillColor: theme.agentText, "--tw-ring-color": theme.agentBubbleBorder }} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.agentTimestamp, WebkitTextFillColor: theme.agentTimestamp }}>Department</label>
              <select value={form.department_id} onChange={e => update("department_id", e.target.value)}
                disabled={isFrozen}
                className={cn("w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all focus:ring-4", isFrozen && "cursor-not-allowed opacity-50")}
                style={{ backgroundColor: theme.windowWrapperBg, borderColor: theme.inputBorder, color: theme.agentText, WebkitTextFillColor: theme.agentText, "--tw-ring-color": theme.agentBubbleBorder }}>
                <option value="">Select Department</option>
                {taxonomy.map(dept => <option key={dept.department_id} value={dept.department_id}>{dept.department_name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.agentTimestamp, WebkitTextFillColor: theme.agentTimestamp }}>Subcategory</label>
              <select value={form.subcategory_id} onChange={e => update("subcategory_id", e.target.value)}
                className={cn("w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all focus-:ring-4", (!form.department_id || isFrozen) && "cursor-not-allowed opacity-50")}
                disabled={!form.department_id || isFrozen}
                style={{ backgroundColor: theme.windowWrapperBg, borderColor: theme.inputBorder, color: theme.agentText, WebkitTextFillColor: theme.agentText, "--tw-ring-color": theme.agentBubbleBorder }}>
                <option value="">Select Subcategory</option>
                {subcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </select>
            </div>
          </div>

          {/* ========================================
             LOCATION & EQUIPMENT
          ======================================== */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.agentTimestamp, WebkitTextFillColor: theme.agentTimestamp }}>Location</label>
              <input
                type="text"
                value={form.location}
                onChange={e => update("location", e.target.value)}
                placeholder="e.g. Building A, Floor 3"
                disabled={isFrozen}
                className={cn("w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-4", isFrozen && "cursor-not-allowed opacity-50")}
                style={{ backgroundColor: theme.windowWrapperBg, borderColor: theme.inputBorder, color: theme.agentText, WebkitTextFillColor: theme.agentText, "--tw-ring-color": theme.agentBubbleBorder }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.agentTimestamp, WebkitTextFillColor: theme.agentTimestamp }}>Equipment</label>
              <input
                type="text"
                value={form.equipment}
                onChange={e => update("equipment", e.target.value)}
                placeholder="e.g. Laptop, Printer"
                disabled={isFrozen}
                className={cn("w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-4", isFrozen && "cursor-not-allowed opacity-50")}
                style={{ backgroundColor: theme.windowWrapperBg, borderColor: theme.inputBorder, color: theme.agentText, WebkitTextFillColor: theme.agentText, "--tw-ring-color": theme.agentBubbleBorder }}
              />
            </div>
          </div>

          {/* ========================================
             IMAGE ATTACHMENT SECTION
             CONSTRAINT: PNG and JPEG only.
          ======================================== */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.agentTimestamp, WebkitTextFillColor: theme.agentTimestamp }}>Attachment</label>
            <div className="flex items-center gap-3">
              <ImageUploadButton
                onFileSelect={(file) => update("image", file)}
                disabled={isFrozen}
                theme={theme}
                hasImage={Boolean(imageFile)}
              />
              {imageFile && (
                <span className="max-w-[180px] truncate text-xs" style={{ color: theme.agentTimestamp, WebkitTextFillColor: theme.agentTimestamp }}>
                  {imageFile.name}
                </span>
              )}
            </div>

            {imagePreview && (
              <div className="relative mt-3 inline-block max-w-full overflow-hidden rounded-xl border" style={{ borderColor: theme.inputBorder }}>
                <img
                  src={imagePreview}
                  alt="Attachment preview"
                  className="max-h-40 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => update("image", null)}
                  disabled={isFrozen}
                  aria-label="Remove image attachment"
                  className={cn(
                    "absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-200 hover:scale-105",
                    isFrozen && "cursor-not-allowed opacity-50"
                  )}
                  style={{ backgroundColor: theme.windowWrapperBg, borderColor: theme.inputBorder, color: theme.agentText, WebkitTextFillColor: theme.agentText }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {imageError && (
              <p className="mt-1.5 text-xs font-medium text-red-500">{imageError}</p>
            )}
          </div>
        </div>
        <div className="mt-6 rounded-2xl border p-3" style={{ backgroundColor: theme.agentBubbleBg, borderColor: theme.agentBubbleBorder }}>
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" style={{ color: theme.accent, WebkitTextFillColor: theme.accent }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: theme.agentText, WebkitTextFillColor: theme.agentText }}>Escalation Preview</p>
              <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: theme.agentTimestamp, WebkitTextFillColor: theme.agentTimestamp }}>
                The current conversation history and your edited summary will be forwarded to the live support workflow.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <ActionButton variant="secondary" onClick={onClose} disabled={success || loading} theme={theme}>Cancel</ActionButton>
          <ActionButton onClick={submit} disabled={success || loading || summaryLoading || !form.summary || !form.description || !form.department_id || !form.subcategory_id || isMissingInfo || imageError} theme={theme}>
            {buttonContent}
          </ActionButton>
        </div>
      </div>
    </ModalShell>
  )
}

export default SubmitTicketModal