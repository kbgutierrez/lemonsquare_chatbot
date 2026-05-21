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
  async (
    status = "active"
  ) => {

    return apiClient.get(
      `${API_URL}?status=${status}`
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
   RESTORE FILE
======================================== */

export const restoreKnowledgeFile =
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
        API_ENDPOINTS.DOCUMENT_RESTORE,
        {
          documentId,
        }
      )

    return apiClient.post(
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
  restoreKnowledgeFile,
}

export default knowledgeFilesService