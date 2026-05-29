import { LoaderCircle, Sparkles, BrainCircuit, SlidersHorizontal, Moon, Sun } from "lucide-react"
import { useAISettings } from "../../hooks/useAISettings"
import { llmOptions, embeddingModels, rerankerModels } from "../../data/aiModels"
import { useAdminTheme } from "../../../shared/hooks/useAdminTheme"
import SettingsInput from "./SettingsInput"
import SettingsSelect from "./SettingsSelect"
import SettingsToggle from "./SettingsToggle"
import SettingsTextarea from "./SettingsTextarea"
import SettingsActions from "./SettingsActions"

/* ========================================
   SECTION HEADER
======================================== */
const SectionHeader = ({ title, description }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
    </div>
  )
}

/* ========================================
   CONFIG ROW
======================================== */
const ConfigRow = ({ children }) => {
  return (
    <div className="flex items-center justify-between border-b theme-border py-4 last:border-b-0">
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
    llmOptions,
    update,
    saveSettings,
    loadFactoryDefaults,
  } = useAISettings()

  const { theme, isDark, toggleTheme } = useAdminTheme()

  const bind = (key) => (value) => update(key, value)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoaderCircle className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[1700px] flex-col gap-8 overflow-y-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* THEME SETTINGS */}
      <div>
        <SectionHeader
          title="Appearance"
          description="Control the admin dashboard visual theme."
        />
        <ConfigRow>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Current Theme</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {isDark ? "Dark mode is currently active." : "Light mode is currently active."}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#111917] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
        </ConfigRow>
      </div>

      {/* PRIMARY LLM */}
      <div>
        <SectionHeader
          title="Primary LLM"
          description="The main model used for answer generation and chat responses."
        />
        <div className="grid gap-5 xl:grid-cols-2">
          <SettingsSelect
            label="Conversation Resolution Model"
            value={settings.ConversationResolutionModel}
            onChange={(e) => bind("ConversationResolutionModel")(e.target.value)}
            options={[
              {
                value: "",
                label: "Use Primary LLM",
              },
              ...llmOptions,
            ]}
          />
        </div>
      </div>

      {/* AI CONFIG */}
      <div>
        <SectionHeader
          title="AI Configuration"
          description="Manage retrieval, reranking, embeddings, and response behavior."
        />
        <div className="grid gap-5 xl:grid-cols-2">
          <SettingsSelect
            label="Chat Extraction Model"
            value={settings.ChatExtractionModel}
            onChange={(e) =>
              bind("ChatExtractionModel")(
                e.target.value
              )
            }
            options={[
              {
                value: "",
                label: "Use Primary LLM",
              },
              ...llmOptions,
            ]}
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
      </div>

      {/* PIPELINE MODELS */}
      <div>
        <SectionHeader
          title="Pipeline Models"
          description="Dedicated LLMs for specific pipeline stages. Leave empty to use the Primary LLM as fallback."
        />
        <div className="grid gap-5 xl:grid-cols-2">
          <SettingsSelect
            label="Escalation Draft Model"
            value={settings.EscalationDraftModel}
            onChange={(e) => bind("EscalationDraftModel")(e.target.value)}
            options={[{ value: "", label: "Use Primary LLM" }, ...llmOptions]}
          />

          <SettingsSelect
            label="Routing Model"
            value={settings.RoutingModel}
            onChange={(e) => bind("RoutingModel")(e.target.value)}
            options={[{ value: "", label: "Use Primary LLM" }, ...llmOptions]}
          />

          <SettingsSelect
            label="Document Classifier Model"
            value={settings.DocumentClassifierModel}
            onChange={(e) => bind("DocumentClassifierModel")(e.target.value)}
            options={[{ value: "", label: "Use Primary LLM" }, ...llmOptions]}
          />

          <SettingsSelect
            label="Conversation Resolution Model"
            value={settings.ConversationResolutionModel}
            onChange={(e) => bind("ConversationResolutionModel")(e.target.value)}
            options={[{ value: "", label: "Use Primary LLM" }, ...llmOptions]}
          />
        </div>
      </div>

      {/* RETRIEVAL CONTROLS */}
      <div>
        <SectionHeader
          title="Retrieval Controls"
          description="Enable or disable advanced AI processing modules."
        />
        <div className="grid gap-0 xl:grid-cols-2">
          <ConfigRow>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Use Reformulator</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Enable intelligent query reformulation.
              </p>
            </div>
            <SettingsToggle
              value={settings.UseReformulator}
              onChange={bind("UseReformulator")}
            />
          </ConfigRow>

          <ConfigRow>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Use Reranker</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Improve response relevance scoring.
              </p>
            </div>
            <SettingsToggle
              value={settings.UseReranker}
              onChange={bind("UseReranker")}
            />
          </ConfigRow>
        </div>
      </div>

      {/* PROMPTS */}
      <div>
        <SectionHeader
          title="Prompt Engineering"
          description="Configure system prompts and retrieval behavior."
        />
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
      </div>

      {/* PIPELINE PROMPTS */}
      <div>
        <SectionHeader
          title="Pipeline Prompts"
          description="Stage-specific prompts for escalation drafting, ticket routing, document classification, and conversation resolution."
        />
        <div className="space-y-5">
          <SettingsTextarea
            rows={5}
            label="Escalation Draft Prompt"
            placeholder="Generate a structured escalation draft including severity, affected systems, and recommended priority."
            value={settings.EscalationDraftPrompt}
            onChange={(e) => bind("EscalationDraftPrompt")(e.target.value)}
          />

          <SettingsTextarea
            rows={5}
            label="Routing Prompt"
            placeholder="Classify the ticket into the most appropriate department and subcategory based on the issue description."
            value={settings.RoutingPrompt}
            onChange={(e) => bind("RoutingPrompt")(e.target.value)}
          />

          <SettingsTextarea
            rows={5}
            label="Document Classifier Prompt"
            placeholder="Categorize the uploaded document into one of the allowed knowledge categories."
            value={settings.DocumentClassifierPrompt}
            onChange={(e) => bind("DocumentClassifierPrompt")(e.target.value)}
          />

          <SettingsTextarea
            rows={5}
            label="Conversation Resolution Prompt"
            placeholder="Determine whether the conversation has reached a satisfactory resolution and summarize the outcome."
            value={settings.ConversationResolutionPrompt}
            onChange={(e) => bind("ConversationResolutionPrompt")(e.target.value)}
          />
        </div>
      </div>

      {/* ACTIONS */}
      <SettingsActions
        saving={saving}
        success={success}
        error={error}
        onSave={saveSettings}
        onLoadDefaults={loadFactoryDefaults}
      />
    </div>
  )
}

export default AISettingsPanel