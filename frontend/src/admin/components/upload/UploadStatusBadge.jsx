import {
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

const UploadStatusBadge = ({
  status,
  statusType,
}) => {

  if (
    statusType ===
    "loading"
  ) {

    return (
      <span
        className="
          inline-flex
          items-center
          gap-1

          rounded-full

          bg-amber-100

          px-2
          py-1

          text-xs
          font-semibold

          text-amber-700
        "
      >
        <LoaderCircle className="h-3 w-3 animate-spin" />

        {status}
      </span>
    )
  }

  if (
    statusType ===
    "success"
  ) {

    return (
      <span
        className="
          inline-flex
          items-center
          gap-1

          rounded-full

          bg-emerald-100

          px-2
          py-1

          text-xs
          font-semibold

          text-emerald-700
        "
      >
        <CheckCircle2 className="h-3 w-3" />

        {status}
      </span>
    )
  }

  return (
    <span
      className="
        inline-flex
        items-center
        gap-1

        rounded-full

        bg-red-100

        px-2
        py-1

        text-xs
        font-semibold

        text-red-700
      "
    >
      <AlertCircle className="h-3 w-3" />

      {status}
    </span>
  )
}

export default UploadStatusBadge