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
   EXPORT
======================================== */

const uploadService = {
  uploadDocument,
}

export default uploadService