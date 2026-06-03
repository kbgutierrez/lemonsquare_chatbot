import { Bot, ShieldCheck, AlertTriangle } from "lucide-react"
import ModalShell from "../components/ModalShell.jsx"
import { useTheme } from "../context/ThemeContext.jsx"

const AboutHelpDeskModal = ({ onClose }) => {
  const { theme } = useTheme()

  const allowedUsage = [
    "IT support concerns",
    "Technical troubleshooting",
    "Software-related issues",
    "Hardware-related issues",
    "Network and connectivity problems",
    "Helpdesk ticket inquiries",
  ]

  const prohibitedUsage = [
    "Casual conversations or chatting",
    "Personal discussions",
    "Entertainment requests",
    "Roleplaying or fictional scenarios",
    "Relationship or life advice",
    "School assignments unrelated to IT support",
    "Spam, testing, or unnecessary message flooding",
    "Any non-IT related topic",
  ]

  return (
    <ModalShell
      onClose={onClose}
      title="Chatbot Usage Policy"
     
      size="md"
      icon={<Bot className="h-5 w-5" style={{ color: theme.headerText }} />}
    >
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <p
          className="text-sm leading-relaxed"
          style={{ color: theme.agentText }}
        >
          C.C Helpdesk AI is intended exclusively for IT support and technical
          assistance. Please use the chatbot only for concerns related to
          troubleshooting, technical issues, and helpdesk services.
        </p>

        <div className="mt-5 rounded-3xl border p-4"
          style={{
            backgroundColor: theme.agentBubbleBg,
            borderColor: theme.agentBubbleBorder,
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck
              className="h-5 w-5"
              style={{ color: theme.accent }}
            />
            <h3
              className="text-sm font-semibold"
              style={{ color: theme.agentText }}
            >
              Allowed Usage
            </h3>
          </div>

          <div className="space-y-2">
            {allowedUsage.map((item) => (
              <div
                key={item}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{
                  backgroundColor: theme.windowWrapperBg,
                  borderColor: theme.agentBubbleBorder,
                  color: theme.agentText,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-5 rounded-3xl border p-4"
          style={{
            backgroundColor: theme.resolvedBannerBg,
            borderColor: theme.resolvedBannerBorder,
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle
              className="h-5 w-5"
              style={{ color: theme.accent }}
            />
            <h3
              className="text-sm font-semibold"
              style={{ color: theme.agentText }}
            >
              Prohibited Usage
            </h3>
          </div>

          <div className="space-y-2">
            {prohibitedUsage.map((item) => (
              <div
                key={item}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{
                  backgroundColor: theme.windowWrapperBg,
                  borderColor: theme.agentBubbleBorder,
                  color: theme.agentText,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-5 rounded-3xl border p-4"
          style={{
            backgroundColor: theme.agentBubbleBg,
            borderColor: theme.agentBubbleBorder,
          }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: theme.agentText }}
          >
            Important Notice
          </p>

          <p
            className="mt-2 text-xs leading-relaxed"
            style={{ color: theme.agentTimestamp }}
          >
            All chatbot interactions may be logged for support, auditing,
            reporting, analytics, and service improvement purposes. Misuse of
            the chatbot, excessive non-support conversations, or attempts to use
            the system outside its intended purpose may be monitored and
            reviewed by administrators.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${theme.headerGradientStart}, ${theme.headerGradientEnd})`,
            }}
          >
            I Understand
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

export default AboutHelpDeskModal