import {
  Save,
  LoaderCircle,
  CheckCircle2,
  AlertTriangle,
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
        flex
        flex-col
        gap-5

        rounded-[32px]

        border
        border-[#26342f]

        bg-[#101715]

        p-7

        shadow-[0_20px_60px_rgba(0,0,0,0.35)]

        lg:flex-row
        lg:items-center
        lg:justify-between
      "
    >
      {/* LEFT */}
      <div className="space-y-3">

        <div>
          <h3
            className="
              text-lg
              font-semibold

              text-white
            "
          >
            Apply Configuration
          </h3>

          <p
            className="
              mt-1

              text-sm

              text-[#8ea59b]
            "
          >
            Save and activate the current
            AI pipeline configuration.
          </p>
        </div>

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
              py-2.5

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
              py-2.5

              text-sm
              font-medium

              text-red-400
            "
          >
            <AlertTriangle className="h-4 w-4" />

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
          min-w-[260px]
          items-center
          justify-center
          gap-3

          rounded-3xl

          border
          border-[#f5d547]/20

          bg-[#f5d547]

          px-8
          py-5

          text-base
          font-semibold

          text-[#111917]

          shadow-[0_10px_40px_rgba(245,213,71,0.18)]

          transition-all
          duration-300

          hover:scale-[1.02]
          hover:bg-[#f8de67]

          active:scale-[0.99]

          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {saving ? (
          <LoaderCircle
            className="
              h-5
              w-5
              animate-spin
            "
          />
        ) : (
          <Save className="h-5 w-5" />
        )}

        {
          saving
            ? "Saving Configuration..."
            : "Save AI Configuration"
        }
      </button>
    </div>
  )
}

export default SettingsActions