const API_BASE_URL =
  "http://localhost:8000/api"

/* UPLOAD DOCUMENT */
export const uploadDocument =
  async (file) => {

    const formData =
      new FormData()

    formData.append(
      "file",
      file
    )

    const response =
      await fetch(
        `${API_BASE_URL}/upload-document`,
        {
          method:
            "POST",

          body:
            formData,
        }
      )

    if (!response.ok) {

      let errorMessage =
        "Upload failed"

      try {

        const errorData =
          await response.json()

        errorMessage =
          errorData.error ||
          errorData.detail ||
          errorMessage

      } catch {
        /* ignore */
      }

      throw new Error(
        errorMessage
      )
    }

    return await response.json()
  }

/* FUTURE:
  - deleteDocument()
  - fetchDocuments()
  - reindexDocument()
  - websocket progress
  - chunk analytics
  - upload categories
*/