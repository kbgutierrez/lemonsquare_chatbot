import {
  useEffect,
  useState,
} from "react"

import {
  SlidersHorizontal,
  BrainCircuit,
  Layers3,
  ShieldCheck,
  Sparkles,
  FileSearch,
  Save,
  LoaderCircle,
} from "lucide-react"

import {
  API_CONFIG,
  AI_DEFAULTS,
} from "../../config/sqlVariables"

const Toggle = ({
  value,
  onChange,
}) => (
  <button
    type="button"
    onClick={() =>
      onChange(!value)
    }
    className={`
      relative
      h-7
      w-12
      rounded-full
      transition-all
      duration-300

      ${
        value
          ? "bg-violet-600"
          : "bg-slate-300"
      }
    `}
  >
    <div
      className={`
        absolute
        top-1

        h-5
        w-5

        rounded-full
        bg-white

        transition-all
        duration-300

        ${
          value
            ? "left-6"
            : "left-1"
        }
      `}
    />
  </button>
)

const Row = ({
  icon: Icon,
  title,
  description,
  children,
}) => (
  <div
    className="
      rounded-2xl
      border
      border-violet-100
      bg-violet-50/40
      p-4
    "
  >
    <div
      className="
        mb-4
        flex
        items-start
        gap-3
      "
    >
      <div
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-2xl
          bg-violet-100
        "
      >
        <Icon className="h-5 w-5 text-violet-700" />
      </div>

      <div className="min-w-0">
        <p
          className="
            text-sm
            font-semibold
            text-slate-800
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-relaxed
            text-slate-500
          "
        >
          {description}
        </p>
      </div>
    </div>

    {children}
  </div>
)

