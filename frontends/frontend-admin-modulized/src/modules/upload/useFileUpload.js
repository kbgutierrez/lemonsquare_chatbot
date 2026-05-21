import { useCallback, useMemo, useState } from "react"

import { apiClient } from "../../shared/api/client.js"
import { API_CONFIG } from "../../shared/config/env.js"
import { API_ENDPOINTS } from "../../shared/api/endpoints.js"

const MAX_FILE_SIZE =
  25 * 1024 * 1024

const MIN_UPLOAD_TIME = 1200

const isPdfFile = (file) => {
  if (!file) {
    return false
  }

  const validMime =
    file.type === "application/pdf"

  const validExtension =
    file.name
      ?.toLowerCase()
      .endsWith(".pdf")

  return (
    validMime ||
    validExtension
  )
}

const formatFileSize = (
  bytes
) => {
  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(2)} MB`
}

const normalizeCategory = (
  value
) => {
  return String(
    value || ""
  ).trim()
}

const createQueueItem = (
  file,
  category = "__AUTO_DETECT__"
) => {
  return {
    id: crypto.randomUUID(),

    file,

    name: file.name,

    type:
      file.type ||
      "application/pdf",

    size: formatFileSize(
      file.size
    ),

    rawSize: file.size,

    category,

    status:
      "Pending Upload",

    statusType:
      "warning",

    uploadedAt: "-",

    progress: 0,

    uploaded: false,
  }
}

const isDuplicateResponse = (
  error
) => {
  const message = String(
    error?.message || ""
  ).toLowerCase()

  return (
    message.includes(
      "already"
    ) ||
    message.includes(
      "exists"
    ) ||
    message.includes(
      "duplicate"
    )
  )
}

const isValidUploadResponse = (
  response
) => {
  return Boolean(
    response &&
      (
        response.document_id ||
        response.chunks_processed ||
        response.category
      )
  )
}

export const useFileUpload = ({
  onStatusChange,
  onRefreshDocs,
}) => {
  const [
    uploadedFiles,
    setUploadedFiles,
  ] = useState([])

  const [uploading, setUploading] =
    useState(false)

  const [
    uploadProgress,
    setUploadProgress,
  ] = useState(0)

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)

  const [
    dragged,
    setDragged,
  ] = useState(false)

  const updateStatus =
    useCallback(
      (
        message,
        type
      ) => {
        onStatusChange?.(
          message,
          type
        )
      },
      [onStatusChange]
    )

  /* ========================================
     VALIDATE
  ======================================== */

  const validateFile =
    useCallback(
      (file) => {
        if (
          !isPdfFile(file)
        ) {
          throw new Error(
            `${file.name}: Only PDF files are allowed.`
          )
        }

        if (
          file.size >
          MAX_FILE_SIZE
        ) {
          throw new Error(
            `${file.name}: File exceeds 25MB upload limit.`
          )
        }
      },
      []
    )

  /* ========================================
     ADD FILES
  ======================================== */

  const addFiles =
    useCallback(
      (
        incomingFiles,
        category = "__AUTO_DETECT__"
      ) => {
        const files =
          Array.from(
            incomingFiles || []
          )

        if (
          !files.length
        ) {
          return
        }

        try {
          files.forEach(
            validateFile
          )

          setUploadedFiles(
            (prev) => {
              const existing =
                new Set(
                  prev.map(
                    (
                      item
                    ) =>
                      item.name
                  )
                )

              const next =
                files
                  .filter(
                    (
                      file
                    ) =>
                      !existing.has(
                        file.name
                      )
                  )
                  .map(
                    (
                      file
                    ) =>
                      createQueueItem(
                        file,
                        category
                      )
                  )

              return [
                ...prev,
                ...next,
              ]
            }
          )

          updateStatus(
            `${files.length} PDF file${
              files.length >
              1
                ? "s"
                : ""
            } added to queue.`,
            "success"
          )
        } catch (error) {
          updateStatus(
            error.message,
            "error"
          )
        }
      },
      [
        validateFile,
        updateStatus,
      ]
    )

  /* ========================================
     REMOVE FILE
  ======================================== */

  const removeFile =
    useCallback(
      (id) => {
        setUploadedFiles(
          (prev) =>
            prev.filter(
              (
                file
              ) =>
                file.id !==
                id
            )
        )
      },
      []
    )

  /* ========================================
     CLEAR FILES
  ======================================== */

  const clearFiles =
    useCallback(() => {
      if (
        uploading
      ) {
        return
      }

      setUploadedFiles([])
      setUploadProgress(0)

      updateStatus(
        "Upload queue cleared.",
        "warning"
      )
    }, [
      uploading,
      updateStatus,
    ])

  /* ========================================
     UPDATE CATEGORY
  ======================================== */

  const updateCategory =
    useCallback(
      (
        id,
        category
      ) => {
        setUploadedFiles(
          (prev) =>
            prev.map(
              (
                item
              ) => {
                if (
                  item.id !==
                  id
                ) {
                  return item
                }

                return {
                  ...item,
                  category,
                }
              }
            )
        )
      },
      []
    )

  /* ========================================
     UPLOAD
  ======================================== */

  const confirmUpload =
    useCallback(async () => {
      const pending =
        uploadedFiles.filter(
          (file) =>
            !file.uploaded
        )

      if (
        !pending.length ||
        uploading
      ) {
        return
      }

      try {
        setUploading(
          true
        )

        updateStatus(
          `Uploading ${pending.length} file${
            pending.length >
            1
              ? "s"
              : ""
          }...`,
          "loading"
        )

        for (
          let index = 0;
          index <
          pending.length;
          index++
        ) {
          const item =
            pending[index]

          setUploadedFiles(
            (prev) =>
              prev.map(
                (
                  file
                ) => {
                  if (
                    file.id !==
                    item.id
                  ) {
                    return file
                  }

                  return {
                    ...file,
                    status:
                      "Uploading...",
                    statusType:
                      "loading",
                  }
                }
              )
          )

          const formData =
            new FormData()

          formData.append(
            "file",
            item.file
          )

          if (
            item.category &&
            item.category !==
              "__AUTO_DETECT__"
          ) {
            formData.append(
              "category",
              normalizeCategory(
                item.category
              )
            )
          }

          const startedAt =
            Date.now()

          try {
            const response =
              await apiClient.upload(
                `${API_CONFIG.BASE_URL}${API_ENDPOINTS.DOCUMENT_UPLOAD}`,
                formData,
                {
                  headers: {
                    Accept:
                      "application/json",
                  },
                }
              )

            const elapsed =
              Date.now() -
              startedAt

            if (
              elapsed <
              MIN_UPLOAD_TIME
            ) {
              await new Promise(
                (
                  resolve
                ) =>
                  setTimeout(
                    resolve,
                    MIN_UPLOAD_TIME -
                      elapsed
                  )
              )
            }

            if (
              !isValidUploadResponse(
                response
              )
            ) {
              throw new Error(
                "Upload completed but ingestion response is invalid."
              )
            }

            setUploadedFiles(
              (
                prev
              ) =>
                prev.map(
                  (
                    file
                  ) => {
                    if (
                      file.id !==
                      item.id
                    ) {
                      return file
                    }

                    return {
                      ...file,

                      uploaded:
                        true,

                      progress:
                        100,

                      uploadedAt:
                        new Date().toLocaleTimeString(),

                      detectedCategory:
                        response?.category ||
                        "Unknown",

                      documentId:
                        response?.document_id ||
                        null,

                      chunksProcessed:
                        response?.chunks_processed ||
                        0,

                      status:
                        isDuplicateResponse(
                          response
                        )
                          ? "Already Exists"
                          : "Uploaded Successfully",

                      statusType:
                        isDuplicateResponse(
                          response
                        )
                          ? "warning"
                          : "success",
                    }
                  }
                )
            )
          } catch (error) {
            const duplicate =
              isDuplicateResponse(
                error
              )

            setUploadedFiles(
              (
                prev
              ) =>
                prev.map(
                  (
                    file
                  ) => {
                    if (
                      file.id !==
                      item.id
                    ) {
                      return file
                    }

                    return {
                      ...file,

                      uploaded:
                        false,

                      status:
                        duplicate
                          ? "Already Exists"
                          : error.message ||
                            "Upload Failed",

                      statusType:
                        duplicate
                          ? "warning"
                          : "error",
                    }
                  }
                )
            )
          }

          const overallProgress =
            Math.round(
              ((index + 1) /
                pending.length) *
                100
            )

          setUploadProgress(
            overallProgress
          )
        }

        updateStatus(
          "Upload queue completed.",
          "success"
        )

        await onRefreshDocs?.()
      } finally {
        setUploading(
          false
        )
      }
    }, [
      uploadedFiles,
      uploading,
      updateStatus,
      onRefreshDocs,
    ])

  /* ========================================
     PAGINATION
  ======================================== */

  const itemsPerPage = 8

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        uploadedFiles.length /
          itemsPerPage
      )
    )

  const paginatedFiles =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        itemsPerPage

      return uploadedFiles.slice(
        start,
        start +
          itemsPerPage
      )
    }, [
      uploadedFiles,
      currentPage,
    ])

  const hasPendingUploads =
    uploadedFiles.some(
      (file) =>
        !file.uploaded
    )

  return {
    uploadedFiles,
    paginatedFiles,

    currentPage,
    totalPages,

    setCurrentPage,

    dragged,
    setDragged,

    uploading,
    uploadProgress,

    addFiles,
    removeFile,
    clearFiles,
    confirmUpload,
    updateCategory,

    hasPendingUploads,

    showTable:
      uploadedFiles.length >
      0,
  }
}

export default useFileUpload