import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  API_CONFIG,
} from "../../../../shared/config/sqlVariables"

import useLiveQuery
  from "../../../../shared/hooks/useLiveQuery"

import {
  invalidateCache,
  setCachedData,
} from "../../../../shared/cache/liveQueryCache"

import {
  fetchManualEntries,
  createManualEntry,
  updateManualEntry,
  deleteManualEntry,
} from "../services/manualEntriesService"

const ITEMS_PER_PAGE = 6
const SUCCESS_TIMEOUT = 3500
const CACHE_KEY = "manual_entries"

const useManualEntries = () => {
  /* ========================================
     REFS
  ======================================== */

  const mountedRef = useRef(true)
  const successTimeoutRef = useRef(null)

  /* ========================================
     UI STATE
  ======================================== */

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [activeCategory, setActiveCategory] = useState("All")

  /* ========================================
     CLEANUP
  ======================================== */

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
    }
  }, [])

  /* ========================================
     FETCHER
  ======================================== */

  const safeFetchManualEntries = useCallback(async () => {
    const response = await fetchManualEntries()

    if (Array.isArray(response)) return response
    if (Array.isArray(response?.data)) return response.data

    console.warn("INVALID_MANUAL_ENTRIES_RESPONSE", response)
    return []
  }, [])

  /* ========================================
     LIVE QUERY
  ======================================== */

  const {
    data: items,
    loading,
    refreshing,
    refresh,
  } = useLiveQuery({
    queryKey: CACHE_KEY,
    queryFn: safeFetchManualEntries,
    initialData: [],
    refetchInterval: API_CONFIG.POLLING_INTERVAL,
    staleWhileRevalidate: true,
  })

  const safeItems = useMemo(
    () => (Array.isArray(items) ? items : []),
    [items]
  )

  /* ========================================
     SUCCESS AUTO CLEAR
  ======================================== */

  useEffect(() => {
    if (!successMessage) return

    successTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setSuccessMessage("")
      }
    }, SUCCESS_TIMEOUT)

    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
    }
  }, [successMessage])

  /* ========================================
     RESET PAGE ON FILTER
  ======================================== */

  useEffect(() => {
    setPage(1)
  }, [search, activeCategory])

  /* ========================================
     CATEGORIES (DERIVED)
  ======================================== */

  const categories = useMemo(() => {
    const unique = [
      ...new Set(
        safeItems
          .map((i) => i.category)
          .filter(Boolean)
      ),
    ]

    return ["All", ...unique]
  }, [safeItems])

  /* ========================================
     FILTER
  ======================================== */

  const filtered = useMemo(() => {
    const query = search.toLowerCase()

    return safeItems.filter((item) => {
      const text = [
        item.title,
        item.content,
        item.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchesSearch = text.includes(query)
      const matchesCategory =
        activeCategory === "All" ||
        item.category === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [safeItems, search, activeCategory])

  /* ========================================
     PAGINATION
  ======================================== */

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE)),
    [filtered]
  )

  const paginatedItems = useMemo(
    () =>
      filtered.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
      ),
    [filtered, page]
  )

  /* ========================================
     CREATE (OPTIMISTIC)
  ======================================== */

  const handleCreateEntry = useCallback(
    async (form, resetForm, closeModal) => {
      setError("")

      if (!form.title?.trim() || !form.content?.trim()) {
        setError("Title and content are required.")
        return
      }

      try {
        setSubmitting(true)

        const optimistic = {
          id: `temp-${Date.now()}`,
          title: form.title,
          content: form.content,
          category: form.category || "General",
        }

        setCachedData(CACHE_KEY, [optimistic, ...safeItems])

        const response = await createManualEntry(form)

        invalidateCache(CACHE_KEY)
        await refresh()

        if (mountedRef.current) {
          setSuccessMessage(
            `✨ AI categorized entry as ${
              response?.category || form?.category || "General"
            }`
          )

          resetForm?.()
          closeModal?.()
        }
      } catch (error) {
        invalidateCache(CACHE_KEY)
        await refresh()

        if (mountedRef.current) {
          setError(error.message || "Failed to create entry.")
        }
      } finally {
        if (mountedRef.current) setSubmitting(false)
      }
    },
    [safeItems, refresh]
  )

  /* ========================================
     UPDATE (OPTIMISTIC + ROLLBACK CLEAN)
  ======================================== */

  const handleUpdateEntry = useCallback(
    async (entryId, form, onFinish) => {
      setError("")

      const previous = safeItems

      try {
        setSubmitting(true)

        const optimistic = safeItems.map((item) =>
          item.id === entryId ? { ...item, ...form } : item
        )

        setCachedData(CACHE_KEY, optimistic)

        await updateManualEntry(entryId, form)

        invalidateCache(CACHE_KEY)
        await refresh()

        if (mountedRef.current) {
          setSuccessMessage("Entry updated successfully")
          onFinish?.()
        }
      } catch (error) {
        setCachedData(CACHE_KEY, previous)

        if (mountedRef.current) {
          setError(error.message || "Failed to update entry.")
        }
      } finally {
        if (mountedRef.current) setSubmitting(false)
      }
    },
    [safeItems, refresh]
  )

  /* ========================================
     DELETE (OPTIMISTIC)
  ======================================== */

  const handleDeleteEntry = useCallback(
    async (entryId) => {
      setError("")

      const previous = safeItems

      try {
        setSubmitting(true)

        const optimistic = safeItems.filter((i) => i.id !== entryId)

        setCachedData(CACHE_KEY, optimistic)

        await deleteManualEntry(entryId)

        invalidateCache(CACHE_KEY)
        await refresh()

        if (mountedRef.current) {
          setSuccessMessage("🗑️ Entry deleted successfully")
        }
      } catch (error) {
        setCachedData(CACHE_KEY, previous)

        if (mountedRef.current) {
          setError(error.message || "Failed to delete entry.")
        }
      } finally {
        if (mountedRef.current) setSubmitting(false)
      }
    },
    [safeItems, refresh]
  )

  /* ========================================
     EXPORT
  ======================================== */

  return {
    items: safeItems,

    loading,
    refreshing,

    submitting,

    error,
    successMessage,

    search,
    setSearch,

    page,
    setPage,

    categories,

    activeCategory,
    setActiveCategory,

    paginatedItems,
    totalPages,

    handleCreateEntry,
    handleUpdateEntry,
    handleDeleteEntry,

    setError,
    reloadEntries: refresh,
  }
}

export default useManualEntries