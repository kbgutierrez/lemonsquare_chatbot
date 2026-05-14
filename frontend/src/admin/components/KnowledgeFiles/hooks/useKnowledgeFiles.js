import {
  useCallback,
  useEffect,
  useMemo,
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

    const [search, setSearch] =
      useState("")

    const [
      allowedCategories,
      setAllowedCategories,
    ] = useState([])

    /* ========================================
       LOAD FILES
    ======================================== */

    const loadFiles =
      useCallback(
        async () => {

          try {

            setLoading(true)

            const [
              documents,
              settings,
            ] = await Promise.all([
              getKnowledgeFiles(),

              aiSettingsService.getSettings(),
            ])

            setFiles(
              documents
            )

            /* ========================================
               SETTINGS CATEGORIES
            ======================================== */

            const parsedCategories =
              settings?.AllowedCategories
                ?.split(",")

                .map(
                  (
                    category
                  ) =>
                    category.trim()
                )

                .filter(Boolean) || []

            setAllowedCategories(
              parsedCategories
            )

          } catch (error) {

            console.error(
              "LOAD_DOCUMENTS_ERROR",
              error
            )

          } finally {

            setLoading(false)
          }
        },
        []
      )

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

            await deleteKnowledgeFile(
              documentId
            )

            await loadFiles()

          } catch (error) {

            console.error(
              "DELETE_DOCUMENT_ERROR",
              error
            )
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