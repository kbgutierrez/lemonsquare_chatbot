import { useState, useCallback } from "react"
import {
  LoaderCircle,
  Save,
  RotateCcw,
} from "lucide-react"

import { useAISettings } from "./useAISettings.js"
import ModelSelector from "./ModelSelector.jsx"
import ToggleSwitch from "./ToggleSwitch.jsx"
import RangeSlider from "./RangeSlider.jsx"

import LoadingSpinner from "../../shared/components/LoadingSpinner.jsx"
import ErrorState from "../../shared/components/ErrorState.jsx"

const AISettingsPanel = () => {
  const {
    settings,
    loading,
    error,
    refresh,
    updateSettings,
    saving,
  } = useAISettings()

  const [localSettings, setLocalSettings] =
    useState(null)

  const getSettings = () =>
    localSettings || settings || {}

  const update = (key, value) => {
    setLocalSettings((prev) => ({
      ...(prev || settings || {}),
      [key]: value,
    }))
  }

  const handleSave = useCallback(async () => {
    if (!localSettings) {
      return
    }

    try {
      await updateSettings(localSettings)

      setLocalSettings(null)
    } catch (e) {
      alert(
        e.message || "Failed to save settings"
      )
    }
  }, [localSettings, updateSettings])

  const handleReset = useCallback(() => {
    if (
      window.confirm(
        "Reset all AI settings to defaults?"
      )
    ) {
      const defaults = {
        ActiveModel:
          "llama-3.3-70b-versatile",

        EmbeddingModel:
          "multilingual-e5-large",

        ReformulatorModel:
          "llama-3.1-8b-instruct",

        RerankerModel:
          "bge-reranker-large",

        Temperature: 0.7,

        TopK_Tickets: 5,

        ConfidenceThreshold: 0.75,

        UseReformulator: true,

        UseReranker: true,
      }

      setLocalSettings(defaults)
    }
  }, [])

  if (loading && !settings) {
    return (
      <LoadingSpinner
        label="Loading AI settings..."
        fullScreen
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load settings"
        message={error}
        onRetry={refresh}
      />
    )
  }

  const s = getSettings()

  return (
    <div className="w-full space-y-6">
      {/* Models */}
      <div className="card-surface p-5 md:p-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <span className="text-label">
                Models
              </span>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
                Model Configuration
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#74877f]">
                Configure the AI models used for
                response generation, embeddings,
                reformulation, and reranking.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={handleReset}
                className="btn-secondary h-[50px] px-4"
                title="Reset to defaults"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={handleSave}
                disabled={
                  !localSettings || saving
                }
                className="btn-primary h-[50px] px-5"
              >
                {saving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                Save Changes
              </button>
            </div>
          </div>

          {/* Models Grid */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <ModelSelector
              label="Active Model"
              description="Primary LLM for responses"
              value={s.ActiveModel || ""}
              onChange={(v) =>
                update("ActiveModel", v)
              }
            />

            <ModelSelector
              label="Embedding Model"
              description="Text embedding model"
              value={s.EmbeddingModel || ""}
              onChange={(v) =>
                update("EmbeddingModel", v)
              }
            />

            <ModelSelector
              label="Reformulator Model"
              description="Query reformulation model"
              value={s.ReformulatorModel || ""}
              onChange={(v) =>
                update(
                  "ReformulatorModel",
                  v
                )
              }
            />

            <ModelSelector
              label="Reranker Model"
              description="Context reranking model"
              value={s.RerankerModel || ""}
              onChange={(v) =>
                update("RerankerModel", v)
              }
            />
          </div>
        </div>
      </div>

      {/* Parameters */}
      <div className="card-surface p-5 md:p-6">
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-label">
              Parameters
            </span>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
              Inference Parameters
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#74877f]">
              Fine-tune retrieval quality,
              randomness, and confidence behavior
              for generated responses.
            </p>
          </div>

          <div className="flex flex-col gap-7">
            <RangeSlider
              label="Temperature"
              description="Controls randomness. Lower = more deterministic."
              value={s.Temperature ?? 0.7}
              min={0}
              max={2}
              step={0.01}
              displayValue={(
                s.Temperature ?? 0.7
              ).toFixed(2)}
              onChange={(v) =>
                update("Temperature", v)
              }
            />

            <RangeSlider
              label="Top K (Tickets)"
              description="Maximum tickets to retrieve per query."
              value={s.TopK_Tickets ?? 5}
              min={1}
              max={20}
              step={1}
              onChange={(v) =>
                update("TopK_Tickets", v)
              }
            />

            <RangeSlider
              label="Confidence Threshold"
              description="Minimum confidence score for responses."
              value={
                s.ConfidenceThreshold ?? 0.75
              }
              min={0}
              max={1}
              step={0.01}
              displayValue={`${Math.round(
                (s.ConfidenceThreshold ??
                  0.75) * 100
              )}%`}
              onChange={(v) =>
                update(
                  "ConfidenceThreshold",
                  v
                )
              }
              format={(v) =>
                `${Math.round(v * 100)}%`
              }
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="card-surface p-5 md:p-6">
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-label">
              Features
            </span>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
              Feature Toggles
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#74877f]">
              Enable or disable AI pipeline
              behaviors and retrieval enhancement
              features.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <ToggleSwitch
              label="Use Reformulator"
              description="Automatically reformulate user queries for better retrieval."
              checked={
                s.UseReformulator ?? true
              }
              onChange={(v) =>
                update(
                  "UseReformulator",
                  v
                )
              }
            />

            <ToggleSwitch
              label="Use Reranker"
              description="Rerank retrieved documents for better context selection."
              checked={s.UseReranker ?? true}
              onChange={(v) =>
                update("UseReranker", v)
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AISettingsPanel