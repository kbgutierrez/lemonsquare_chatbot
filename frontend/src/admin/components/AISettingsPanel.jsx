import {
  LoaderCircle,
} from "lucide-react"

import AIModelDropdown
  from "./AIModelDropdown"

import {
  useAISettings,
} from "../hooks/useAISettings"

import {
  llmOptions,
  embeddingModels,
  rerankerModels,
} from "../data/aiModels"

import SettingsHeader
  from "./settings/SettingsHeader"

import SettingsInput
  from "./settings/SettingsInput"

import SettingsSelect
  from "./settings/SettingsSelect"

import SettingsToggle
  from "./settings/SettingsToggle"

import SettingsTextarea
  from "./settings/SettingsTextarea"

import SettingsStatus
  from "./settings/SettingsStatus"

import SettingsActions
  from "./settings/SettingsActions"

import ModelInfoCard
  from "./settings/ModelInfoCard"

const AISettingsPanel = () => {

  const {
    loading,
    saving,

    success,
    error,

    settings,

    activeModel,

    update,

    selectModel,

    saveSettings,
  } = useAISettings()

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
    <div className="space-y-5">


      {/* HEADER */}
      <SettingsHeader
        activeModel={
          settings.ActiveModel
        }
      />

      {/* MODEL INFO */}
      <ModelInfoCard
        model={activeModel}
      />

      {/* STATUS */}
      <SettingsStatus
        success={success}
        error={error}
      />

      {/* SETTINGS */}
      <div
        className="
          grid
          gap-4

          xl:grid-cols-2
        "
      >
        {/* REFORMULATOR */}
        <SettingsSelect
          label="Reformulator Model"
          value={
            settings.ReformulatorModel
          }
          onChange={(e) =>
            update(
              "ReformulatorModel",
              e.target.value
            )
          }
          options={llmOptions}
        />

        {/* EMBEDDING */}
        <SettingsSelect
          label="Embedding Model"
          value={
            settings.EmbeddingModel
          }
          onChange={(e) =>
            update(
              "EmbeddingModel",
              e.target.value
            )
          }
          options={
            embeddingModels
          }
        />

        {/* RERANKER */}
        <SettingsSelect
          label="Reranker Model"
          value={
            settings.RerankerModel
          }
          onChange={(e) =>
            update(
              "RerankerModel",
              e.target.value
            )
          }
          options={
            rerankerModels
          }
        />

        {/* TEMPERATURE */}
        <SettingsInput
          type="number"
          step="0.1"
          min="0"
          max="2"
          label="Temperature"
          value={
            settings.Temperature
          }
          onChange={(e) =>
            update(
              "Temperature",
              Number(
                e.target.value
              )
            )
          }
        />

        {/* TOP K */}
        <SettingsInput
          type="number"
          min="1"
          max="50"
          label="Top K Tickets"
          value={
            settings.TopK_Tickets
          }
          onChange={(e) =>
            update(
              "TopK_Tickets",
              Number(
                e.target.value
              )
            )
          }
        />

        {/* CONFIDENCE */}
        <SettingsInput
          type="number"
          step="0.01"
          min="0"
          max="1"
          label="Confidence Threshold"
          value={
            settings.ConfidenceThreshold
          }
          onChange={(e) =>
            update(
              "ConfidenceThreshold",
              Number(
                e.target.value
              )
            )
          }
        />

        {/* REFORMULATOR TOGGLE */}
        <div
          className="
            flex
            items-center
            justify-between

            rounded-2xl

            border
            border-violet-100

            bg-white

            p-4
          "
        >
          <div>
            <p className="font-semibold text-slate-800">
              Use Reformulator
            </p>

            <p className="text-xs text-slate-500">
              Enable query reformulation
            </p>
          </div>

          <SettingsToggle
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
        </div>

        {/* RERANKER TOGGLE */}
        <div
          className="
            flex
            items-center
            justify-between

            rounded-2xl

            border
            border-violet-100

            bg-white

            p-4
          "
        >
          <div>
            <p className="font-semibold text-slate-800">
              Use Reranker
            </p>

            <p className="text-xs text-slate-500">
              Enable AI reranking
            </p>
          </div>

          <SettingsToggle
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
        </div>
      </div>

      {/* PROMPTS */}
      <div
        className="
          rounded-3xl

          border
          border-violet-100

          bg-white

          p-5

          shadow-sm

          space-y-5
        "
      >
        <SettingsTextarea
          rows={6}
          label="System Prompt"
          value={
            settings.SystemPrompt
          }
          onChange={(e) =>
            update(
              "SystemPrompt",
              e.target.value
            )
          }
        />

        <SettingsTextarea
          rows={5}
          label="Reformulator Prompt"
          value={
            settings.ReformulatorPrompt
          }
          onChange={(e) =>
            update(
              "ReformulatorPrompt",
              e.target.value
            )
          }
        />

        <SettingsTextarea
          rows={4}
          label="Allowed Categories"
          value={
            settings.AllowedCategories
          }
          onChange={(e) =>
            update(
              "AllowedCategories",
              e.target.value
            )
          }
        />
      </div>

      {/* ACTIONS */}
      <SettingsActions
        saving={saving}
        onSave={saveSettings}
      />
    </div>
  )
}

export default AISettingsPanel