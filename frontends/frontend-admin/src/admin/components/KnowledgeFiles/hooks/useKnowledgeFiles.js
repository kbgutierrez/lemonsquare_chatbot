import { useCallback, useMemo, useState } from "react"
import { API_CONFIG } from "../../../../shared/config/sqlVariables"
import useLiveQuery from "../../../../shared/hooks/useLiveQuery"
import { setCachedData } from "../../../../shared/cache/liveQueryCache"

import {
  deleteKnowledgeFile,
  getKnowledgeFiles,
  restoreKnowledgeFile,
  updateKnowledgeFile,
  hardDeleteKnowledgeFile,
} from "../services/knowledgeFilesService"

import aiSettingsService from "../../../services/aiSettingsService"

export const useKnowledgeFiles = () => {
  const POLLING_INTERVAL = API_CONFIG.POLLING_INTERVAL

  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("active")
  const [search, setSearch] = useState("")

  const CACHE_KEY = `knowledge_files_${selectedStatus}`

  const fetchKnowledgeFiles = useCallback(async () => {
    const [documents, settings] = await Promise.all([
      getKnowledgeFiles(selectedStatus),
      aiSettingsService.getSettings(),
    ])

    return {
      files: Array.isArray(documents)
        ? documents
        : [],
      categories:
        settings?.AllowedCategories
          ?.split(",")
          ?.map((c) => c.trim())
          ?.filter(Boolean) || [],
    }
  }, [selectedStatus])

  const {
    data,
    loading,
    refreshing,
    error,
    refresh,
  } = useLiveQuery({
    queryKey: CACHE_KEY,
    queryFn: fetchKnowledgeFiles,
    refetchInterval: POLLING_INTERVAL,
    staleWhileRevalidate: true,
  })

  const files = data?.files || []
  const allowedCategories =
    data?.categories || []

  /* ========================================
     STATUS STALE GUARD
  ======================================== */

  const isStatusStale = useMemo(() => {
    if (files.length === 0) {
      return false
    }

    const expectedActive =
      selectedStatus === "active"

    return files.some(
      (f) =>
        Boolean(f.is_active) !==
        expectedActive
    )
  }, [
    files,
    selectedStatus,
  ])

  /* ========================================
     ARCHIVE / SOFT DELETE
  ======================================== */

  const handleDelete =
    useCallback(
      async (documentId) => {
        const previous =
          structuredClone(data)

        try {
          const optimistic = {
            ...data,

            files: files.filter(
              (file) =>
                file.document_id !==
                documentId
            ),
          }

          setCachedData(
            CACHE_KEY,
            optimistic
          )

          await deleteKnowledgeFile(
            documentId
          )

          await refresh()
        } catch (error) {
          console.error(
            "DELETE_DOCUMENT_ERROR",
            error
          )

          setCachedData(
            CACHE_KEY,
            previous
          )

          await refresh()
        }
      },
      [
        CACHE_KEY,
        data,
        files,
        refresh,
      ]
    )

  /* ========================================
     HARD DELETE
  ======================================== */

  const handleHardDelete =
    useCallback(
      async (documentId) => {
        const previous =
          structuredClone(data)

        try {
          const optimistic = {
            ...data,

            files:
              files.filter(
                (file) =>
                  file.document_id !==
                  documentId
              ),
          }

          setCachedData(
            CACHE_KEY,
            optimistic
          )

          await hardDeleteKnowledgeFile(
            documentId
          )

          await refresh()
        } catch (error) {
          console.error(
            "HARD_DELETE_DOCUMENT_ERROR",
            error
          )

          setCachedData(
            CACHE_KEY,
            previous
          )

          await refresh()
        }
      },
      [
        CACHE_KEY,
        data,
        files,
        refresh,
      ]
    )

  /* ========================================
     RESTORE
  ======================================== */

  const handleRestore =
    useCallback(
      async (documentId) => {
        const previous =
          structuredClone(data)

        try {
          const optimistic = {
            ...data,

            files: files.filter(
              (file) =>
                file.document_id !==
                documentId
            ),
          }

          setCachedData(
            CACHE_KEY,
            optimistic
          )

          await restoreKnowledgeFile(
            documentId
          )

          await refresh()
        } catch (error) {
          console.error(
            "RESTORE_DOCUMENT_ERROR",
            error
          )

          setCachedData(
            CACHE_KEY,
            previous
          )

          await refresh()
        }
      },
      [
        CACHE_KEY,
        data,
        files,
        refresh,
      ]
    )

  /* ========================================
     UPDATE
  ======================================== */

  const handleUpdate =
    useCallback(
      async (
        documentId,
        payload
      ) => {
        const previous =
          structuredClone(data)

        try {
          const optimistic = {
            ...data,

            files: files.map(
              (file) =>
                file.document_id ===
                documentId
                  ? {
                      ...file,
                      ...payload,
                    }
                  : file
            ),
          }

          setCachedData(
            CACHE_KEY,
            optimistic
          )

          await updateKnowledgeFile(
            documentId,
            payload
          )

          await refresh()
        } catch (error) {
          console.error(
            "UPDATE_DOCUMENT_ERROR",
            error
          )

          setCachedData(
            CACHE_KEY,
            previous
          )

          await refresh()

          throw error
        }
      },
      [
        CACHE_KEY,
        data,
        files,
        refresh,
      ]
    )

  /* ========================================
     CATEGORIES
  ======================================== */

  const fileCategories =
    useMemo(() => {
      return [
        ...new Set(
          files
            .map(
              (f) =>
                f.category
            )
            .filter(Boolean)
        ),
      ]
    }, [files])

  const allCategories =
    useMemo(() => {
      const base =
        allowedCategories.length
          ? allowedCategories
          : fileCategories

      return [
        ...new Set(base),
      ]
    }, [
      allowedCategories,
      fileCategories,
    ])

  const dynamicCategories =
    useMemo(() => {
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
    }, [allCategories])

  /* ========================================
     FILTERED FILES
  ======================================== */

  const filteredFiles =
    useMemo(() => {
      const query =
        search.toLowerCase()

      const expectedActive =
        selectedStatus ===
        "active"

      return files.filter(
        (file) => {
          const name =
            file.file_name ||
            file.name ||
            ""

          const matchesCategory =
            selectedCategory ===
              "all" ||
            file.category ===
              selectedCategory

          const matchesSearch =
            name
              .toLowerCase()
              .includes(query)

          const matchesStatus =
            Boolean(
              file.is_active
            ) ===
            expectedActive

          return (
            matchesCategory &&
            matchesSearch &&
            matchesStatus
          )
        }
      )
    }, [
      files,
      selectedCategory,
      search,
      selectedStatus,
    ])

  return {
    files,
    loading,
    refreshing,
    error,

    isStatusStale,

    search,
    setSearch,

    selectedCategory,
    setSelectedCategory,

    selectedStatus,
    setSelectedStatus,

    dynamicCategories,
    allCategories,

    filteredFiles,

    loadFiles: refresh,

    handleDelete,
    handleHardDelete,
    handleRestore,
    handleUpdate,
  }
}

export default useKnowledgeFiles