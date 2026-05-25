import {
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

const STATUS_STYLES = {
  loading: {
    border: "rgba(245, 213, 71, 0.22)",
    background: "rgba(245, 213, 71, 0.10)",
    color: "var(--accent)",
  },

  success: {
    border: "rgba(34, 197, 94, 0.20)",
    background: "rgba(34, 197, 94, 0.10)",
    color: "#4ade80",
  },

  error: {
    border: "rgba(239, 68, 68, 0.20)",
    background: "rgba(239, 68, 68, 0.10)",
    color: "#f87171",
  },
}

const baseClassName = `
  inline-flex
  items-center
  gap-2
  rounded-xl
  border
  px-3
  py-1.5
  text-xs
  font-semibold
`

const UploadStatusBadge = ({
  status,
  statusType,
}) => {
  /* ========================================
     LOADING
  ======================================== */
  if (statusType === "loading") {
    return (
      <span
        className={baseClassName}
        style={{
          borderColor:
            STATUS_STYLES.loading.border,

          background:
            STATUS_STYLES.loading.background,

          color:
            STATUS_STYLES.loading.color,
        }}
      >
        <LoaderCircle
          className="
            h-3.5
            w-3.5
            animate-spin
          "
        />

        {status}
      </span>
    )
  }

  /* ========================================
     SUCCESS
  ======================================== */
  if (statusType === "success") {
    return (
      <span
        className={baseClassName}
        style={{
          borderColor:
            STATUS_STYLES.success.border,

          background:
            STATUS_STYLES.success.background,

          color:
            STATUS_STYLES.success.color,
        }}
      >
        <CheckCircle2
          className="
            h-3.5
            w-3.5
          "
        />

        {status}
      </span>
    )
  }

  /* ========================================
     ERROR
  ======================================== */
  return (
    <span
      className={baseClassName}
      style={{
        borderColor:
          STATUS_STYLES.error.border,

        background:
          STATUS_STYLES.error.background,

        color:
          STATUS_STYLES.error.color,
      }}
    >
      <AlertCircle
        className="
          h-3.5
          w-3.5
        "
      />

      {status}
    </span>
  )
}

export default UploadStatusBadge