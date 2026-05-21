import { API_CONFIG } from "../config/env.js"

const REQUEST_TIMEOUT = API_CONFIG.TIMEOUT || 30000

export const buildApiUrl = (endpoint, params = {}) => {
  let url = endpoint
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    url = url.replace(`:${key}`, encodeURIComponent(String(value)))
  }
  return url
}

const safeParseJSON = (text) => {
  try { return JSON.parse(text) } catch { return text }
}

const extractErrorMessage = (data, status) => {
  const fallback = `Request failed (${status})`
  if (Array.isArray(data?.detail)) return data.detail.map(i => i?.msg).filter(Boolean).join(", ")
  if (typeof data?.detail === "string") return data.detail
  if (typeof data?.error === "string") return data.error
  if (data?.message) return data.message
  return fallback
}

const request = async ({ endpoint, method = "GET", body, headers = {}, isFormData = false }) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
  try {
    const finalHeaders = isFormData ? headers : { "Content-Type": "application/json", ...API_CONFIG.HEADERS, ...headers }
    const response = await fetch(endpoint, {
      method, signal: controller.signal, headers: finalHeaders,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    })
    const rawText = await response.text()
    const data = rawText ? safeParseJSON(rawText) : null
    if (!response.ok) throw new Error(extractErrorMessage(data, response.status))
    return data
  } catch (err) {
    if (err.name === "AbortError") throw new Error("Request timeout")
    if (err instanceof TypeError) throw new Error("Unable to connect to backend server")
    throw err
  } finally { clearTimeout(timeout) }
}

export const apiClient = {
  get: (endpoint, options) => request({ endpoint, method: "GET", ...options }),
  post: (endpoint, body, options) => request({ endpoint, method: "POST", body, ...options }),
  put: (endpoint, body, options) => request({ endpoint, method: "PUT", body, ...options }),
  patch: (endpoint, body, options) => request({ endpoint, method: "PATCH", body, ...options }),
  delete: (endpoint, options) => request({ endpoint, method: "DELETE", ...options }),
  upload: (endpoint, formData, options = {}) => request({ endpoint, method: "POST", body: formData, isFormData: true, ...options }),
}

export default apiClient
