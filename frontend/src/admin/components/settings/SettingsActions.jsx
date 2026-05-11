import {
  Save,
  LoaderCircle,
} from "lucide-react"

const SettingsActions = ({
  saving,
  onSave,
}) => {

  return (
    <button
      type="button"

      disabled={saving}

      onClick={onSave}

      className="
        flex
        items-center
        justify-center
        gap-2

        rounded-2xl

        bg-gradient-to-r
        from-violet-600
        to-purple-500

        px-5
        py-3

        text-sm
        font-medium
        text-white

        shadow-lg

        transition-all
        duration-200

        hover:scale-[1.01]

        disabled:opacity-70
      "
    >
      {saving ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}

      {
        saving
          ? "Saving..."
          : "Save AI Settings"
      }
    </button>
  )
}

export default SettingsActions