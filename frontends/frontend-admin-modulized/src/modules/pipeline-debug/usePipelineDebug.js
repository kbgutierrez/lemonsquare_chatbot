import { useState, useRef } from "react"
import { safeClone } from "../../shared/utils/clone.js"
import { API_CONFIG } from "../../shared/config/env.js"

export const usePipelineDebug = () => {
  const [text, setText] = useState("")
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeStage, setActiveStage] = useState(0)
  const stagesRef = useRef([
    "Initializing pipeline...",
    "Analyzing input...",
    "Reformulating query...",
    "Embedding generation...",
    "Vector retrieval...",
    "Context assembly...",
    "Final generation...",
  ])

  const startSimulation = async (overrideLoading = null) => {
    const set = overrideLoading || setLoading
    set(true); setActiveStage(0); setResult(null); setError("")
    for (let i = 0; i < stagesRef.current.length; i++) {
      await new Promise(r => setTimeout(r, 800 + Math.random() * 600))
      setActiveStage(i + 1)
    }
  }

  const runPipeline = async (signal) => {
    if (!text.trim()) { setError("Please enter some text to process."); return }
    try {
      await startSimulation()
      const res = await fetch(`${API_CONFIG.BASE_URL}/documents/debug/full-pipeline`, {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ text }), signal,
      })
      if (!res.ok) { const body = await res.json().catch(() => null); throw new Error(body?.detail || `Pipeline failed (${res.status})`) }
      const data = await res.json()
      setResult(safeClone(data))
      setActiveStage(stagesRef.current.length)
    } catch (e) {
      if (e.name === "AbortError") { setError("Pipeline was cancelled."); setLoading(false); return }
      console.error("PIPELINE_ERROR:", e)
      setError(e?.message || "An unexpected error occurred.")
      setActiveStage(0)
    } finally { setLoading(false) }
  }

  const cancel = (controller) => { controller?.abort(); setLoading(false); setActiveStage(0) }

  return { text, setText, result, error, loading, activeStage, stages: stagesRef.current, runPipeline, cancel }
}

export default usePipelineDebug
