import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  AI_DEFAULTS,
} from "../../config/sqlVariables"

import {
  aiModels,
} from "../data/aiModels"

import aiSettingsService
  from "../services/aiSettingsService"

export const useAISettings =
  () => {

    const [loading, setLoading] =
      useState(true)

    const [saving, setSaving] =
      useState(false)

    const [success, setSuccess] =
      useState("")

    const [error, setError] =
      useState("")

    const [settings, setSettings] =
      useState({
        ActiveModel:
          AI_DEFAULTS.ActiveModel,

        ReformulatorModel:
          AI_DEFAULTS.ReformulatorModel,

        EmbeddingModel:
          AI_DEFAULTS.EmbeddingModel,

        RerankerModel:
          AI_DEFAULTS.RerankerModel,

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

        SystemPrompt: "",

        ReformulatorPrompt: "",

        AllowedCategories: "",
      })

    /* ========================================
       LOAD SETTINGS
    ======================================== */

    const loadSettings =
      async () => {

        try {

          setLoading(true)

          const data =
            await aiSettingsService.getSettings()

          /* CLEAN PAYLOAD */
          const cleaned = {
            ActiveModel:
              data.ActiveModel ||
              AI_DEFAULTS.ActiveModel,

            ReformulatorModel:
              data.ReformulatorModel ||
              AI_DEFAULTS.ReformulatorModel,

            EmbeddingModel:
              data.EmbeddingModel ||
              AI_DEFAULTS.EmbeddingModel,

            RerankerModel:
              data.RerankerModel ||
              AI_DEFAULTS.RerankerModel,

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
              data.SystemPrompt || "",

            ReformulatorPrompt:
              data.ReformulatorPrompt || "",

            AllowedCategories:
              data.AllowedCategories || "",
          }

          setSettings(cleaned)

        } catch (err) {

          console.error(
            "LOAD_SETTINGS_ERROR",
            err
          )

          setError(
            "Failed to load settings."
          )

        } finally {

          setLoading(false)
        }
      }

    useEffect(() => {

      loadSettings()

    }, [])

    /* ========================================
       UPDATE FIELD
    ======================================== */

    const update =
      (
        key,
        value
      ) => {

        setSettings((prev) => ({
          ...prev,
          [key]: value,
        }))
      }

    /* ========================================
       SELECT MODEL
    ======================================== */

    const selectModel =
      (model) => {

        setSettings((prev) => ({
          ...prev,

          ActiveModel:
            model.ActiveModel,

          ReformulatorModel:
            model.ReformulatorModel,

          EmbeddingModel:
            model.EmbeddingModel,

          RerankerModel:
            model.RerankerModel,

          Temperature:
            model.RecommendedTemperature,
        }))
      }

    /* ========================================
       ACTIVE MODEL
    ======================================== */

    const activeModel =
      useMemo(() => {

        return aiModels.find(
          (model) =>
            model.name ===
            settings.ActiveModel
        )

      }, [
        settings.ActiveModel,
      ])

    /* ========================================
       SAVE SETTINGS
    ======================================== */

    const saveSettings =
      async () => {

        try {

          setSaving(true)

          setSuccess("")

          setError("")

          /* STRICT PAYLOAD */
          const payload = {
            ActiveModel:
              settings.ActiveModel,

            ReformulatorModel:
              settings.ReformulatorModel,

            EmbeddingModel:
              settings.EmbeddingModel,

            RerankerModel:
              settings.RerankerModel,

            Temperature:
              Number(
                settings.Temperature
              ),

            TopK_Tickets:
              Number(
                settings.TopK_Tickets
              ),

            ConfidenceThreshold:
              Number(
                settings.ConfidenceThreshold
              ),

            UseReformulator:
              Boolean(
                settings.UseReformulator
              ),

            UseReranker:
              Boolean(
                settings.UseReranker
              ),

            SystemPrompt:
              settings.SystemPrompt || "",

            ReformulatorPrompt:
              settings.ReformulatorPrompt || "",

            AllowedCategories:
              settings.AllowedCategories || "",
          }

          console.log(
            "SAVE_SETTINGS_PAYLOAD",
            payload
          )

          await aiSettingsService.updateSettings(
            payload
          )

          setSuccess(
            "AI settings updated successfully."
          )

        } catch (err) {

          console.error(
            "SAVE_SETTINGS_ERROR",
            err
          )

          setError(
            "Failed to save settings."
          )

        } finally {

          setSaving(false)
        }
      }

    return {
      loading,
      saving,

      success,
      error,

      settings,

      activeModel,

      update,

      selectModel,

      saveSettings,
    }
  }