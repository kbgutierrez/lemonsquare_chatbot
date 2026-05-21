import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { aiModels, defaultAISettings } from "./aiModels.js"
import apiClient from "../../shared/api/client.js"

import useLiveQuery from "../../shared/hooks/useLiveQuery.js"
import {
  invalidateCache,
  setCachedData,
} from "../../shared/cache/liveQueryCache.js"

const CACHE_KEY = "ai_settings"

/* ========================================
   DEFAULT SETTINGS (STABLE)
======================================== */
const DEFAULT_SETTINGS = Object.freeze({
  ActiveModel: defaultAISettings.ActiveModel,
  ReformulatorModel: defaultAISettings.ReformulatorModel,
  EmbeddingModel: defaultAISettings.EmbeddingModel,
  RerankerModel: defaultAISettings.RerankerModel,

  Temperature: defaultAISettings.Temperature,
  TopK_Tickets: defaultAISettings.TopK_Tickets,
  ConfidenceThreshold: defaultAISettings.ConfidenceThreshold,

  UseReformulator: defaultAISettings.UseReformulator,
  UseReranker: defaultAISettings.UseReranker,

  SystemPrompt: defaultAISettings.SystemPrompt,
  ReformulatorPrompt: defaultAISettings.ReformulatorPrompt,
  AllowedCategories: defaultAISettings.AllowedCategories,
  ChatExtractionPrompt: "",
})

/* ========================================
   SAFE NORMALIZER
======================================== */
const normalizeSettings = (data) => {
  // Handle axios-style response wrapper: { data: {...}, status: 200 }
  const d =
    data && typeof data === "object" && !Array.isArray(data)
      ? data.data ?? data
      : {}

  return {
    ActiveModel: d.ActiveModel || DEFAULT_SETTINGS.ActiveModel,
    ReformulatorModel: d.ReformulatorModel || DEFAULT_SETTINGS.ReformulatorModel,
    EmbeddingModel: d.EmbeddingModel || DEFAULT_SETTINGS.EmbeddingModel,
    RerankerModel: d.RerankerModel || DEFAULT_SETTINGS.RerankerModel,

    Temperature: Number(d.Temperature ?? DEFAULT_SETTINGS.Temperature),
    TopK_Tickets: Number(d.TopK_Tickets ?? DEFAULT_SETTINGS.TopK_Tickets),
    ConfidenceThreshold: Number(
      d.ConfidenceThreshold ?? DEFAULT_SETTINGS.ConfidenceThreshold
    ),

    UseReformulator: d.UseReformulator !== undefined ? Boolean(d.UseReformulator) : DEFAULT_SETTINGS.UseReformulator,
    UseReranker: d.UseReranker !== undefined ? Boolean(d.UseReranker) : DEFAULT_SETTINGS.UseReranker,

    SystemPrompt: d.SystemPrompt ?? DEFAULT_SETTINGS.SystemPrompt,
    ReformulatorPrompt: d.ReformulatorPrompt ?? DEFAULT_SETTINGS.ReformulatorPrompt,
    AllowedCategories: d.AllowedCategories ?? DEFAULT_SETTINGS.AllowedCategories,
    ChatExtractionPrompt: d.ChatExtractionPrompt ?? "",
  }
}

export const useAISettings = () => {
  const mountedRef = useRef(true)

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

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
    const response = await apiClient.get("/settings")
    console.log("RAW_API_RESPONSE", response)
    const normalized = normalizeSettings(response)
    console.log("NORMALIZED_SETTINGS", normalized)
    return normalized
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
     UPDATE FIELD (SAFE) — Cache-driven optimistic UI
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
     SELECT MODEL (Batch update all 4 models + temp)
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
     ACTIVE MODEL (for header display if needed)
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
        ChatExtractionPrompt:
          safeSettings.ChatExtractionPrompt?.trim() || null,
      })

      console.log("SAVE_SETTINGS_PAYLOAD", payload)

      await apiClient.post("/settings", payload)

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

  return {
    loading,
    saving,
    success,
    error,

    settings: safeSettings,
    activeModel,

    update,
    selectModel,
    saveSettings,
  }
}

export default useAISettings