import { useState } from "react"
import {
  Bot,
  Sparkles,
  ShieldCheck,
  X,
} from "lucide-react"

const AboutHelpDeskModal = ({ onClose }) => {
  const [closing, setClosing] = useState(false)

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 200)
  }

  const features = [
    "AI-powered support assistance",
    "Future live agent integration",
    "Conversation history tracking",
    "Ticket submission support",
  ]

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-3 sm:p-4 backdrop-blur-[4px] transition-all duration-200 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Modal */}
      <div
        className={`flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.18)] transition-all duration-300 ${
          closing
            ? "translate-y-4 scale-95 opacity-0"
            : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-100 sm:h-11 sm:w-11">
              <Bot className="h-5 w-5 text-violet-700" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-500">
                AI Support System
              </p>

              <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                About Help Desk AI
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-white transition hover:bg-violet-50"
          >
            <X className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style>
            {`
              div::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>

          <p className="text-sm leading-relaxed text-slate-600">
            Help Desk AI is a modern support assistant designed to provide
            instant answers, streamline ticket handling, and improve support
            experiences across your platform.
          </p>

          {/* Features */}
          <div className="mt-5 space-y-3">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                </div>

                <p className="break-words text-sm font-medium leading-relaxed text-slate-700">
                  {feature}
                </p>
              </div>
            ))}
          </div>

          {/* Footer Card */}
          <div className="mt-5 rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  Future Ready Architecture
                </p>

                <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">
                  Built for future AI integrations, live support systems,
                  database connectivity, and scalable SaaS workflows.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutHelpDeskModal