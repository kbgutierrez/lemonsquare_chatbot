import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { AI_DEFAULTS } from "../../shared/config/sqlVariables"
import { aiModels, llmOptions as initialLlmOptions } from "../data/aiModels"
import aiSettingsService from "../services/aiSettingsService"
import modelsService from "../services/modelsService"

import useLiveQuery from "../../shared/hooks/useLiveQuery"
import {
  invalidateCache,
  setCachedData,
} from "../../shared/cache/liveQueryCache"

const CACHE_KEY = "ai_settings"

/* ========================================
   DEFAULT SETTINGS (STABLE)
======================================== */
const DEFAULT_SETTINGS = Object.freeze({
  ActiveModel: AI_DEFAULTS.ActiveModel,
  ReformulatorModel: AI_DEFAULTS.ReformulatorModel,
  EmbeddingModel: AI_DEFAULTS.EmbeddingModel,
  RerankerModel: AI_DEFAULTS.RerankerModel,

  Temperature: AI_DEFAULTS.Temperature,
  TopK_Tickets: AI_DEFAULTS.TopK_Tickets,
  ConfidenceThreshold: AI_DEFAULTS.ConfidenceThreshold,

  UseReformulator: AI_DEFAULTS.UseReformulator,
  UseReranker: AI_DEFAULTS.UseReranker,

  SystemPrompt: "",
  ReformulatorPrompt: "",
  AllowedCategories: "",

  ChatExtractionModel: "",
  ChatExtractionPrompt: "",

  /* ---- NEW: Pipeline model/prompt fields ---- */
  EscalationDraftModel: "",
  EscalationDraftPrompt: "",
  RoutingModel: "",
  RoutingPrompt: "",
  DocumentClassifierModel: "",
  DocumentClassifierPrompt: "",
  ConversationResolutionModel: "",
  ConversationResolutionPrompt: "",

  SettingID: null,
  UpdatedBy: null,
  UpdatedByUsername: null,
  IsActive: false,
})

/* ========================================
   SAFE NORMALIZER
======================================== */
const normalizeSettings = (data) => {
  const d =
    data &&
    typeof data === "object" &&
    !Array.isArray(data)
      ? data
      : {}

  return {
    ActiveModel: d.ActiveModel || AI_DEFAULTS.ActiveModel,
    ReformulatorModel: d.ReformulatorModel || AI_DEFAULTS.ReformulatorModel,
    EmbeddingModel: d.EmbeddingModel || AI_DEFAULTS.EmbeddingModel,
    RerankerModel: d.RerankerModel || AI_DEFAULTS.RerankerModel,

    Temperature: Number(d.Temperature ?? AI_DEFAULTS.Temperature),
    TopK_Tickets: Number(d.TopK_Tickets ?? AI_DEFAULTS.TopK_Tickets),
    ConfidenceThreshold: Number(
      d.ConfidenceThreshold ?? AI_DEFAULTS.ConfidenceThreshold
    ),

    UseReformulator: Boolean(d.UseReformulator),
    UseReranker: Boolean(d.UseReranker),

    SystemPrompt: d.SystemPrompt || "",
    ReformulatorPrompt: d.ReformulatorPrompt || "",
    AllowedCategories: d.AllowedCategories || "",

    ChatExtractionModel:
      d.ChatExtractionModel || "",

    ChatExtractionPrompt:
      d.ChatExtractionPrompt || "",

    /* ---- NEW: Pipeline model/prompt fields ---- */
    EscalationDraftModel: d.EscalationDraftModel || "",
    EscalationDraftPrompt: d.EscalationDraftPrompt || "",
    RoutingModel: d.RoutingModel || "",
    RoutingPrompt: d.RoutingPrompt || "",
    DocumentClassifierModel: d.DocumentClassifierModel || "",
    DocumentClassifierPrompt: d.DocumentClassifierPrompt || "",
    ConversationResolutionModel: d.ConversationResolutionModel || "",
    ConversationResolutionPrompt: d.ConversationResolutionPrompt || "",

    SettingID: d.SettingID ?? null,
    UpdatedBy: d.UpdatedBy ?? null,
    UpdatedByUsername: d.UpdatedByUsername ?? null,
    IsActive: Boolean(d.IsActive),
  }
}

