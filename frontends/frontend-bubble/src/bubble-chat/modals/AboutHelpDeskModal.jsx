import { Bot, Sparkles, ShieldCheck } from "lucide-react"
import ModalShell from "../components/ModalShell.jsx"
import { useTheme } from "../context/ThemeContext.jsx"

const AboutHelpDeskModal = ({ onClose }) => {
  const { theme } = useTheme()

  const features = [
    "AI-powered support assistance",
    "Future live agent integration",
    "Conversation history tracking",
    "Ticket submission support",
  ]

  return (
    <ModalShell onClose={onClose} title="About Help Desk AI" subtitle="AI Support System" size="md"
      icon={<Bot className="h-5 w-5" style={{ color: theme.headerText }} />}>
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-sm leading-relaxed" style={{ color: theme.agentText }}>
          Help Desk AI is a modern support assistant designed to provide instant answers, streamline ticket handling, and improve support experiences across your platform.
        </p>
        <div className="mt-5 space-y-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-3 rounded-2xl border p-3"
              style={{ backgroundColor: theme.agentBubbleBg, borderColor: theme.agentBubbleBorder }}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: theme.windowWrapperBg }}>
                <Sparkles className="h-4 w-4" style={{ color: theme.accent }} />
              </div>
              <p className="break-words text-sm font-medium leading-relaxed" style={{ color: theme.agentText }}>{feature}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-3xl border p-4" style={{ backgroundColor: theme.resolvedBannerBg, borderColor: theme.resolvedBannerBorder }}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: theme.windowWrapperBg }}>
              <ShieldCheck className="h-5 w-5" style={{ color: theme.accent }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: theme.agentText }}>Future Ready Architecture</p>
              <p className="mt-1 break-words text-xs leading-relaxed" style={{ color: theme.agentTimestamp }}>
                Built for future AI integrations, live support systems, database connectivity, and scalable SaaS workflows.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose}
            className="rounded-2xl px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg, ${theme.headerGradientStart}, ${theme.headerGradientEnd})` }}>
            Got it
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

export default AboutHelpDeskModal