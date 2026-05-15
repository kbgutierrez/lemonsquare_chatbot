import {
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

const UploadStatusBadge = ({
  status,
  statusType,
}) => {

  /* LOADING */
  if (
    statusType ===
    "loading"
  ) {

    return (
      <span
        className="
          inline-flex
          items-center
          gap-2

          rounded-xl

          border
          border-[#5a4a1c]

          bg-[#2b2414]

          px-3
          py-1.5

          text-xs
          font-semibold

          text-[#f5d547]
        "
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

  /* SUCCESS */
  if (
    statusType ===
    "success"
  ) {

    return (
      <span
        className="
          inline-flex
          items-center
          gap-2

          rounded-xl

          border
          border-[#294137]

          bg-[#17231f]

          px-3
          py-1.5

          text-xs
          font-semibold

          text-[#8dd9a7]
        "
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

  /* ERROR */
  return (
    <span
      className="
        inline-flex
        items-center
        gap-2

        rounded-xl

        border
        border-[#4c2626]

        bg-[#2a1818]

        px-3
        py-1.5

        text-xs
        font-semibold

        text-[#ff8d8d]
      "
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