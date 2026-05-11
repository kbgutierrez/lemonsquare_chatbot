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

    /* LOAD */
    const loadSettings =
      async () => {

        try {

          setLoading(true)

          const data =
            await aiSettingsService.getSettings()

          setSettings((prev) => ({
            ...prev,
            ...data,
          }))

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

    /* UPDATE */
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

    /* SELECT MODEL */
    const selectModel =
      (model) => {

        update(
          "ActiveModel",
          model.name
        )
      }

    /* ACTIVE MODEL */
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

    /* SAVE */
    const saveSettings =
      async () => {

        try {

          setSaving(true)

          setSuccess("")

          setError("")

          await aiSettingsService.updateSettings(
            settings
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