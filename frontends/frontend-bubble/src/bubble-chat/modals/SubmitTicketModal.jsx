import {
  Sparkles,
  SendHorizonal,
  BrainCircuit,
  MessageSquareWarning,
  CheckCircle2,
  ShieldAlert,
  LoaderCircle,
  AlertCircle,
} from "lucide-react"

import ModalShell from "../components/ModalShell.jsx"

import { useTicketForm } from "../hooks/useTicketForm"

import { cn } from "../utils/cn"

/* ========================================
   REUSABLE UI
======================================== */

const LoadingLines = () => (
  <div className="mt-4 space-y-3">
    {[
      "w-full",
      "w-11/12",
      "w-4/5",
    ].map(width => (
      <div
        key={width}
        className={cn(
          "h-3",
          width,
          "animate-pulse",
          "rounded-full",
          "bg-violet-100"
        )}
      />
    ))}
  </div>
)

const ActionButton = ({
  children,
  disabled,
  onClick,
  variant = "primary",
}) => {

  const isPrimary =
    variant === "primary"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-2xl",
        "text-sm font-medium",
        "transition-all duration-200",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",

        isPrimary
          ? [
              "flex w-full items-center justify-center gap-2",
              "bg-gradient-to-r from-violet-600 to-purple-500",
              "px-6 py-3",
              "text-white",
              "shadow-lg",
              "hover:scale-[1.02]",
              "sm:w-auto",
            ]
          : [
              "w-full",
              "border border-slate-200",
              "bg-white",
              "px-5 py-3",
              "text-slate-700",
              "hover:bg-slate-50",
              "sm:w-auto",
            ]
      )}
    >
      {children}
    </button>
  )
}

/* ========================================
   COMPONENT
======================================== */

