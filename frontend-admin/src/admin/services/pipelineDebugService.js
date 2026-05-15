import apiClient, {
  buildApiUrl,
} from "../../shared/api/client"

import {
  API_ENDPOINTS,
} from "../../shared/api/endpoints"

/* ========================================
   DEBUG PIPELINE
======================================== */

const debugPipeline =
  async ({
    message,
    user_token,
    session_id,
  }) => {

    console.log(
      "PIPELINE_DEBUG_REQUEST"
    )

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS
          .DOCUMENT_DEBUG_PIPELINE
      )

    console.log(
      "PIPELINE_DEBUG_ENDPOINT",
      endpoint
    )

    return apiClient.post(
      endpoint,
      {
        query:
          message,

        user_token,

        session_id,
      }
    )
  }

/* ========================================
   EXPORT
======================================== */

const pipelineDebugService = {
  debugPipeline,
}

export default pipelineDebugService