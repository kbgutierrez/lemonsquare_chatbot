import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  deleteKnowledgeFile,
  getKnowledgeFiles,
  updateKnowledgeFile,
} from "../services/knowledgeFilesService"

import aiSettingsService
  from "../../../services/aiSettingsService"

export const useKnowledgeFiles =
  () => {

    /* ========================================
       REFS
    ======================================== */

    const mountedRef =
      useRef(true)

    /* ========================================
       STATE
    ======================================== */

    const [
      selectedCategory,
      setSelectedCategory,
    ] = useState("all")

    const [files, setFiles] =
      useState([])

    const [loading, setLoading] =
      useState(true)

    const [error, setError] =
      useState("")

    const [search, setSearch] =
      useState("")

    const [
      allowedCategories,
      setAllowedCategories,
    ] = useState([])

    /* ========================================
       CLEANUP
    ======================================== */

    useEffect(() => {

      mountedRef.current =
        true

      return () => {

        mountedRef.current =
          false
      }

    }, [])

    /* ========================================
       LOAD FILES
    ======================================== */

    const loadFiles =
      useCallback(
        async () => {

          try {

            if (
              mountedRef.current
            ) {

              setLoading(true)

              setError("")
            }

            const [
              documents,
              settings,
            ] = await Promise.all([
              getKnowledgeFiles(),

              aiSettingsService.getSettings(),
            ])

            if (
              !mountedRef.current
            ) {
              return
            }

            setFiles(
              Array.isArray(
                documents
              )
                ? documents
                : []
            )

            /* ========================================
               SETTINGS CATEGORIES
            ======================================== */

            const parsedCategories =
              settings?.AllowedCategories
                ?.split(",")

                ?.map(
                  (
                    category
                  ) =>
                    category.trim()
                )

                ?.filter(Boolean) || []

            setAllowedCategories(
              parsedCategories
            )

          } catch (error) {

            console.error(
              "LOAD_DOCUMENTS_ERROR",
              error
            )

            if (
              mountedRef.current
            ) {

              setFiles([])

              setError(
                error.message ||
                "Failed to load knowledge files."
              )
            }

          } finally {

            if (
              mountedRef.current
            ) {

              setLoading(false)
            }
          }
        },
        []
      )

    /* ========================================
       INITIAL LOAD
    ======================================== */

    useEffect(() => {

      loadFiles()

    }, [loadFiles])

    /* ========================================
       DELETE FILE
    ======================================== */

    const handleDelete =
      useCallback(
        async (
          documentId
        ) => {

          const confirmed =
            window.confirm(
              "Are you sure you want to permanently delete this document?"
            )

          if (!confirmed) {
            return
          }

          try {

            setError("")

            await deleteKnowledgeFile(
              documentId
            )

            await loadFiles()

          } catch (error) {

            console.error(
              "DELETE_DOCUMENT_ERROR",
              error
            )

            if (
              mountedRef.current
            ) {

              setError(
                error.message ||
                "Failed to delete document."
              )
            }
          }
        },
        [loadFiles]
      )

    /* ========================================
       UPDATE FILE
    ======================================== */

    const handleUpdate =
      useCallback(
        async (
          documentId,
          payload
        ) => {

          try {

            setError("")

            await updateKnowledgeFile(
              documentId,
              payload
            )

            await loadFiles()

          } catch (error) {

            console.error(
              "UPDATE_DOCUMENT_ERROR",
              error
            )

            if (
              mountedRef.current
            ) {

              setError(
                error.message ||
                "Failed to update document."
              )
            }

            throw error
          }
        },
        [loadFiles]
      )

    /* ========================================
       FILE CATEGORIES
    ======================================== */

    const fileCategories =
      useMemo(
        () => {

          return [
            ...new Set(
              files
                .map(
                  (file) =>
                    file.category
                )
                .filter(Boolean)
            ),
          ]

        },
        [files]
      )

    /* ========================================
       ALL CATEGORIES
    ======================================== */

    const allCategories =
      useMemo(
        () => {

          return [
            ...new Set([
              ...allowedCategories,
              ...fileCategories,
            ]),
          ]

        },
        [
          allowedCategories,
          fileCategories,
        ]
      )

    /* ========================================
       DYNAMIC CATEGORIES
    ======================================== */

    const dynamicCategories =
      useMemo(
        () => {

          return allCategories.map(
            (category) => ({
              id: category,

              name:
                category.replaceAll(
                  "_",
                  " "
                ),
            })
          )

        },
        [allCategories]
      )

    /* ========================================
       FILTERED FILES
    ======================================== */

    const filteredFiles =
      useMemo(
        () => {

          return files.filter(
            (file) => {

              const matchesCategory =
                selectedCategory ===
                  "all" ||
                file.category ===
                  selectedCategory

              const matchesSearch =
                file.file_name
                  ?.toLowerCase()
                  .includes(
                    search.toLowerCase()
                  )

              return (
                matchesCategory &&
                matchesSearch
              )
            }
          )
        },

        [
          files,
          selectedCategory,
          search,
        ]
      )

    return {
      files,
      loading,
      error,

      search,
      setSearch,

      selectedCategory,
      setSelectedCategory,

      dynamicCategories,

      allCategories,

      filteredFiles,

      loadFiles,

      handleDelete,
      handleUpdate,
    }

  }