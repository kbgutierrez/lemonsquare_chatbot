import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  uploadDocument,
} from "../services/uploadService"

import aiSettingsService
  from "../services/aiSettingsService"

import {
  getCachedData,
  setCachedData,
  subscribeCache,
} from "../../shared/cache/liveQueryCache"

const ITEMS_PER_PAGE = 5

const UPLOAD_CACHE_KEY =
  "global_upload_queue"

export const useFileUpload =
  () => {

    /* =========================================
       REFS
    ========================================= */

    const inputRef =
      useRef(null)

    const uploadLockRef =
      useRef(false)

    const mountedRef =
      useRef(true)

    const rawFilesRef =
      useRef(
        new Map()
      )

    /* =========================================
       INITIAL CACHE HYDRATION
    ========================================= */

    const initialUploads =
      getCachedData(
        UPLOAD_CACHE_KEY
      ) || []

    /* =========================================
       STATE
    ========================================= */

    const [
      uploadedFiles,
      setUploadedFiles,
    ] = useState(
      initialUploads
    )

    const [
      currentPage,
      setCurrentPage,
    ] = useState(1)

    const [
      hasPendingUploads,
      setHasPendingUploads,
    ] = useState(
      () =>
        initialUploads.some(
          (file) =>
            file.statusType ===
            "pending"
        )
    )

    const [
      selectedCategory,
      setSelectedCategory,
    ] = useState("")

    const [
      categories,
      setCategories,
    ] = useState([])

    /* =========================================
       CACHE SANITIZER
    ========================================= */

    const sanitizeForCache =
      useCallback(
        (files) => {

          return files.map(
            ({
              raw,
              ...safeFile
            }) =>
              safeFile
          )
        },
        []
      )

    /* =========================================
       CACHE SYNC
    ========================================= */

    const syncCache =
      useCallback(
        (files) => {

          setCachedData(
            UPLOAD_CACHE_KEY,
            sanitizeForCache(
              files
            )
          )
        },
        [sanitizeForCache]
      )

    /* =========================================
       CACHE SUBSCRIPTION
    ========================================= */

    useEffect(() => {

      mountedRef.current =
        true

      const unsubscribe =
        subscribeCache(
          UPLOAD_CACHE_KEY,
          (
            updatedFiles
          ) => {

            if (
              !mountedRef.current
            ) {
              return
            }

            const safe =
              Array.isArray(
                updatedFiles
              )
                ? updatedFiles
                : []

            const hydrated =
              safe.map(
                (
                  file
                ) => ({
                  ...file,

                  raw:
                    rawFilesRef.current.get(
                      file.id
                    ) || null,
                })
              )

            setUploadedFiles(
              hydrated
            )

            setHasPendingUploads(
              hydrated.some(
                (
                  file
                ) =>
                  file.statusType ===
                  "pending"
              )
            )
          }
        )

      return () => {

        mountedRef.current =
          false

        unsubscribe?.()
      }

    }, [])

    /* =========================================
       LOAD CATEGORIES
    ========================================= */

    useEffect(() => {

      const loadCategories =
        async () => {

          try {

            const settings =
              await aiSettingsService.getSettings()

            const parsed =
              settings?.AllowedCategories
                ?.split(",")

                ?.map(
                  (
                    item
                  ) =>
                    item.trim()
                )

                ?.filter(Boolean) || []

            setCategories(
              parsed
            )

          } catch (error) {

            console.error(
              "LOAD_CATEGORIES_ERROR",
              error
            )
          }
        }

      loadCategories()

    }, [])

    /* =========================================
       FORMAT SIZE
    ========================================= */

    const formatSize =
      useCallback(
        (
          size
        ) =>
          `${(
            size /
            1024 /
            1024
          ).toFixed(2)} MB`,
        []
      )

    /* =========================================
       UPDATE FILE
    ========================================= */

    const updateFile =
      useCallback(
        (
          id,
          updates
        ) => {

          setUploadedFiles(
            (
              prev
            ) => {

              const updated =
                prev.map(
                  (
                    file
                  ) =>
                    file.id === id
                      ? {
                          ...file,
                          ...updates,
                        }
                      : file
                )

              syncCache(
                updated
              )

              return updated
            }
          )
        },
        [syncCache]
      )

    /* =========================================
       CHECK PENDING
    ========================================= */

    const refreshPendingState =
      useCallback(
        (
          files
        ) => {

          const hasPending =
            files.some(
              (
                file
              ) =>
                file.statusType ===
                "pending"
            )

          setHasPendingUploads(
            hasPending
          )
        },
        []
      )

    /* =========================================
       CLEAR FILES
    ========================================= */

    const clearFiles =
      useCallback(
        () => {

          rawFilesRef.current.clear()

          setUploadedFiles([])

          syncCache([])

          setHasPendingUploads(
            false
          )

          setCurrentPage(1)
        },
        [syncCache]
      )

    /* =========================================
       UPLOAD SINGLE
    ========================================= */

    const uploadFile =
      useCallback(
        async (
          localId,
          file,
          category
        ) => {

          try {

            if (
              !file
            ) {

              throw new Error(
                "Original file reference is missing."
              )
            }

            const data =
              await uploadDocument(
                file,
                category
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

            const message =
              String(
                error?.message ||
                ""
              ).toLowerCase()

            /*
              DUPLICATE FILE HANDLING
            */

            const alreadyExists =
              message.includes(
                "already"
              ) ||
              message.includes(
                "exists"
              ) ||
              message.includes(
                "duplicate"
              )

            updateFile(
              localId,
              {
                status:
                  alreadyExists
                    ? "Already Exists"
                    : error.message ||
                      "Upload Failed",

                statusType:
                  alreadyExists
                    ? "warning"
                    : "error",
              }
            )
          }
        },
        [updateFile]
      )

    /* =========================================
       CONFIRM UPLOAD
    ========================================= */

    const confirmUpload =
      useCallback(
        async () => {

          if (
            uploadLockRef.current
          ) {
            return
          }

          uploadLockRef.current =
            true

          try {

            const pending =
              uploadedFiles.filter(
                (
                  file
                ) =>
                  file.statusType ===
                  "pending"
              )

            if (
              pending.length === 0
            ) {
              return
            }

            setHasPendingUploads(
              false
            )

            await Promise.all(
              pending.map(
                async (
                  file
                ) => {

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
                    rawFilesRef.current.get(
                      file.id
                    ),
                    file.category
                  )
                }
              )
            )

          } finally {

            uploadLockRef.current =
              false

            setUploadedFiles(
              (
                prev
              ) => {

                refreshPendingState(
                  prev
                )

                syncCache(
                  prev
                )

                return prev
              }
            )
          }
        },
        [
          uploadedFiles,
          uploadFile,
          updateFile,
          refreshPendingState,
          syncCache,
        ]
      )

    /* =========================================
       HANDLE FILES
    ========================================= */

    const handleFiles =
      useCallback(
        (
          files
        ) => {

          const validFiles =
            Array.from(
              files
            ).filter(
              (
                file
              ) =>
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
              ) => {

                const id =
                  crypto.randomUUID()

                rawFilesRef.current.set(
                  id,
                  file
                )

                return {
                  id,

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

                  category:
                    selectedCategory,

                  status:
                    "Pending",

                  statusType:
                    "pending",

                  uploadedAt:
                    new Date()
                      .toLocaleString(),
                }
              }
            )

          setUploadedFiles(
            (
              prev
            ) => {

              const existingNames =
                new Set(
                  prev.map(
                    (
                      file
                    ) =>
                      file.name
                  )
                )

              const deduplicated =
                mapped.filter(
                  (
                    file
                  ) =>
                    !existingNames.has(
                      file.name
                    )
                )

              const updated =
                [
                  ...deduplicated,
                  ...prev,
                ]

              refreshPendingState(
                updated
              )

              syncCache(
                updated
              )

              return updated
            }
          )
        },
        [
          formatSize,
          refreshPendingState,
          selectedCategory,
          syncCache,
        ]
      )

    const handleInputChange =
      useCallback(
        (
          event
        ) => {

          handleFiles(
            event.target.files
          )

          event.target.value =
            ""
        },
        [handleFiles]
      )

    const handleDrop =
      useCallback(
        (
          event
        ) => {

          event.preventDefault()

          handleFiles(
            event
              .dataTransfer
              .files
          )
        },
        [handleFiles]
      )

    const removeFile =
      useCallback(
        (
          id
        ) => {

          rawFilesRef.current.delete(
            id
          )

          setUploadedFiles(
            (
              prev
            ) => {

              const updated =
                prev.filter(
                  (
                    file
                  ) =>
                    file.id !== id
                )

              refreshPendingState(
                updated
              )

              syncCache(
                updated
              )

              return updated
            }
          )
        },
        [
          refreshPendingState,
          syncCache,
        ]
      )

    const showTable =
      uploadedFiles.length >
      0

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          uploadedFiles.length /
            ITEMS_PER_PAGE
        )
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
      showTable,

      categories,
      selectedCategory,
      setSelectedCategory,

      handleInputChange,
      handleDrop,

      removeFile,
      clearFiles,

      confirmUpload,

      setCurrentPage,
    }
  }

export default useFileUpload