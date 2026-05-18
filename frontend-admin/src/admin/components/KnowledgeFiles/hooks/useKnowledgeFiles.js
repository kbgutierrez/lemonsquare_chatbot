import {
  useCallback,
  useMemo,
  useState,
} from "react"

import { API_CONFIG } from "../../../../shared/config/sqlVariables"

import useLiveQuery
  from "../../../../shared/hooks/useLiveQuery"

import {
  invalidateCache,
  setCachedData,
} from "../../../../shared/cache/liveQueryCache"

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
       CONSTANTS
    ======================================== */

    const CACHE_KEY =
      "knowledge_files"

    const POLLING_INTERVAL =
      API_CONFIG.POLLING_INTERVAL

    /* ========================================
       STATE
    ======================================== */

    const [
      selectedCategory,
      setSelectedCategory,
    ] = useState("all")

    const [search, setSearch] =
      useState("")

    /* ========================================
       FETCHER
    ======================================== */

    const fetchKnowledgeFiles =
      useCallback(
        async () => {

          const [
            documents,
            settings,
          ] = await Promise.all([
            getKnowledgeFiles(),

            aiSettingsService.getSettings(),
          ])

          const normalized =
            Array.isArray(
              documents
            )
              ? documents
              : []

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

          return {
            files:
              normalized,

            categories:
              parsedCategories,
          }
        },
        []
      )

    /* ========================================
       LIVE QUERY
    ======================================== */

    const {
      data,
      loading,
      refreshing,
      error,
      refresh,
    } = useLiveQuery({
      queryKey:
        CACHE_KEY,

      queryFn:
        fetchKnowledgeFiles,

      refetchInterval:
        POLLING_INTERVAL,

      staleWhileRevalidate:
        true,
    })

    const files =
      data?.files || []

    const allowedCategories =
      data?.categories || []

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

          if (
            !confirmed
          ) {
            return
          }

          const previous =
            data

          try {

            const optimistic =
              {
                ...data,

                files:
                  files.filter(
                    (file) =>
                      file.document_id !==
                      documentId
                  ),
              }

            /* OPTIMISTIC CACHE */

            setCachedData(
              CACHE_KEY,
              optimistic
            )

            await deleteKnowledgeFile(
              documentId
            )

            invalidateCache(
              CACHE_KEY
            )

            await refresh()

          } catch (error) {

            console.error(
              "DELETE_DOCUMENT_ERROR",
              error
            )

            /* ROLLBACK */

            setCachedData(
              CACHE_KEY,
              previous
            )
          }
        },
        [
          data,
          files,
          refresh,
        ]
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

          const previous =
            data

          try {

            const optimistic =
              {
                ...data,

                files:
                  files.map(
                    (file) => {

                      if (
                        file.document_id ===
                        documentId
                      ) {

                        return {
                          ...file,
                          ...payload,
                        }
                      }

                      return file
                    }
                  ),
              }

            /* OPTIMISTIC CACHE */

            setCachedData(
              CACHE_KEY,
              optimistic
            )

            await updateKnowledgeFile(
              documentId,
              payload
            )

            invalidateCache(
              CACHE_KEY
            )

            await refresh()

          } catch (error) {

            console.error(
              "UPDATE_DOCUMENT_ERROR",
              error
            )

            /* ROLLBACK */

            setCachedData(
              CACHE_KEY,
              previous
            )

            throw error
          }
        },
        [
          data,
          files,
          refresh,
        ]
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

          const query =
            search.toLowerCase()

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
                    query
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
      refreshing,

      error,

      search,
      setSearch,

      selectedCategory,
      setSelectedCategory,

      dynamicCategories,

      allCategories,

      filteredFiles,

      loadFiles:
        refresh,

      handleDelete,
      handleUpdate,
    }

  }