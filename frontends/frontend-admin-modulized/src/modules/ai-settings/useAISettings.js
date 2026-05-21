import { useState } from "react"
import useLiveQuery from "../../shared/hooks/useLiveQuery.js"
import { AI_DEFAULTS } from "../../shared/config/env.js"

const FALLBACK_SETTINGS = { ...AI_DEFAULTS, UseReformulator: true, UseReranker: true, TopK_Tickets: 5, ConfidenceThreshold: 0.75 }

export const useAISettings = () => {
  const [saving, setSaving] = useState(false)

  const { data: settings, loading, error, refresh } = useLiveQuery({
    queryKey: "ai_settings",
    queryFn: async () => {
      const res = await fetch("/api/settings", { headers: { "Accept": "application/json" } })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      return { ...FALLBACK_SETTINGS, ...json }
    },
    initialData: FALLBACK_SETTINGS,
    staleWhileRevalidate: true,
  })

  const updateSettings = async (newSettings) => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT", headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(newSettings),
      })
      if (!res.ok) throw new Error(await res.text())
      refresh()
    } catch (e) { throw e } finally { setSaving(false) }
  }

  return { settings, loading, error, refresh, updateSettings, saving }
}

export default useAISettings
