import {
  API_CONFIG,
  API_ENDPOINTS,
  buildApiUrl,
} from "../../config/sqlVariables"

const REQUEST_TIMEOUT =
  API_CONFIG.TIMEOUT ||
  30000

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
   REQUEST HELPER
======================================== */

const uploadRequest =
  async ({
    endpoint,
    formData,
  }) => {

    const controller =
      new AbortController()

    const timeout =
      setTimeout(() => {

        controller.abort()

      }, REQUEST_TIMEOUT)

    try {

      console.log(
        "UPLOAD_REQUEST_URL",
        endpoint
      )

      console.log(
        "UPLOAD_FILE",
        formData.get("file")
      )

      const response =
        await fetch(
          endpoint,
          {
            method:
              "POST",

            body:
              formData,

            signal:
              controller.signal,
          }
        )

      console.log(
        "UPLOAD_STATUS",
        response.status
      )

      const rawText =
        await response.text()

      console.log(
        "UPLOAD_RESPONSE",
        rawText
      )

      let responseData =
        null

      try {

        responseData =
          rawText
            ? JSON.parse(
                rawText
              )
            : null

      } catch (parseError) {

        console.error(
          "UPLOAD_PARSE_ERROR",
          parseError
        )

        throw new Error(
          "Backend returned invalid JSON."
        )
      }

      /* HTTP ERROR */

      if (!response.ok) {

        const errorMessage =
          responseData?.error ||
          responseData?.detail ||
          responseData?.message ||
          `Upload failed with status ${response.status}`

        throw new Error(
          errorMessage
        )
      }

      return responseData

    } catch (error) {

      /* TIMEOUT */

      if (
        error.name ===
        "AbortError"
      ) {

        throw new Error(
          "Upload timeout. Backend took too long to respond."
        )
      }

      /* NETWORK ERROR */

      if (
        error instanceof
        TypeError
      ) {

        throw new Error(
          "Unable to connect to backend server."
        )
      }

      throw error

    } finally {

      clearTimeout(
        timeout
      )
    }
  }

/* ========================================
   UPLOAD DOCUMENT
======================================== */

export const uploadDocument =
  async (file) => {

    validateFile(
      file
    )

    const formData =
      new FormData()

    formData.append(
      "file",
      file
    )

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.DOCUMENT_UPLOAD
      )

    console.log(
      "UPLOAD_ENDPOINT",
      endpoint
    )

    return uploadRequest({
      endpoint,
      formData,
    })
  }

/* ========================================
   EXPORT
======================================== */

const uploadService = {
  uploadDocument,
}

export default uploadService