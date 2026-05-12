import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

    /* ========================================
       STATE
    ======================================== */

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
       REFS
    ======================================== */

    const mountedRef =
      useRef(true)

    /* ========================================
       CLEANUP
    ======================================== */

    useEffect(() => {

      mountedRef.current =
        true

      return () => {

        mountedRef.current =
          false
      }

    }, [])

    /* ========================================
       LOAD SETTINGS
    ======================================== */

    const loadSettings =
      useCallback(
        async () => {

          try {

            setLoading(true)

            setError("")

            const data =
              await aiSettingsService.getSettings()

            if (
              !mountedRef.current
            ) {
              return
            }

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

            setSettings(
              cleaned
            )

          } catch (err) {

            console.error(
              "LOAD_SETTINGS_ERROR",
              err
            )

            if (
              mountedRef.current
            ) {

              setError(
                err.message ||
                "Failed to load settings."
              )
            }

          } finally {

            if (
              mountedRef.current
            ) {

              setLoading(
                false
              )
            }
          }
        },
        []
      )

    useEffect(() => {

      loadSettings()

    }, [loadSettings])

    /* ========================================
       UPDATE FIELD
    ======================================== */

    const update =
      useCallback(
        (
          key,
          value
        ) => {

          setSuccess("")
          setError("")

          setSettings((prev) => ({
            ...prev,
            [key]: value,
          }))
        },
        []
      )

    /* ========================================
       SELECT MODEL
    ======================================== */

    const selectModel =
      useCallback(
        (model) => {

          setSuccess("")
          setError("")

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
        },
        []
      )

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
      useCallback(
        async () => {

          if (
            saving
          ) {
            return
          }

          try {

            setSaving(true)

            setSuccess("")
            setError("")

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

            if (
              mountedRef.current
            ) {

              setSuccess(
                "AI settings updated successfully."
              )
            }

          } catch (err) {

            console.error(
              "SAVE_SETTINGS_ERROR",
              err
            )

            if (
              mountedRef.current
            ) {

              setError(
                err.message ||
                "Failed to save settings."
              )
            }

          } finally {

            if (
              mountedRef.current
            ) {

              setSaving(
                false
              )
            }
          }
        },
        [
          saving,
          settings,
        ]
      )

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