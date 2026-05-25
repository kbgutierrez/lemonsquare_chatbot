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
        panel-base

        flex
        flex-col
        gap-5

        rounded-[24px]

        p-5

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
              text-base
              font-semibold

              text-[var(--text-primary)]
            "
          >
            Apply Configuration
          </h3>

          <p
            className="
              mt-1

              text-sm
              leading-relaxed

              text-[var(--text-secondary)]
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

              rounded-xl

              border
              border-emerald-500/20

              bg-emerald-500/10

              px-3
              py-2

              text-sm
              font-medium

              text-emerald-600

              dark:text-emerald-400
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

              rounded-xl

              border
              border-red-500/20

              bg-red-500/10

              px-3
              py-2

              text-sm
              font-medium

              text-red-600

              dark:text-red-400
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
          min-w-[210px]
          items-center
          justify-center
          gap-2.5

          rounded-2xl

          border
          border-[var(--accent)]/20

          bg-[var(--accent)]

          px-6
          py-3.5

          text-sm
          font-semibold

          text-[#1b211e]

          shadow-[0_8px_28px_rgba(245,213,71,0.16)]

          transition-all
          duration-300

          hover:scale-[1.015]
          hover:brightness-105

          active:scale-[0.99]

          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {saving ? (
          <LoaderCircle
            className="
              h-4.5
              w-4.5
              animate-spin
            "
          />
        ) : (
          <Save className="h-4.5 w-4.5" />
        )}

        {
          saving
            ? "Saving..."
            : "Save Configuration"
        }
      </button>
    </div>
  )
}

export default SettingsActions