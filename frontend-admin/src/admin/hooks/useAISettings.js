import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  AI_DEFAULTS,
} from "../../shared/config/sqlVariables"

import {
  aiModels,
} from "../data/aiModels"

import aiSettingsService
  from "../services/aiSettingsService"

import useLiveQuery
  from "../../shared/hooks/useLiveQuery"

import {
  invalidateCache,
  setCachedData,
} from "../../shared/cache/liveQueryCache"

const CACHE_KEY =
  "ai_settings"

/* ========================================
   SAFE DEFAULT SETTINGS
======================================== */

const DEFAULT_SETTINGS = {
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

  ChatExtractionPrompt: "",
}

export const useAISettings =
  () => {

    /* ========================================
       REFS
    ======================================== */

    const mountedRef =
      useRef(true)

    /* ========================================
       LOCAL UI STATE
    ======================================== */

    const [saving, setSaving] =
      useState(false)

    const [success, setSuccess] =
      useState("")

    const [error, setError] =
      useState("")

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
       FETCHER
    ======================================== */

    const fetchSettings =
      useCallback(
        async () => {

          const response =
            await aiSettingsService.getSettings()

          const data =
            (
              response &&
              typeof response ===
                "object" &&
              !Array.isArray(
                response
              )
            )
              ? response
              : {}

          return {
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

            ChatExtractionPrompt:
              data.ChatExtractionPrompt || "",
          }
        },
        []
      )

    /* ========================================
       LIVE QUERY
    ======================================== */

    const {
      data: settings,

      loading,
      refresh,
    } = useLiveQuery({
      queryKey:
        CACHE_KEY,

      queryFn:
        fetchSettings,

      initialData:
        DEFAULT_SETTINGS,

      staleWhileRevalidate:
        true,
    })

    /* ========================================
       SAFE SETTINGS
    ======================================== */

    const safeSettings =
      useMemo(
        () => {

          if (
            !settings ||
            typeof settings !==
              "object" ||
            Array.isArray(
              settings
            )
          ) {

            return {
              ...DEFAULT_SETTINGS,
            }
          }

          return {
            ...DEFAULT_SETTINGS,
            ...settings,
          }
        },
        [settings]
      )

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

          const updated =
            {
              ...safeSettings,
              [key]: value,
            }

          setCachedData(
            CACHE_KEY,
            updated
          )
        },
        [safeSettings]
      )

    /* ========================================
       SELECT MODEL
    ======================================== */

    const selectModel =
      useCallback(
        (model) => {

          setSuccess("")
          setError("")

          const updated =
            {
              ...safeSettings,

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
            }

          setCachedData(
            CACHE_KEY,
            updated
          )
        },
        [safeSettings]
      )

    /* ========================================
       ACTIVE MODEL
    ======================================== */

    const activeModel =
      useMemo(() => {

        return aiModels.find(
          (model) =>
            model.name ===
            safeSettings.ActiveModel
        )

      }, [
        safeSettings.ActiveModel,
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

            if (
              !safeSettings.SystemPrompt?.trim()
            ) {

              setError(
                "System Prompt is required."
              )

              return
            }

            if (
              !safeSettings.ReformulatorPrompt?.trim()
            ) {

              setError(
                "Reformulator Prompt is required."
              )

              return
            }

            if (
              !safeSettings.AllowedCategories?.trim()
            ) {

              setError(
                "Allowed Categories is required."
              )

              return
            }

            const payload = {
              ActiveModel:
                safeSettings.ActiveModel,

              ReformulatorModel:
                safeSettings.ReformulatorModel,

              EmbeddingModel:
                safeSettings.EmbeddingModel,

              RerankerModel:
                safeSettings.RerankerModel,

              Temperature:
                Number(
                  safeSettings.Temperature
                ),

              TopK_Tickets:
                Number(
                  safeSettings.TopK_Tickets
                ),

              ConfidenceThreshold:
                Number(
                  safeSettings.ConfidenceThreshold
                ),

              UseReformulator:
                Boolean(
                  safeSettings.UseReformulator
                ),

              UseReranker:
                Boolean(
                  safeSettings.UseReranker
                ),

              SystemPrompt:
                safeSettings.SystemPrompt.trim(),

              ReformulatorPrompt:
                safeSettings.ReformulatorPrompt.trim(),

              AllowedCategories:
                safeSettings.AllowedCategories.trim(),

              ChatExtractionPrompt:
                safeSettings.ChatExtractionPrompt?.trim() || null,
            }

            console.log(
              "SAVE_SETTINGS_PAYLOAD",
              payload
            )

            await aiSettingsService.updateSettings(
              payload
            )

            invalidateCache(
              CACHE_KEY
            )

            await refresh()

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
          safeSettings,
          refresh,
        ]
      )

    return {
      loading,
      saving,

      success,
      error,

      settings:
        safeSettings,

      activeModel,

      update,

      selectModel,

      saveSettings,
    }
  }