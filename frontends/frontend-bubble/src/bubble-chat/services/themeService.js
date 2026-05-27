import chatbotService from "./chatbotService"

const API_BASE =
  import.meta.env
    .VITE_API_BASE_URL ||
  "/api"

/* ========================================
   THEME SERVICE
   Syncs with backend SQL columns:
   - BubbleTheme
   - HeaderGradientEnabled
   - CustomHeaderGradientStart
   - CustomHeaderGradientEnd
   - CustomAccent
   - CustomWindowBg
======================================== */

const themeService = {

  getAuthHeaders: () => {

    const token =
      chatbotService.getUserToken?.() ||
      ""

    return {
      Authorization:
        `Bearer ${token}`,
      "Content-Type":
        "application/json",
    }
  },

  async getTheme() {

    try {

      const response =
        await fetch(
          `${API_BASE}/settings/theme`,
          {
            method: "GET",
            headers:
              this.getAuthHeaders(),
          }
        )

      if (
        !response.ok
      ) {

        if (
          response.status ===
          404
        ) {
          return null
        }

        throw new Error(
          `HTTP ${response.status}`
        )
      }

      return await response.json()

    } catch (error) {

      console.error(
        "THEME_SERVICE_GET",
        error
      )

      return null
    }
  },

  async saveTheme(
    payload
  ) {

    try {

      const response =
        await fetch(
          `${API_BASE}/settings/theme`,
          {
            method: "PUT",
            headers:
              this.getAuthHeaders(),
            body:
              JSON.stringify(
                payload
              ),
          }
        )

      if (
        !response.ok
      ) {
        throw new Error(
          `HTTP ${response.status}`
        )
      }

      return await response.json()

    } catch (error) {

      console.error(
        "THEME_SERVICE_SAVE",
        error
      )

      throw error
    }
  },
}

export default themeService