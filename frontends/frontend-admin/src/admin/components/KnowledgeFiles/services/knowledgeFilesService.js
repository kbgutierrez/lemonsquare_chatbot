import apiClient, {
  buildApiUrl,
} from "../../../../shared/api/client"

import {
  API_ENDPOINTS,
} from "../../../../shared/api/endpoints"

/* ========================================
   BASE ENDPOINT
======================================== */

const API_URL =
  buildApiUrl(
    API_ENDPOINTS.DOCUMENTS
  )

/* ========================================
   GET FILES
======================================== */

export const getKnowledgeFiles =
  async () => {

    return apiClient.get(
      API_URL
    )
  }

/* ========================================
   UPDATE FILE
======================================== */

export const updateKnowledgeFile =
  async (
    documentId,
    payload
  ) => {

    if (!documentId) {

      throw new Error(
        "Document ID is required."
      )
    }

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.DOCUMENT_DELETE,
        {
          documentId,
        }
      )

    return apiClient.put(
      endpoint,
      payload
    )
  }

/* ========================================
   DELETE FILE
======================================== */

export const deleteKnowledgeFile =
  async (
    documentId
  ) => {

    if (!documentId) {

      throw new Error(
        "Document ID is required."
      )
    }

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.DOCUMENT_DELETE,
        {
          documentId,
        }
      )

    return apiClient.delete(
      endpoint
    )
  }

/* ========================================
   EXPORT
======================================== */

const knowledgeFilesService = {
  getKnowledgeFiles,
  updateKnowledgeFile,
  deleteKnowledgeFile,
}

export default knowledgeFilesService