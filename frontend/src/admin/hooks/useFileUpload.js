import {
  useMemo,
  useRef,
  useState,
} from "react"

import {
  uploadDocument,
} from "../services/uploadService"

const ITEMS_PER_PAGE = 5

export const useFileUpload =
  () => {

    const inputRef =
      useRef(null)

    const [uploadedFiles, setUploadedFiles] =
      useState([])

    const [currentPage, setCurrentPage] =
      useState(1)

    const [hasPendingUploads, setHasPendingUploads] =
      useState(false)

    /* FORMAT */
    const formatSize =
      (size) =>
        `${(
          size /
          1024 /
          1024
        ).toFixed(2)} MB`

    /* UPDATE FILE */
    const updateFile =
      (
        id,
        updates
      ) => {

        setUploadedFiles(
          (prev) =>
            prev.map(
              (file) =>
                file.id === id
                  ? {
                      ...file,
                      ...updates,
                    }
                  : file
            )
        )
      }

    /* UPLOAD SINGLE */
    const uploadFile =
      async (
        localId,
        file
      ) => {

        try {

          const data =
            await uploadDocument(
              file
            )

          updateFile(
            localId,
            {
              status:
                "Uploaded",

              statusType:
                "success",

              response:
                data,
            }
          )

        } catch (error) {

          console.error(
            "UPLOAD_ERROR",
            error
          )

          updateFile(
            localId,
            {
              status:
                "Failed",

              statusType:
                "error",
            }
          )
        }
      }

    /* CONFIRM UPLOAD */
    const confirmUpload =
      async () => {

        setHasPendingUploads(
          false
        )

        const pending =
          uploadedFiles.filter(
            (file) =>
              file.statusType ===
              "pending"
          )

        for (const file of pending) {

          updateFile(
            file.id,
            {
              status:
                "Uploading...",

              statusType:
                "loading",
            }
          )

          await uploadFile(
            file.id,
            file.raw
          )
        }
      }

    /* HANDLE FILES */
    const handleFiles =
      (files) => {

        const validFiles =
          Array.from(
            files
          ).filter(
            (file) =>
              file.name
                .toLowerCase()
                .endsWith(
                  ".pdf"
                )
          )

        if (
          validFiles.length ===
          0
        ) {
          return
        }

        const mapped =
          validFiles.map(
            (
              file
            ) => ({
              id:
                crypto.randomUUID(),

              raw:
                file,

              name:
                file.name,

              size:
                formatSize(
                  file.size
                ),

              type:
                file.name
                  .split(".")
                  .pop()
                  ?.toUpperCase(),

              status:
                "Pending",

              statusType:
                "pending",

              uploadedAt:
                new Date()
                  .toLocaleString(),
            })
          )

        setUploadedFiles(
          (prev) => [
            ...mapped,
            ...prev,
          ]
        )

        setHasPendingUploads(
          true
        )
      }

    /* INPUT */
    const handleInputChange =
      (event) => {

        handleFiles(
          event.target.files
        )

        event.target.value =
          ""
      }

    /* DROP */
    const handleDrop =
      (event) => {

        event.preventDefault()

        handleFiles(
          event.dataTransfer
            .files
        )
      }

    /* REMOVE */
    const removeFile =
      (id) => {

        setUploadedFiles(
          (prev) =>
            prev.filter(
              (file) =>
                file.id !== id
            )
        )
      }

    /* PAGINATION */
    const totalPages =
      Math.ceil(
        uploadedFiles.length /
        ITEMS_PER_PAGE
      )

    const paginatedFiles =
      useMemo(
        () =>
          uploadedFiles.slice(
            (
              currentPage -
              1
            ) *
              ITEMS_PER_PAGE,

            currentPage *
              ITEMS_PER_PAGE
          ),

        [
          uploadedFiles,
          currentPage,
        ]
      )

    return {
      inputRef,

      uploadedFiles,

      currentPage,
      totalPages,
      paginatedFiles,

      hasPendingUploads,

      handleInputChange,
      handleDrop,

      removeFile,

      confirmUpload,

      setCurrentPage,
    }
  }