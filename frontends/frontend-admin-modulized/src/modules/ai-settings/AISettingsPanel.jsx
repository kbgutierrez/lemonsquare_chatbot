import {
  LoaderCircle,
  Sparkles,
  BrainCircuit,
  SlidersHorizontal,
} from "lucide-react"

import { useAISettings } from "./useAISettings.js"
import { aiModels, llmOptions, embeddingModels, rerankerModels } from "./aiModels.js"

import SettingsSelect from "./SettingsSelect.jsx"
import SettingsInput from "./SettingsInput.jsx"
import SettingsTextarea from "./SettingsTextarea.jsx"
import SettingsToggle from "./SettingsToggle.jsx"
import SettingsActions from "./SettingsActions.jsx"

/* ========================================
   CONFIG CARD
======================================== */
const ConfigCard = ({ title, description, icon: Icon, children }) => {
  return (
    <div className="rounded-[30px] border border-[#26342f] bg-[#101715]/95 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-xl">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f5d547]/10">
          <Icon className="h-5 w-5 text-[#f5d547]" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-[#8ea59b]">{description}</p>
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
    selectModel,
    saveSettings,
  } = useAISettings()

  /* ========================================
     BIND HELPER — matches old frontend pattern
  ======================================== */
  const bind = (key) => (value) => update(key, value)

  /* ========================================
     HANDLE ACTIVE MODEL CHANGE (batch update)
  ======================================== */
  const handleActiveModelChange = (modelName) => {
    const model = aiModels.find((m) => m.name === modelName)
    if (model) {
      selectModel(model)
    }
  }

  /* ========================================
     LOADING STATE
  ======================================== */
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#f5d547]" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6">
      {/* AI CONFIG */}
      <ConfigCard
        title="AI Configuration"
        description="Manage retrieval, reranking, embeddings, and response behavior."
        icon={BrainCircuit}
      >
        <div className="grid gap-5 xl:grid-cols-2">
          <SettingsSelect
            label="Active Model"
            value={settings.ActiveModel}
            onChange={(e) => handleActiveModelChange(e.target.value)}
            options={llmOptions}
          />

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
            onChange={(e) => bind("ConfidenceThreshold")(Number(e.target.value))}
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
          <div className="flex items-center justify-between rounded-3xl border border-[#293731] bg-[#141d1a] p-5">
            <div>
              <p className="text-sm font-semibold text-white">Use Reformulator</p>
              <p className="mt-1 text-xs text-[#7e938a]">
                Enable intelligent query reformulation.
              </p>
            </div>

            <SettingsToggle
              value={settings.UseReformulator}
              onChange={bind("UseReformulator")}
            />
          </div>

          <div className="flex items-center justify-between rounded-3xl border border-[#293731] bg-[#141d1a] p-5">
            <div>
              <p className="text-sm font-semibold text-white">Use Reranker</p>
              <p className="mt-1 text-xs text-[#7e938a]">
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