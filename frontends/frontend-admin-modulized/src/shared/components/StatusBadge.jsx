import { LoaderCircle, CheckCircle2, AlertCircle } from "lucide-react"

const STATUS_CONFIG = {
  loading: { icon: LoaderCircle, border: "border-[#5a4a1c]", bg: "bg-[#2b2414]", text: "text-[#f5d547]", spin: true },
  success: { icon: CheckCircle2, border: "border-[#294137]", bg: "bg-[#17231f]", text: "text-[#8dd9a7]", spin: false },
  warning: { icon: AlertCircle, border: "border-[#4c4a1c]", bg: "bg-[#2b2a14]", text: "text-[#f5d547]", spin: false },
  error: { icon: AlertCircle, border: "border-[#4c2626]", bg: "bg-[#2a1818]", text: "text-[#ff8d8d]", spin: false },
  default: { icon: AlertCircle, border: "border-[#4c2626]", bg: "bg-[#2a1818]", text: "text-[#ff8d8d]", spin: false },
}

const StatusBadge = ({ status, statusType, className = "" }) => {
  const config = STATUS_CONFIG[statusType] || STATUS_CONFIG.default
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-2 rounded-xl border ${config.border} ${config.bg} px-3 py-1.5 text-xs font-semibold ${config.text} ${className}`}>
      <Icon className={`h-3.5 w-3.5 ${config.spin ? "animate-spin" : ""}`} />
      {status}
    </span>
  )
}

export default StatusBadge
