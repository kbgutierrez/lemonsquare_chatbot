import {
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

const SettingsStatus = ({
  success,
  error,
}) => {

  if (!success && !error)
    return null

  return (
    <>
      {success && (
        <div
          className="
            flex
            items-center
            gap-2

            rounded-2xl

            border
            border-emerald-200

            bg-emerald-50

            px-4
            py-3

            text-sm
            text-emerald-700
          "
        >
          <CheckCircle2 className="h-4 w-4" />

          {success}
        </div>
      )}

      {error && (
        <div
          className="
            flex
            items-center
            gap-2

            rounded-2xl

            border
            border-red-200

            bg-red-50

            px-4
            py-3

            text-sm
            text-red-700
          "
        >
          <AlertCircle className="h-4 w-4" />

          {error}
        </div>
      )}
    </>
  )
}

export default SettingsStatus