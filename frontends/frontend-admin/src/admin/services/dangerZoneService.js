import apiClient, {
  buildApiUrl,
} from "../../shared/api/client"

import {
  API_ENDPOINTS,
} from "../../shared/api/endpoints"

export const wipeAllKnowledge =
  async () => {
    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.MAINTENANCE_WIPE_ALL
      )

    return apiClient.delete(
      endpoint,
      {
        body: {
          confirm_wipe:
            "I_UNDERSTAND_THIS_IS_IRREVERSIBLE",
        },
      }
    )
  }

const dangerZoneService = {
  wipeAllKnowledge,
}

export default dangerZoneService