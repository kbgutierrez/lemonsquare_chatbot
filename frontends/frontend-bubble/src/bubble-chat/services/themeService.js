import chatbotService from "./chatbotService"

const API_BASE =
  import.meta.env
    .VITE_API_BASE_URL ||
  "/api"

const STORAGE_KEY = "lemonsquare-theme-v1"

/* ========================================
   THEME SERVICE
   Per-user backend persistence with localStorage fallback.
   Sends X-User-Token header for user identification.
======================================== */

const themeService = {

  getAuthHeaders: () => {
    const token = chatbotService.getUserToken?.() || "11318"
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-User-Token": String(token),
    }
  },

  async getTheme() {
    try {
      const response = await fetch(
        `${API_BASE}/settings/theme`,
        { method: "GET", headers: this.getAuthHeaders() }
      )

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        return data
      }

      if (response.status === 404) {
        console.warn("THEME_BACKEND_404 — using localStorage fallback")
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error("THEME_BACKEND_GET_FAIL", error)
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch (e) {
      console.error("THEME_LOCAL_GET_FAIL", e)
    }

    return null
  },

  async saveTheme(payload) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (e) {
      console.error("THEME_LOCAL_SAVE_FAIL", e)
    }

    try {
      const response = await fetch(
        `${API_BASE}/settings/theme`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      )

      if (response.ok) return await response.json()
      if (response.status === 404) {
        console.warn("THEME_BACKEND_404 — saved to localStorage only")
        return { success: true, source: "localStorage", backend: false }
      }
      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      console.error("THEME_BACKEND_SAVE_FAIL", error)
      return { success: true, source: "localStorage", backend: false, error: error.message }
    }
  },
}

export default themeService