const AISettingsPanel = () => {

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [settings, setSettings] =
    useState({
      ActiveModel:
        AI_DEFAULTS.ActiveModel,

      Temperature:
        AI_DEFAULTS.Temperature,

      TopK_Tickets:
        AI_DEFAULTS.TopK_Tickets,

      ConfidenceThreshold:
        AI_DEFAULTS.ConfidenceThreshold,

      UseReformulator:
        AI_DEFAULTS.UseReformulator,

      UseReranker:
        AI_DEFAULTS.UseReranker,

      SystemPrompt:
        "You are a helpful AI support assistant.",
    })

  /* LOAD SETTINGS */
  useEffect(() => {

    const loadSettings =
      async () => {

        try {

          const response =
            await fetch(
              `${API_CONFIG.BASE_URL}/settings/ai`
            )

          if (!response.ok)
            return

          const data =
            await response.json()

          setSettings({
            ActiveModel:
              data.ActiveModel ??
              AI_DEFAULTS.ActiveModel,

            Temperature:
              Number(
                data.Temperature ??
                AI_DEFAULTS.Temperature
              ),

            TopK_Tickets:
              Number(
                data.TopK_Tickets ??
                AI_DEFAULTS.TopK_Tickets
              ),

            ConfidenceThreshold:
              Number(
                data.ConfidenceThreshold ??
                AI_DEFAULTS.ConfidenceThreshold
              ),

            UseReformulator:
              Boolean(
                data.UseReformulator
              ),

            UseReranker:
              Boolean(
                data.UseReranker
              ),

            SystemPrompt:
              data.SystemPrompt ??
              "You are a helpful AI support assistant.",
          })

        } catch (error) {

          console.error(
            "LOAD_AI_SETTINGS_ERROR",
            error
          )

        } finally {

          setLoading(false)
        }
      }

    loadSettings()

  }, [])

  /* UPDATE */
  const update = (
    key,
    value
  ) => {

    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  /* SAVE */
  const saveSettings =
    async () => {

      try {

        setSaving(true)

        const response =
          await fetch(
            `${API_CONFIG.BASE_URL}/settings/ai`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                settings
              ),
            }
          )

        if (!response.ok) {

          throw new Error(
            "Failed to save settings"
          )
        }

        console.log(
          "AI_SETTINGS_SAVED",
          settings
        )

      } catch (error) {

        console.error(
          "SAVE_AI_SETTINGS_ERROR",
          error
        )

      } finally {

        setSaving(false)
      }
    }

  if (loading) {

    return (
      <div
        className="
          flex
          items-center
          justify-center
          rounded-3xl
          border
          border-violet-100
          bg-white
          p-10
        "
      >
        <LoaderCircle
          className="
            h-8
            w-8
            animate-spin
            text-violet-600
          "
        />
      </div>
    )
  }

  return (
    <div
      className="
        flex
        flex-col
        gap-5
      "
    >
      {/* HEADER */}
      <div
        className="
          rounded-3xl
          border
          border-violet-100
          bg-white
          p-5
          shadow-sm
        "
      >
        <div className="flex items-center gap-4">
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-violet-100
            "
          >
            <SlidersHorizontal className="h-6 w-6 text-violet-700" />
          </div>

          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
                text-violet-500
              "
            >
              AI Configuration
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-bold
                text-slate-900
              "
            >
              AI Settings
            </h2>
          </div>
        </div>
      </div>

      {/* SETTINGS */}
      <div className="grid gap-4 xl:grid-cols-2">

        <Row
          icon={BrainCircuit}
          title="Temperature"
          description="Controls AI creativity."
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={
              settings.Temperature
            }
            onChange={(e) =>
              update(
                "Temperature",
                Number(e.target.value)
              )
            }
            className="
              w-full
              accent-violet-600
            "
          />

          <p
            className="
              mt-2
              text-right
              text-sm
              font-medium
              text-violet-700
            "
          >
            {
              settings.Temperature
            }
          </p>
        </Row>

        <Row
          icon={Layers3}
          title="Top K Tickets"
          description="Maximum retrieved tickets."
        >
          <input
            type="number"
            min="1"
            max="20"
            value={
              settings.TopK_Tickets
            }
            onChange={(e) =>
              update(
                "TopK_Tickets",
                Number(e.target.value)
              )
            }
            className="
              w-full
              rounded-2xl
              border
              border-violet-200
              bg-violet-50
              px-4
              py-3
              text-sm
              outline-none
              focus:border-violet-400
            "
          />
        </Row>

        <Row
          icon={ShieldCheck}
          title="Confidence Threshold"
          description="Minimum confidence before responding."
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={
              settings.ConfidenceThreshold
            }
            onChange={(e) =>
              update(
                "ConfidenceThreshold",
                Number(e.target.value)
              )
            }
            className="
              w-full
              accent-violet-600
            "
          />

          <p
            className="
              mt-2
              text-right
              text-sm
              font-medium
              text-violet-700
            "
          >
            {
              settings.ConfidenceThreshold
            }
          </p>
        </Row>

        <Row
          icon={Sparkles}
          title="Use Reformulator"
          description="Enable query reformulation."
        >
          <Toggle
            value={
              settings.UseReformulator
            }
            onChange={(value) =>
              update(
                "UseReformulator",
                value
              )
            }
          />
        </Row>

        <Row
          icon={FileSearch}
          title="Use Reranker"
          description="Enable reranking."
        >
          <Toggle
            value={
              settings.UseReranker
            }
            onChange={(value) =>
              update(
                "UseReranker",
                value
              )
            }
          />
        </Row>
      </div>

      {/* PROMPT */}
      <div
        className="
          rounded-3xl
          border
          border-violet-100
          bg-white
          p-5
          shadow-sm
        "
      >
        <p
          className="
            text-sm
            font-semibold
            text-slate-800
          "
        >
          System Prompt
        </p>

        <p
          className="
            mt-1
            mb-3
            text-xs
            text-slate-500
          "
        >
          Main instruction prompt used by the AI.
        </p>

        <textarea
          rows={6}
          value={
            settings.SystemPrompt
          }
          onChange={(e) =>
            update(
              "SystemPrompt",
              e.target.value
            )
          }
          className="
            w-full
            resize-none
            rounded-2xl
            border
            border-violet-200
            bg-violet-50/50
            px-4
            py-3
            text-sm
            leading-relaxed
            outline-none
            transition-all
            duration-200
            focus:border-violet-400
            focus:bg-white
          "
        />
      </div>

      {/* SAVE */}
      <button
        type="button"
        disabled={saving}
        onClick={saveSettings}
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
    </div>
  )
}

export default AISettingsPanel