const SubmitTicketModal = ({
  onClose,
  sessionId,
  requesterId,
  messages = [],
}) => {

  const {
    form,
    taxonomy,
    update,
    loading,
    success,
    submit,
    aiSummary,
    summaryLoading,
  } = useTicketForm({
    sessionId,
    requesterId,
    messages,

    onSuccess: () => {

      setTimeout(() => {
        onClose?.()
      }, 1200)
    },
  })

  const selectedDept = taxonomy.find(
    d => String(d.department_id) === String(form.department_id)
  )

  const subcategories = selectedDept?.subcategories || []

  const buttonContent =
    loading ? (
      <>
        <div
          className="
            h-4 w-4
            animate-spin
            rounded-full
            border-2
            border-white/40
            border-t-white
          "
        />

        Escalating...
      </>
    ) : summaryLoading ? (
      <>
        <LoaderCircle
          className="
            h-4 w-4
            animate-spin
          "
        />

        Preparing Summary...
      </>
    ) : (
      <>
        <SendHorizonal
          className="
            h-4 w-4
          "
        />

        Confirm Submit
      </>
    )

  return (
    <ModalShell
      onClose={onClose}
      title="Escalate to Human Agent"
      subtitle="Edit your escalation details below"
      size="md"
      icon={
        <MessageSquareWarning
          className="
            h-5 w-5
          "
        />
      }
    >
      <div
        className="
          max-h-[70vh]
          overflow-y-auto
          px-4 py-4
          sm:px-6 sm:py-5
        "
      >

        {/* SUCCESS */}
        {success && (
          <div
            className="
              mb-5
              flex items-start gap-3
              rounded-2xl
              border border-emerald-100
              bg-emerald-50
              p-4
            "
          >
            <CheckCircle2
              className="
                mt-0.5
                h-5 w-5
                text-emerald-600
              "
            />

            <div>
              <p
                className="
                  text-sm font-semibold
                  text-emerald-700
                "
              >
                Escalation submitted successfully.
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-emerald-600
                "
              >
                Human support agents can now review this conversation.
              </p>
            </div>
          </div>
        )}

        {/* ERROR - MISSING INFO */}
        {summaryLoading === false && aiSummary?.summary?.includes("Unable to") && (
          <div
            className="
              mb-5
              flex items-start gap-3
              rounded-2xl
              border border-red-100
              bg-red-50
              p-4
            "
          >
            <AlertCircle
              className="
                mt-0.5
                h-5 w-5
                text-red-600
              "
            />

            <div>
              <p
                className="
                  text-sm font-semibold
                  text-red-700
                "
              >
                Missing Information
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-red-600
                "
              >
                {aiSummary?.summary}
              </p>

              <p
                className="
                  mt-2
                  text-xs
                  text-red-600
                "
              >
                Please provide the missing details in the chat above, then try submitting the ticket again.
              </p>
            </div>
          </div>
        )}

        {/* EDITABLE FORM */}
        <div className="space-y-4">
          {/* SUMMARY */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Summary
            </label>
            <input
              type="text"
              value={form.summary}
              onChange={e => update("summary", e.target.value)}
              placeholder="Brief summary of the issue"
              disabled={
                summaryLoading === false &&
                aiSummary?.summary?.includes("Unable to")
              }
              className={cn(
                "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5",
                "text-sm text-slate-900 outline-none transition-all",
                "focus:border-violet-400 focus:ring-4 focus:ring-violet-50",
                (summaryLoading === false &&
                  aiSummary?.summary?.includes("Unable to")) &&
                "cursor-not-allowed opacity-50"
              )}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => update("description", e.target.value)}
              placeholder="Detailed description..."
              rows={4}
              disabled={
                summaryLoading === false &&
                aiSummary?.summary?.includes("Unable to")
              }
              className={cn(
                "w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5",
                "text-sm text-slate-900 outline-none transition-all",
                "focus:border-violet-400 focus:ring-4 focus:ring-violet-50",
                (summaryLoading === false &&
                  aiSummary?.summary?.includes("Unable to")) &&
                "cursor-not-allowed opacity-50"
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* DEPARTMENT */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Department
              </label>
              <select
                value={form.department_id}
                onChange={e => update("department_id", e.target.value)}
                disabled={
                  summaryLoading === false &&
                  aiSummary?.summary?.includes("Unable to")
                }
                className={cn(
                  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5",
                  "text-sm text-slate-900 outline-none transition-all",
                  "focus:border-violet-400 focus:ring-4 focus:ring-violet-50",
                  (summaryLoading === false &&
                    aiSummary?.summary?.includes("Unable to")) &&
                  "cursor-not-allowed opacity-50"
                )}
              >
                <option value="">Select Department</option>
                {taxonomy.map(dept => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBCATEGORY */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Subcategory
              </label>
              <select
                value={form.subcategory_id}
                onChange={e => update("subcategory_id", e.target.value)}
                className={cn(
                  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5",
                  "text-sm text-slate-900 outline-none transition-all",
                  "focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
                )}
                disabled={
                  !form.department_id ||
                  (summaryLoading === false &&
                    aiSummary?.summary?.includes("Unable to"))
                }
              >
                <option value="">Select Subcategory</option>
                {subcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* PIPELINE INFO */}
        <div
          className="
            mt-6
            rounded-2xl
            border border-amber-100
            bg-amber-50/50
            p-3
          "
        >
          <div
            className="
              flex items-start gap-3
            "
          >
            <ShieldAlert
              className="
                mt-0.5
                h-4 w-4 shrink-0
                text-amber-600
              "
            />

            <div>
              <p
                className="
                  text-xs font-semibold
                  text-amber-800
                "
              >
                Escalation Preview
              </p>

              <p
                className="
                  mt-0.5
                  text-[11px] leading-relaxed
                  text-amber-700
                "
              >
                The current conversation history and your edited
                summary will be forwarded to the live support workflow.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="
            mt-6
            flex flex-col-reverse gap-3
            sm:flex-row sm:justify-end
          "
        >

          <ActionButton
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </ActionButton>

          <ActionButton
            onClick={submit}
            disabled={
              loading ||
              summaryLoading ||
              !form.summary ||
              !form.description ||
              !form.department_id ||
              !form.subcategory_id ||
              (summaryLoading === false &&
                aiSummary?.summary?.includes("Unable to"))
            }
          >
            {buttonContent}
          </ActionButton>

        </div>
      </div>
    </ModalShell>
  )
}

export default SubmitTicketModal