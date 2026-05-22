import {
  LoaderCircle,
  Sparkles,
  BrainCircuit,
  SlidersHorizontal,
  Moon,
  Sun,
} from "lucide-react"

import { useAISettings } from "../../hooks/useAISettings"

import {
  llmOptions,
  embeddingModels,
  rerankerModels,
} from "../../data/aiModels"

import {
  useAdminTheme,
} from "../../../shared/hooks/useAdminTheme"

import SettingsInput from "./SettingsInput"
import SettingsSelect from "./SettingsSelect"
import SettingsToggle from "./SettingsToggle"
import SettingsTextarea from "./SettingsTextarea"
import SettingsActions from "./SettingsActions"

/* ========================================
   CONFIG CARD
======================================== */
const ConfigCard = ({
  title,
  description,
  icon: Icon,
  children,
}) => {
  return (
    <div
      className="
        rounded-[30px]
        border
        p-6
        shadow-[0_0_0_1px_rgba(255,255,255,0.02)]
        backdrop-blur-xl
      "
      style={{
        borderColor: "var(--border)",
        background: "var(--glass-bg)",
      }}
    >
      <div className="mb-6 flex items-start gap-4">
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
          "
          style={{
            background: "rgba(245, 213, 71, 0.10)",
          }}
        >
          <Icon
            className="h-5 w-5"
            style={{
              color: "var(--accent)",
            }}
          />
        </div>

        <div>
          <h3
            className="text-lg font-semibold"
            style={{
              color: "var(--text-primary)",
            }}
          >
            {title}
          </h3>

          <p
            className="mt-1 text-sm"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            {description}
          </p>
        </div>
      </div>

      {children}
    </div>
  )
}

