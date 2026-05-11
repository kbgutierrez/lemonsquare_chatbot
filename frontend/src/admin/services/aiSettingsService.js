import {
  API_CONFIG,
} from "../../config/sqlVariables"

const BASE =
  API_CONFIG.BASE_URL

/* ========================================
   GET SETTINGS
======================================== */

const getSettings =
  async () => {

    const response =
      await fetch(
        `${BASE}/settings/ai`
      )

    if (!response.ok) {

      const error =
        await response.text()

      console.error(
        "GET_SETTINGS_ERROR",
        error
      )

      throw new Error(
        "Failed to load AI settings"
      )
    }

    return response.json()
  }

/* ========================================
   UPDATE SETTINGS
======================================== */

const updateSettings =
  async (payload) => {

    console.log(
      "UPDATE_SETTINGS_REQUEST",
      payload
    )

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

      const error =
        await response.text()

      console.error(
        "UPDATE_SETTINGS_ERROR",
        error
      )

      throw new Error(
        error
      )
    }

    return response.json()
  }

const aiSettingsService = {
  getSettings,
  updateSettings,
}

export default aiSettingsService