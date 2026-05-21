import { useState, useCallback } from "react"
import { apiClient } from "../../shared/api/client.js"
import { API_ENDPOINTS } from "../../shared/api/endpoints.js"

const MIN_PROCESSING_TIME = 2000
const processFile = (file, name) => {
  const f = file
  if (name) { try { f = new File([file], name, { type: file.type }) } catch (e) { console.warn("Renaming failed:", e) } }
  return f
}

export const useFileUpload = ({ onStatusChange, onRefreshDocs }) => {
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [statusType, setStatusType] = useState("")
  const [result, setResult] = useState("")
  const [dragged, setDragged] = useState(false)
  const [processing, setProcessing] = useState(false)

  const updateStatus = useCallback((msg, type) => {
    setStatus(msg); setStatusType(type); onStatusChange?.(msg, type)
  }, [onStatusChange])

  const addFiles = useCallback((newFiles, name = null) => {
    if (!newFiles?.length) return
    const processed = name ? [processFile(newFiles[0], name)] : newFiles
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...processed.filter(f => !existing.has(f.name))]
    })
  }, [])

  const removeFile = useCallback((file) => {
    setFiles(prev => prev.filter(f => f.name !== file.name))
  }, [])

  const clearFiles = useCallback(() => setFiles([]), [])

  const simulateProgress = useCallback(() => {
    let progress = 0
    setUploadProgress(0)
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 2
      setUploadProgress(Math.min(progress, 90))
    }, 250)
    return interval
  }, [])

  const uploadFiles = useCallback(async ({ rename = "" }) => {
    if (!files.length) return
    const controller = new AbortController()
    try {
      setProcessing(true)
      updateStatus(files.length > 1 ? `Uploading ${files.length} files...` : "Uploading file...", "loading")
      const progressInterval = simulateProgress()

      const formData = new FormData()
      const processedFiles = rename ? files.map(f => processFile(f, rename)) : files
      processedFiles.forEach(f => formData.append("files", f))

      const startTime = Date.now()
      const response = await apiClient.upload(API_ENDPOINTS.DOCUMENT_UPLOAD, formData, {
        headers: { "Accept": "application/json" },
        signal: controller.signal,
      })
      const data = response || await response?.json()

      const elapsed = Date.now() - startTime
      if (elapsed < MIN_PROCESSING_TIME) await new Promise(r => setTimeout(r, MIN_PROCESSING_TIME - elapsed))
      clearInterval(progressInterval)
      setUploadProgress(100)

      const successCount = data?.successful_uploads?.length || data?.processed_files?.length || files.length
      updateStatus(`Upload complete! ${successCount} file${successCount !== 1 ? "s" : ""} processed.`, "success")
      setResult(JSON.stringify(data, null, 2))
      setFiles([])
      onRefreshDocs?.()
    } catch (err) {
      updateStatus(`Upload failed: ${err.message || "Unknown error"}`, "error")
      console.error("UPLOAD_ERROR:", err)
    } finally {
      setProcessing(false)
    }
    return () => controller.abort()
  }, [files, simulateProgress, updateStatus, onRefreshDocs])

  return { files, addFiles, removeFile, clearFiles, uploadFiles, status, statusType, uploadProgress, result, dragged, setDragged, processing }
}

export default useFileUpload