export const useAISettings = () => {
  const mountedRef = useRef(true)

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [llmOptions, setLlmOptions] = useState(initialLlmOptions)

  /* ========================================
     FETCH GROQ MODELS
  ======================================== */
  useEffect(() => {
    const loadModels = async () => {
      const models = await modelsService.getGroqModels()
      if (models && models.length > 0) {
        const options = models.map((m) => ({
          label: m.name || m.id,
          value: m.id,
        }))
        setLlmOptions(options)
      }
    }
    loadModels()
  }, [])

  /* ========================================
     LIFECYCLE SAFETY
  ======================================== */
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  /* ========================================
     FETCH SETTINGS
  ======================================== */
  const fetchSettings = useCallback(async () => {
    const response = await aiSettingsService.getSettings()
    return normalizeSettings(response)
  }, [])

  /* ========================================
     LIVE QUERY
  ======================================== */
  const {
    data: settings,
    loading,
    refresh,
  } = useLiveQuery({
    queryKey: CACHE_KEY,
    queryFn: fetchSettings,
    initialData: DEFAULT_SETTINGS,
    staleWhileRevalidate: true,
  })

  /* ========================================
     SAFE SETTINGS
  ======================================== */
  const safeSettings = useMemo(() => {
    return normalizeSettings(settings)
  }, [settings])

  /* ========================================
     UPDATE FIELD (SAFE)
  ======================================== */
  const update = useCallback(
    (key, value) => {
      setSuccess("")
      setError("")

      const updated = {
        ...safeSettings,
        [key]: value,
      }

      setCachedData(CACHE_KEY, normalizeSettings(updated))
    },
    [safeSettings]
  )

  /* ========================================
     SELECT MODEL (REFACTORED)
  ======================================== */
  const selectModel = useCallback(
    (model) => {
      setSuccess("")
      setError("")

      const updated = {
        ...safeSettings,
        ActiveModel: model.ActiveModel,
        ReformulatorModel: model.ReformulatorModel,
        EmbeddingModel: model.EmbeddingModel,
        RerankerModel: model.RerankerModel,
        Temperature: model.RecommendedTemperature,
      }

      setCachedData(CACHE_KEY, normalizeSettings(updated))
    },
    [safeSettings]
  )

  /* ========================================
     ACTIVE MODEL
  ======================================== */
  const activeModel = useMemo(() => {
    return aiModels.find(
      (model) => model.name === safeSettings.ActiveModel
    )
  }, [safeSettings.ActiveModel])

  /* ========================================
     SAVE SETTINGS
  ======================================== */
  const saveSettings = useCallback(async () => {
    if (saving) return

    try {
      setSaving(true)
      setSuccess("")
      setError("")

      if (!safeSettings.SystemPrompt?.trim()) {
        setError("System Prompt is required.")
        return
      }

      if (!safeSettings.ReformulatorPrompt?.trim()) {
        setError("Reformulator Prompt is required.")
        return
      }

      if (!safeSettings.AllowedCategories?.trim()) {
        setError("Allowed Categories is required.")
        return
      }

      const payload = normalizeSettings({
        ...safeSettings,
        SystemPrompt: safeSettings.SystemPrompt.trim(),
        ReformulatorPrompt: safeSettings.ReformulatorPrompt.trim(),
        AllowedCategories: safeSettings.AllowedCategories.trim(),
        ChatExtractionModel:
          safeSettings.ChatExtractionModel?.trim() || null,

        ChatExtractionPrompt:
          safeSettings.ChatExtractionPrompt?.trim() || null,

        /* ---- NEW: Pipeline model/prompt fields ---- */
        EscalationDraftModel:
          safeSettings.EscalationDraftModel?.trim() || null,
        EscalationDraftPrompt:
          safeSettings.EscalationDraftPrompt?.trim() || null,
        RoutingModel:
          safeSettings.RoutingModel?.trim() || null,
        RoutingPrompt:
          safeSettings.RoutingPrompt?.trim() || null,
        DocumentClassifierModel:
          safeSettings.DocumentClassifierModel?.trim() || null,
        DocumentClassifierPrompt:
          safeSettings.DocumentClassifierPrompt?.trim() || null,
        ConversationResolutionModel:
          safeSettings.ConversationResolutionModel?.trim() || null,
        ConversationResolutionPrompt:
          safeSettings.ConversationResolutionPrompt?.trim() || null,
      })

      console.log("SAVE_SETTINGS_PAYLOAD", payload)

      await aiSettingsService.updateSettings(payload)

      invalidateCache(CACHE_KEY)
      await refresh()

      if (mountedRef.current) {
        setSuccess("AI settings updated successfully.")
      }
    } catch (err) {
      console.error("SAVE_SETTINGS_ERROR", err)

      if (mountedRef.current) {
        setError(err.message || "Failed to save settings.")
      }
    } finally {
      if (mountedRef.current) {
        setSaving(false)
      }
    }
  }, [saving, safeSettings, refresh])

  /* ========================================
     LOAD FACTORY DEFAULTS
  ======================================== */
  const loadFactoryDefaults = useCallback(async () => {
    try {
      setSuccess("")
      setError("")
      
      const response = await aiSettingsService.getFactoryDefaults()
      const normalized = normalizeSettings(response)
      
      setCachedData(CACHE_KEY, normalized)
      setSuccess("Factory defaults loaded. Review and click 'Save' to apply.")
    } catch (err) {
      console.error("LOAD_DEFAULTS_ERROR", err)
      setError("Failed to load factory defaults.")
    }
  }, [])

  return {
    loading,
    saving,
    success,
    error,

    settings: safeSettings,
    activeModel,
    llmOptions,

    update,
    selectModel,
    saveSettings,
    loadFactoryDefaults,
  }
}