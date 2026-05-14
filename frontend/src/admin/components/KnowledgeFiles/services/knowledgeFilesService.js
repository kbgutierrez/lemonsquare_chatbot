import {
  API_CONFIG,
} from "../../../../config/sqlVariables"

const API_URL =
  `${API_CONFIG.BASE_URL}/documents`

/* ========================================
   GET FILES
======================================== */

export const getKnowledgeFiles =
  async () => {

    const response =
      await fetch(
        API_URL
      )

    if (!response.ok) {

      throw new Error(
        "Failed to load documents"
      )
    }

    return response.json()
  }

/* ========================================
   UPDATE FILE
======================================== */

export const updateKnowledgeFile =
  async (
    documentId,
    payload
  ) => {

    const response =
      await fetch(
        `${API_URL}/${documentId}`,
        {
          method:
            "PUT",

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
        "Failed to update document"
      )
    }

    return response.json()
  }

/* ========================================
   DELETE FILE
======================================== */

export const deleteKnowledgeFile =
  async (
    documentId
  ) => {

    const response =
      await fetch(
        `${API_URL}/${documentId}`,
        {
          method:
            "DELETE",
        }
      )

    if (!response.ok) {

      throw new Error(
        "Failed to delete document"
      )
    }

    return response.json()
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