const AISettingsPanel = () => {
  const {
    loading,
    saving,
    success,
    error,
    settings,
    update,
    saveSettings,
  } = useAISettings()

  const {
    theme,
    isDark,
    toggleTheme,
  } = useAdminTheme()

  /* ========================================
     LOADING STATE
  ======================================== */
  if (loading) {
    return (
      <div
        className="
          flex
          items-center
          justify-center
          rounded-[32px]
          p-16
        "
        style={{
          border: "1px solid var(--border)",
          background: "var(--glass-bg)",
        }}
      >
        <LoaderCircle
          className="h-8 w-8 animate-spin"
          style={{
            color: "var(--accent)",
          }}
        />
      </div>
    )
  }

  /* ========================================
     SAFE UPDATE HELPER
  ======================================== */
  const bind = (key) => (value) => update(key, value)

  return (
    <div
      className="
        mx-auto
        flex
        h-full
        w-full
        max-w-[1700px]
        flex-col
        gap-6
        overflow-y-auto
        pr-2
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      {/* THEME SETTINGS */}
      <ConfigCard
        title="Appearance"
        description="Control the admin dashboard visual theme."
        icon={isDark ? Moon : Sun}
      >
        <div
          className="
            flex
            flex-col
            gap-4
            rounded-3xl
            p-5
            md:flex-row
            md:items-center
            md:justify-between
          "
          style={{
            border: "1px solid var(--border)",
            background: "var(--panel-light)",
          }}
        >
          <div>
            <p
              className="text-sm font-semibold"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Current Theme
            </p>

            <p
              className="mt-1 text-xs"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {isDark
                ? "Dark mode is currently active."
                : "Light mode is currently active."}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              px-5
              py-3
              text-sm
              font-semibold
              transition-all
              duration-300
              hover:scale-[1.02]
              active:scale-[0.98]
            "
            style={{
              background: "var(--accent)",
              color: "#111917",
            }}
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4" />
                Switch to Light Mode
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                Switch to Dark Mode
              </>
            )}
          </button>
        </div>
      </ConfigCard>

      {/* AI CONFIG */}
      <ConfigCard
        title="AI Configuration"
        description="Manage retrieval, reranking, embeddings, and response behavior."
        icon={BrainCircuit}
      >
        <div className="grid gap-5 xl:grid-cols-2">
          <SettingsSelect
            label="Reformulator Model"
            value={settings.ReformulatorModel}
            onChange={(e) => bind("ReformulatorModel")(e.target.value)}
            options={llmOptions}
          />

          <SettingsSelect
            label="Embedding Model"
            warning="Changing the embedding model may invalidate existing vector embeddings and retrieval results. A full re-index may be required."
            value={settings.EmbeddingModel}
            onChange={(e) => bind("EmbeddingModel")(e.target.value)}
            options={embeddingModels}
          />

          <SettingsSelect
            label="Reranker Model"
            value={settings.RerankerModel}
            onChange={(e) => bind("RerankerModel")(e.target.value)}
            options={rerankerModels}
          />

          <SettingsInput
            type="number"
            step="0.1"
            min="0"
            max="2"
            label="Temperature"
            value={settings.Temperature}
            onChange={(e) => bind("Temperature")(Number(e.target.value))}
          />

          <SettingsInput
            type="number"
            min="1"
            max="50"
            label="Top K Tickets"
            value={settings.TopK_Tickets}
            onChange={(e) => bind("TopK_Tickets")(Number(e.target.value))}
          />

          <SettingsInput
            type="number"
            step="0.01"
            min="0"
            max="1"
            label="Confidence Threshold"
            value={settings.ConfidenceThreshold}
            onChange={(e) =>
              bind("ConfidenceThreshold")(Number(e.target.value))
            }
          />
        </div>
      </ConfigCard>

      {/* RETRIEVAL CONTROLS */}
      <ConfigCard
        title="Retrieval Controls"
        description="Enable or disable advanced AI processing modules."
        icon={SlidersHorizontal}
      >
        <div className="grid gap-5 xl:grid-cols-2">
          <div
            className="flex items-center justify-between rounded-3xl p-5"
            style={{
              border: "1px solid var(--border)",
              background: "var(--panel-light)",
            }}
          >
            <div>
              <p
                className="text-sm font-semibold"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                Use Reformulator
              </p>

              <p
                className="mt-1 text-xs"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                Enable intelligent query reformulation.
              </p>
            </div>

            <SettingsToggle
              value={settings.UseReformulator}
              onChange={bind("UseReformulator")}
            />
          </div>

          <div
            className="flex items-center justify-between rounded-3xl p-5"
            style={{
              border: "1px solid var(--border)",
              background: "var(--panel-light)",
            }}
          >
            <div>
              <p
                className="text-sm font-semibold"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                Use Reranker
              </p>

              <p
                className="mt-1 text-xs"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                Improve response relevance scoring.
              </p>
            </div>

            <SettingsToggle
              value={settings.UseReranker}
              onChange={bind("UseReranker")}
            />
          </div>
        </div>
      </ConfigCard>

      {/* PROMPTS */}
      <ConfigCard
        title="Prompt Engineering"
        description="Configure system prompts and retrieval behavior."
        icon={Sparkles}
      >
        <div className="space-y-5">
          <SettingsTextarea
            rows={7}
            label="System Prompt"
            value={settings.SystemPrompt}
            onChange={(e) => bind("SystemPrompt")(e.target.value)}
          />

          <SettingsTextarea
            rows={5}
            label="Reformulator Prompt"
            value={settings.ReformulatorPrompt}
            onChange={(e) => bind("ReformulatorPrompt")(e.target.value)}
          />

          <SettingsTextarea
            rows={5}
            label="Chat Extraction Prompt"
            placeholder="Extract concise issue details, intent, priority, affected systems, and important technical context from user conversations."
            value={settings.ChatExtractionPrompt}
            onChange={(e) => bind("ChatExtractionPrompt")(e.target.value)}
          />

          <SettingsTextarea
            rows={4}
            label="Allowed Categories"
            value={settings.AllowedCategories}
            onChange={(e) => bind("AllowedCategories")(e.target.value)}
          />
        </div>
      </ConfigCard>

      {/* ACTIONS */}
      <SettingsActions
        saving={saving}
        success={success}
        error={error}
        onSave={saveSettings}
      />
    </div>
  )
}

export default AISettingsPanel