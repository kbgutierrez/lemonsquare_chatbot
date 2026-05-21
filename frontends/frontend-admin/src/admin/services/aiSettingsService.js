import apiClient, {
  buildApiUrl,
} from "../../shared/api/client"

import {
  API_ENDPOINTS,
} from "../../shared/api/endpoints"

/* ========================================
   GET SETTINGS
======================================== */

const getSettings =
  async () => {

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.AI_SETTINGS
      )

    return apiClient.get(
      endpoint
    )
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

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.AI_SETTINGS
      )

    return apiClient.post(
      endpoint,
      payload
    )
  }

/* ========================================
   EXPORT
======================================== */

const aiSettingsService = {
  getSettings,
  updateSettings,
}

export default aiSettingsService