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
  restoreManualEntry,
} from "../services/manualEntriesService"

import aiSettingsService
  from "../../../services/aiSettingsService"

const ITEMS_PER_PAGE = 6
const SUCCESS_TIMEOUT = 3500
const CACHE_KEY = "manual_entries"

const useManualEntries = () => {

  /* ========================================
     REFS
  ======================================== */

  const mountedRef =
    useRef(true)

  const successTimeoutRef =
    useRef(null)

  /* ========================================
     UI STATE
  ======================================== */

  const [
    submitting,
    setSubmitting,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState("")

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("")

  const [
    search,
    setSearch,
  ] = useState("")

  const [
    page,
    setPage,
  ] = useState(1)

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("All")

  /*
    IMPORTANT:
    Default to ACTIVE because
    your backend initially returns
    active entries only.
  */

  const [
    activityFilter,
    setActivityFilter,
  ] = useState("active")

  /* ========================================
     CLEANUP
  ======================================== */

  useEffect(() => {

    mountedRef.current = true

    return () => {

      mountedRef.current = false

      if (
        successTimeoutRef.current
      ) {
        clearTimeout(
          successTimeoutRef.current
        )
      }
    }

  }, [])

  /* ========================================
     FETCHER
  ======================================== */

  const safeFetchManualEntries =
    useCallback(async () => {

      /*
        CRITICAL FIX:
        We now fetch a large limit
        to ensure inactive entries
        are included.

        Your backend appears to use
        soft delete visibility logic.
      */

      const [
        entriesResponse,
        settings,
      ] = await Promise.all([
        fetchManualEntries({
          limit: 9999,
        }),

        aiSettingsService.getSettings(),
      ])

      let entries = []

      if (
        Array.isArray(
          entriesResponse
        )
      ) {
        entries = entriesResponse
      } else if (
        Array.isArray(
          entriesResponse?.data
        )
      ) {
        entries =
          entriesResponse.data
      } else {
        console.warn(
          "INVALID_MANUAL_ENTRIES_RESPONSE",
          entriesResponse
        )
      }

      const allowedCategories =
        settings?.AllowedCategories
          ?.split(",")
          ?.map((c) =>
            c.trim()
          )
          ?.filter(Boolean) || []

      return {
        items: entries,
        allowedCategories,
      }

    }, [])

  /* ========================================
     LIVE QUERY
  ======================================== */

  const {
    data,
    loading,
    refreshing,
    refresh,
  } = useLiveQuery({
    queryKey:
      CACHE_KEY,

    queryFn:
      safeFetchManualEntries,

    initialData: {
      items: [],
      allowedCategories: [],
    },

    refetchInterval:
      API_CONFIG.POLLING_INTERVAL,

    staleWhileRevalidate:
      true,
  })

  const safeItems =
    useMemo(() => {

      return Array.isArray(
        data?.items
      )
        ? data.items
        : []

    }, [data])

  const allowedCategories =
    useMemo(() => {

      return Array.isArray(
        data?.allowedCategories
      )
        ? data.allowedCategories
        : []

    }, [data])

  /* ========================================
     SUCCESS AUTO CLEAR
  ======================================== */

  useEffect(() => {

    if (!successMessage) {
      return
    }

    successTimeoutRef.current =
      setTimeout(() => {

        if (
          mountedRef.current
        ) {
          setSuccessMessage("")
        }

      }, SUCCESS_TIMEOUT)

    return () => {

      if (
        successTimeoutRef.current
      ) {
        clearTimeout(
          successTimeoutRef.current
        )
      }
    }

  }, [successMessage])

  /* ========================================
     RESET PAGE ON FILTER
  ======================================== */

  useEffect(() => {

    setPage(1)

  }, [
    search,
    activeCategory,
    activityFilter,
  ])

  /* ========================================
     ENTRY CATEGORIES
  ======================================== */

  const entryCategories =
    useMemo(() => {

      return [
        ...new Set(
          safeItems
            .map((item) =>
              item.category
            )
            .filter(Boolean)
        ),
      ]

    }, [safeItems])

  /* ========================================
     CATEGORY MERGE
  ======================================== */

  const mergedCategories =
    useMemo(() => {

      const base =
        allowedCategories.length

          ? allowedCategories

          : entryCategories

      return [
        ...new Set(base),
      ]

    }, [
      allowedCategories,
      entryCategories,
    ])

  /* ========================================
     TABS CATEGORIES
  ======================================== */

  const categories =
    useMemo(() => {

      return [
        "All",
        ...mergedCategories,
      ]

    }, [mergedCategories])

  /* ========================================
     FILTER
  ======================================== */

  const filtered =
    useMemo(() => {

      const query =
        search.toLowerCase()

      return safeItems.filter(
        (item) => {

          const text = [
            item.title,
            item.content,
            item.category,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()

          const matchesSearch =
            text.includes(query)

          const matchesCategory =
            activeCategory ===
              "All" ||

            item.category ===
              activeCategory

          /*
            CRITICAL FIX:
            Explicit activity filtering
          */

          const matchesActivity =

            activityFilter ===
            "all"

              ? true

              : activityFilter ===
                "active"

                ? item.is_active === true

                : item.is_active === false

          return (
            matchesSearch &&
            matchesCategory &&
            matchesActivity
          )
        }
      )

    }, [
      safeItems,
      search,
      activeCategory,
      activityFilter,
    ])

  /* ========================================
     PAGINATION
  ======================================== */

  const totalPages =
    useMemo(() => {

      return Math.max(
        1,
        Math.ceil(
          filtered.length /
            ITEMS_PER_PAGE
        )
      )

    }, [filtered])

  const paginatedItems =
    useMemo(() => {

      return filtered.slice(
        (page - 1) *
          ITEMS_PER_PAGE,

        page *
          ITEMS_PER_PAGE
      )

    }, [
      filtered,
      page,
    ])

  /* ========================================
     CREATE
  ======================================== */

  const handleCreateEntry =
    useCallback(async (
      form,
      resetForm,
      closeModal
    ) => {

      setError("")

      if (
        !form.title?.trim() ||
        !form.content?.trim()
      ) {
        setError(
          "Title and content are required."
        )

        return
      }

      try {

        setSubmitting(true)

        const optimistic = {
          id:
            `temp-${Date.now()}`,

          title:
            form.title,

          content:
            form.content,

          category:
            form.category ||
            "General",

          is_active: true,
        }

        setCachedData(
          CACHE_KEY,
          {
            ...data,

            items: [
              optimistic,
              ...safeItems,
            ],
          }
        )

        const response =
          await createManualEntry(
            form
          )

        invalidateCache(
          CACHE_KEY
        )

        await refresh()

        if (
          mountedRef.current
        ) {

          setSuccessMessage(
            `✨ AI categorized entry as ${
              response?.category ||
              form?.category ||
              "General"
            }`
          )

          resetForm?.()

          closeModal?.()
        }

      } catch (error) {

        invalidateCache(
          CACHE_KEY
        )

        await refresh()

        if (
          mountedRef.current
        ) {
          setError(
            error.message ||
              "Failed to create entry."
          )
        }

      } finally {

        if (
          mountedRef.current
        ) {
          setSubmitting(false)
        }
      }

    }, [
      data,
      safeItems,
      refresh,
    ])

  /* ========================================
     UPDATE
  ======================================== */

  const handleUpdateEntry =
    useCallback(async (
      entryId,
      form,
      onFinish
    ) => {

      setError("")

      const previous = data

      try {

        setSubmitting(true)

        const optimistic =
          safeItems.map(
            (item) =>

              item.id ===
              entryId

                ? {
                    ...item,
                    ...form,
                  }

                : item
          )

        setCachedData(
          CACHE_KEY,
          {
            ...data,
            items: optimistic,
          }
        )

        await updateManualEntry(
          entryId,
          form
        )

        invalidateCache(
          CACHE_KEY
        )

        await refresh()

        if (
          mountedRef.current
        ) {

          setSuccessMessage(
            "Entry updated successfully"
          )

          onFinish?.()
        }

      } catch (error) {

        setCachedData(
          CACHE_KEY,
          previous
        )

        if (
          mountedRef.current
        ) {
          setError(
            error.message ||
              "Failed to update entry."
          )
        }

      } finally {

        if (
          mountedRef.current
        ) {
          setSubmitting(false)
        }
      }

    }, [
      data,
      safeItems,
      refresh,
    ])

  /* ========================================
     DELETE / DEACTIVATE
  ======================================== */

  const handleDeleteEntry =
    useCallback(async (
      entryId
    ) => {

      setError("")

      const previous = data

      try {

        setSubmitting(true)

        /*
          IMPORTANT:
          Do NOT remove from array.
          Mark inactive instead.
        */

        const optimistic =
          safeItems.map(
            (item) =>

              item.id ===
              entryId

                ? {
                    ...item,
                    is_active: false,
                  }

                : item
          )

        setCachedData(
          CACHE_KEY,
          {
            ...data,
            items: optimistic,
          }
        )

        await deleteManualEntry(
          entryId
        )

        invalidateCache(
          CACHE_KEY
        )

        await refresh()

        if (
          mountedRef.current
        ) {

          setSuccessMessage(
            "Entry moved to inactive"
          )
        }

      } catch (error) {

        setCachedData(
          CACHE_KEY,
          previous
        )

        if (
          mountedRef.current
        ) {
          setError(
            error.message ||
              "Failed to deactivate entry."
          )
        }

      } finally {

        if (
          mountedRef.current
        ) {
          setSubmitting(false)
        }
      }

    }, [
      data,
      safeItems,
      refresh,
    ])

  /* ========================================
     RESTORE
  ======================================== */

  const handleRestoreEntry =
    useCallback(async (
      entryId
    ) => {

      setError("")

      const previous = data

      try {

        setSubmitting(true)

        const optimistic =
          safeItems.map(
            (item) =>

              item.id ===
              entryId

                ? {
                    ...item,
                    is_active: true,
                  }

                : item
          )

        setCachedData(
          CACHE_KEY,
          {
            ...data,
            items: optimistic,
          }
        )

        await restoreManualEntry(
          entryId
        )

        invalidateCache(
          CACHE_KEY
        )

        await refresh()

        if (
          mountedRef.current
        ) {

          setSuccessMessage(
            "Entry restored successfully"
          )
        }

      } catch (error) {

        setCachedData(
          CACHE_KEY,
          previous
        )

        if (
          mountedRef.current
        ) {
          setError(
            error.message ||
              "Failed to restore entry."
          )
        }

      } finally {

        if (
          mountedRef.current
        ) {
          setSubmitting(false)
        }
      }

    }, [
      data,
      safeItems,
      refresh,
    ])

  /* ========================================
     EXPORT
  ======================================== */

  return {
    items:
      safeItems,

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
    allowedCategories,

    activeCategory,
    setActiveCategory,

    activityFilter,
    setActivityFilter,

    paginatedItems,
    totalPages,

    handleCreateEntry,
    handleUpdateEntry,
    handleDeleteEntry,
    handleRestoreEntry,

    setError,

    reloadEntries:
      refresh,
  }
}

export default useManualEntries