import {
  API_CONFIG,
} from "../../config/sqlVariables"

const BASE =
  API_CONFIG.BASE_URL

const getSettings =
  async () => {

    const response =
      await fetch(
        `${BASE}/settings/ai`
      )

    if (!response.ok) {

      throw new Error(
        "Failed to load AI settings"
      )
    }

    return response.json()
  }

const updateSettings =
  async (payload) => {

    const response =
      await fetch(
        `${BASE}/settings/ai/update`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              payload
            ),
        }
      )

    if (!response.ok) {

      throw new Error(
        "Failed to save AI settings"
      )
    }

    return response.json()
  }

const aiSettingsService = {
  getSettings,
  updateSettings,
}

export default aiSettingsService