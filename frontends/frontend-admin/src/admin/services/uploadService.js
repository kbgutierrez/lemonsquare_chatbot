import apiClient, {
  buildApiUrl,
} from "../../shared/api/client"

import {
  API_ENDPOINTS,
} from "../../shared/api/endpoints"

/* ========================================
   VALIDATION
======================================== */

const validateFile =
  (file) => {

    if (!file) {

      throw new Error(
        "No file selected."
      )
    }

    const allowedTypes = [
      "application/pdf",
    ]

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      throw new Error(
        "Only PDF files are allowed."
      )
    }

    const maxSize =
      25 * 1024 * 1024

    if (
      file.size >
      maxSize
    ) {

      throw new Error(
        "File exceeds 25MB upload limit."
      )
    }
  }

/* ========================================
   UPLOAD DOCUMENT
======================================== */

export const uploadDocument =
  async (
    file,
    category
  ) => {

    validateFile(
      file
    )

    const formData =
      new FormData()

    formData.append(
      "file",
      file
    )

    if (category) {

      formData.append(
        "category",
        category
      )
    }

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.DOCUMENT_UPLOAD
      )

    console.log(
      "UPLOAD_ENDPOINT",
      endpoint
    )

    return apiClient.post(
      endpoint,
      formData,
      {
        isFormData: true,
      }
    )
  }

/* ========================================
   POLL STATUS
======================================== */

export const pollUploadStatus = async (jobId, onStatusChange, intervalMs = 3000, maxAttempts = 200) => {
  const endpoint = buildApiUrl(
    API_ENDPOINTS.DOCUMENT_UPLOAD_STATUS.replace(":jobId", jobId)
  )

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await apiClient.get(endpoint)
      
      if (response.status === "completed") {
        return response.details
      }
      
      if (response.status === "failed") {
        throw new Error(response.error || "Upload processing failed.")
      }

      if (onStatusChange && typeof onStatusChange === "function") {
        onStatusChange(response.status)
      }

      // If queued or running, wait and try again
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    } catch (err) {
      if (err.message && err.message.includes("failed")) {
        throw err
      }
      // Log other errors and retry (could be transient network issues)
      console.warn("Polling error:", err)
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
  }

  throw new Error("Polling timeout: The upload process took too long.")
}

/* ========================================
   EXPORT
======================================== */

const uploadService = {
  uploadDocument,
  pollUploadStatus,
}

export default uploadService