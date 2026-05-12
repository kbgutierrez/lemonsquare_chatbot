import {
  Save,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

const SettingsActions = ({
  saving,
  success,
  error,
  onSave,
}) => {

  return (
    <div
      className="
        sticky
        bottom-0
        z-20

        flex
        flex-col
        gap-4

        rounded-[28px]

        border
        border-[#26342f]

        bg-[#101715]/95

        p-5

        shadow-[0_10px_50px_rgba(0,0,0,0.35)]

        backdrop-blur-xl

        lg:flex-row
        lg:items-center
        lg:justify-between
      "
    >
      {/* STATUS */}
      <div
        className="
          flex
          flex-wrap
          items-center
          gap-3
        "
      >
        {/* SUCCESS */}
        {success && (
          <div
            className="
              inline-flex
              items-center
              gap-2

              rounded-2xl

              border
              border-emerald-500/20

              bg-emerald-500/10

              px-4
              py-2

              text-sm
              font-medium

              text-emerald-400
            "
          >
            <CheckCircle2 className="h-4 w-4" />

            Settings saved successfully
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div
            className="
              inline-flex
              items-center
              gap-2

              rounded-2xl

              border
              border-red-500/20

              bg-red-500/10

              px-4
              py-2

              text-sm
              font-medium

              text-red-400
            "
          >
            <AlertCircle className="h-4 w-4" />

            {error}
          </div>
        )}
      </div>

      {/* ACTION */}
      <button
        type="button"

        disabled={saving}

        onClick={onSave}

        className="
          inline-flex
          items-center
          justify-center
          gap-3

          rounded-2xl

          border
          border-[#f5d547]/20

          bg-[#f5d547]

          px-6
          py-3.5

          text-sm
          font-semibold

          text-[#111917]

          transition-all
          duration-200

          hover:scale-[1.01]
          hover:bg-[#f8de67]

          active:scale-[0.99]

          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {saving ? (
          <LoaderCircle
            className="
              h-4
              w-4
              animate-spin
            "
          />
        ) : (
          <Save className="h-4 w-4" />
        )}

        {
          saving
            ? "Saving..."
            : "Save AI Settings"
        }
      </button>
    </div>
  )
}

export default SettingsActions