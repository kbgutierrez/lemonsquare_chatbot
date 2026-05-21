import {
  LoaderCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

const config = {
  loading: {
    Icon: LoaderCircle,
    border: "border-[#5a4a1c]",
    bg: "bg-[#2b2414]",
    text: "text-[#f5d547]",
    spin: true,
  },

  success: {
    Icon: CheckCircle2,
    border: "border-[#294137]",
    bg: "bg-[#17231f]",
    text: "text-[#8dd9a7]",
    spin: false,
  },

  warning: {
    Icon: AlertTriangle,
    border: "border-[#4c4a1c]",
    bg: "bg-[#2b2a14]",
    text: "text-[#f5d547]",
    spin: false,
  },

  error: {
    Icon: AlertTriangle,
    border: "border-[#4c2626]",
    bg: "bg-[#2a1818]",
    text: "text-[#ff8d8d]",
    spin: false,
  },

  default: {
    Icon: AlertTriangle,
    border: "border-[#4c2626]",
    bg: "bg-[#2a1818]",
    text: "text-[#ff8d8d]",
    spin: false,
  },
}

const UploadStatusBadge = ({
  status,
  statusType,
}) => {
  if (!status) {
    return null
  }

  const {
    Icon,
    border,
    bg,
    text,
    spin,
  } = config[statusType] || config.default

  return (
    <div className="pt-1">
      <div
        className={`flex w-full items-start gap-3 rounded-2xl border ${border} ${bg} px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]`}
      >
        {/* Icon */}
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black/10 ${text}`}
        >
          <Icon
            className={`h-4 w-4 ${
              spin ? "animate-spin" : ""
            }`}
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold leading-relaxed ${text}`}
          >
            {status}
          </p>

          <p className="mt-1 text-xs leading-relaxed text-[#8a9b95]">
            {statusType === "loading"
              ? "Your files are currently being processed."
              : statusType === "success"
              ? "The upload completed successfully."
              : statusType === "warning"
              ? "The upload completed with warnings."
              : "An issue occurred during upload processing."}
          </p>
        </div>
      </div>
    </div>
  )
}

export default UploadStatusBadge