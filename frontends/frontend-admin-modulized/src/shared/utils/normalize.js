import { safeClone } from './clone.js'

export const normalizeData = (value, fallback) => {
  if (value === undefined || value === null) return safeClone(fallback)
  if (Array.isArray(fallback)) return Array.isArray(value) ? safeClone(value) : safeClone(fallback)
  if (typeof fallback === "object" && fallback !== null && !Array.isArray(fallback)) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return safeClone(fallback)
    return { ...safeClone(fallback), ...safeClone(value) }
  }
  return safeClone(value)
}

export const safeUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export const formatDate = (date) => {
  if (!date) return "-"
  return new Date(date).toLocaleString()
}

export const formatFileSize = (size) => {
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}
