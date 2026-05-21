import {
  useCallback,
  useMemo,
  useState,
} from "react"

import { API_CONFIG } from "../../../../shared/config/sqlVariables"

import useLiveQuery from "../../../../shared/hooks/useLiveQuery"

import {
  setCachedData,
} from "../../../../shared/cache/liveQueryCache"

import {
  deleteKnowledgeFile,
  getKnowledgeFiles,
  updateKnowledgeFile,
} from "../services/knowledgeFilesService"

import aiSettingsService from "../../../services/aiSettingsService"

export const useKnowledgeFiles = () => {

  /* ========================================
     CONSTANTS
  ======================================== */

  const CACHE_KEY = "knowledge_files"
  const POLLING_INTERVAL = API_CONFIG.POLLING_INTERVAL

  /* ========================================
     STATE
  ======================================== */

  const [selectedCategory, setSelectedCategory] = useState("all")
  const [search, setSearch] = useState("")

  /* ========================================
     FETCHER
  ======================================== */

  const fetchKnowledgeFiles = useCallback(async () => {
    const [documents, settings] = await Promise.all([
      getKnowledgeFiles(),
      aiSettingsService.getSettings(),
    ])

    return {
      files: Array.isArray(documents) ? documents : [],
      categories:
        settings?.AllowedCategories
          ?.split(",")
          ?.map((c) => c.trim())
          ?.filter(Boolean) || [],
    }
  }, [])

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
    queryKey: CACHE_KEY,
    queryFn: fetchKnowledgeFiles,
    refetchInterval: POLLING_INTERVAL,
    staleWhileRevalidate: true,
  })

  const files = data?.files || []
  const allowedCategories = data?.categories || []

  /* ========================================
     DELETE FILE (OPTIMISTIC SAFE)
  ======================================== */

  const handleDelete = useCallback(async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this document?"
    )

    if (!confirmed) return

    const previous = structuredClone(data)

    try {
      const optimistic = {
        ...data,
        files: files.filter(
          (file) => file.document_id !== documentId
        ),
      }

      setCachedData(CACHE_KEY, optimistic)

      await deleteKnowledgeFile(documentId)

      await refresh()

    } catch (error) {
      console.error("DELETE_DOCUMENT_ERROR", error)
      setCachedData(CACHE_KEY, previous)
      await refresh()
    }
  }, [data, files, refresh])

  /* ========================================
     UPDATE FILE (OPTIMISTIC SAFE)
  ======================================== */

  const handleUpdate = useCallback(async (documentId, payload) => {
    const previous = structuredClone(data)

    try {
      const optimistic = {
        ...data,
        files: files.map((file) =>
          file.document_id === documentId
            ? { ...file, ...payload }
            : file
        ),
      }

      setCachedData(CACHE_KEY, optimistic)

      await updateKnowledgeFile(documentId, payload)

      await refresh()

    } catch (error) {
      console.error("UPDATE_DOCUMENT_ERROR", error)
      setCachedData(CACHE_KEY, previous)
      await refresh()
      throw error
    }
  }, [data, files, refresh])

  /* ========================================
     FILE CATEGORIES
  ======================================== */

  const fileCategories = useMemo(() => {
    return [...new Set(
      files.map((f) => f.category).filter(Boolean)
    )]
  }, [files])

  /* ========================================
     SAFE CATEGORY MERGE (FIXED)
  ======================================== */

  const allCategories = useMemo(() => {
    const base = allowedCategories.length
      ? allowedCategories
      : fileCategories

    return [...new Set(base)]
  }, [allowedCategories, fileCategories])

  const dynamicCategories = useMemo(() => {
    return allCategories.map((category) => ({
      id: category,
      name: category.replaceAll("_", " "),
    }))
  }, [allCategories])

  /* ========================================
     FILTERED FILES (SAFER)
  ======================================== */

  const filteredFiles = useMemo(() => {
    const query = search.toLowerCase()

    return files.filter((file) => {
      const name =
        file.file_name ||
        file.name ||
        ""

      const matchesCategory =
        selectedCategory === "all" ||
        file.category === selectedCategory

      const matchesSearch =
        name.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })
  }, [files, selectedCategory, search])

  /* ========================================
     RETURN
  ======================================== */

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

    loadFiles: refresh,

    handleDelete,
    handleUpdate,
  }
}

export default useKnowledgeFiles