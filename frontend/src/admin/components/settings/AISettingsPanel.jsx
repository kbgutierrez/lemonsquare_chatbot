import {
  LoaderCircle,
  Sparkles,
  BrainCircuit,
  SlidersHorizontal,
} from "lucide-react"

import {
  useAISettings,
} from "../../hooks/useAISettings"

import {
  llmOptions,
  embeddingModels,
  rerankerModels,
} from "../../data/aiModels"

import SettingsInput
  from "./SettingsInput"

import SettingsSelect
  from "./SettingsSelect"

import SettingsToggle
  from "./SettingsToggle"

import SettingsTextarea
  from "./SettingsTextarea"

import SettingsActions
  from "./SettingsActions"

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
        border-[#26342f]

        bg-[#101715]/95

        p-6

        shadow-[0_0_0_1px_rgba(255,255,255,0.02)]

        backdrop-blur-xl
      "
    >
      {/* HEADER */}
      <div
        className="
          mb-6

          flex
          items-start
          gap-4
        "
      >
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center

            rounded-2xl

            bg-[#f5d547]/10
          "
        >
          <Icon
            className="
              h-5
              w-5

              text-[#f5d547]
            "
          />
        </div>

        <div>
          <h3
            className="
              text-lg
              font-semibold

              text-white
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-1

              text-sm

              text-[#8ea59b]
            "
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

  if (loading) {

    return (
      <div
        className="
          flex
          items-center
          justify-center

          rounded-[32px]

          border
          border-[#26342f]

          bg-[#101715]/95

          p-16
        "
      >
        <LoaderCircle
          className="
            h-8
            w-8
            animate-spin

            text-[#f5d547]
          "
        />
      </div>
    )
  }

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
      {/* AI CONFIG */}
      <ConfigCard
        title="AI Configuration"
        description="Manage retrieval, reranking, embeddings, and response behavior."

        icon={BrainCircuit}
      >
        <div
          className="
            grid
            gap-5

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

            warning={`
Changing the embedding model may invalidate
existing vector embeddings and retrieval results.
A full document and ticket re-index may be required.
`}

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

          {/* TEMP */}
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
        </div>
      </ConfigCard>

      {/* TOGGLES */}
      <ConfigCard
        title="Retrieval Controls"
        description="Enable or disable advanced AI processing modules."

        icon={SlidersHorizontal}
      >
        <div
          className="
            grid
            gap-5

            xl:grid-cols-2
          "
        >
          {/* REFORMULATOR */}
          <div
            className="
              flex
              items-center
              justify-between

              rounded-3xl

              border
              border-[#293731]

              bg-[#141d1a]

              p-5
            "
          >
            <div>
              <p
                className="
                  text-sm
                  font-semibold

                  text-white
                "
              >
                Use Reformulator
              </p>

              <p
                className="
                  mt-1

                  text-xs

                  text-[#7e938a]
                "
              >
                Enable intelligent
                query reformulation.
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

          {/* RERANKER */}
          <div
            className="
              flex
              items-center
              justify-between

              rounded-3xl

              border
              border-[#293731]

              bg-[#141d1a]

              p-5
            "
          >
            <div>
              <p
                className="
                  text-sm
                  font-semibold

                  text-white
                "
              >
                Use Reranker
              </p>

              <p
                className="
                  mt-1

                  text-xs

                  text-[#7e938a]
                "
              >
                Improve response
                relevance scoring.
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
      </ConfigCard>

      {/* PROMPTS */}
      <ConfigCard
        title="Prompt Engineering"
        description="Configure system prompts and retrieval behavior."

        icon={Sparkles}
      >
        <div className="space-y-5">

          {/* SYSTEM PROMPT */}
          <SettingsTextarea
            rows={7}

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

          {/* REFORMULATOR PROMPT */}
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

          {/* CHAT EXTRACTION PROMPT */}
          <SettingsTextarea
            rows={5}

            label="Chat Extraction Prompt"

            placeholder="
Extract concise issue details, intent,
priority, affected systems, and important
technical context from user conversations.
            "

            value={
              settings.ChatExtractionPrompt
            }

            onChange={(e) =>
              update(
                "ChatExtractionPrompt",
                e.target.value
              )
            }
          />

          {/* ALLOWED CATEGORIES */}
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