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

const useManualEntries =
  () => {

    /* ========================================
       CONSTANTS
    ======================================== */

    const CACHE_KEY =
      "manual_entries"

    const POLLING_INTERVAL =
      API_CONFIG.POLLING_INTERVAL

    /* ========================================
       REFS
    ======================================== */

    const mountedRef =
      useRef(true)

    const successTimeoutRef =
      useRef(null)

    /* ========================================
       STATE
    ======================================== */

    const [submitting, setSubmitting] =
      useState(false)

    const [error, setError] =
      useState("")

    const [
      successMessage,
      setSuccessMessage,
    ] = useState("")

    const [search, setSearch] =
      useState("")

    const [page, setPage] =
      useState(1)

    const [
      activeCategory,
      setActiveCategory,
    ] = useState("All")

    /* ========================================
       CLEANUP
    ======================================== */

    useEffect(() => {

      mountedRef.current =
        true

      return () => {

        mountedRef.current =
          false

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
      useCallback(
        async () => {

          const response =
            await fetchManualEntries()

          if (
            Array.isArray(
              response
            )
          ) {

            return response
          }

          /* SAFE OBJECT FALLBACK */

          if (
            Array.isArray(
              response?.data
            )
          ) {

            return response.data
          }

          console.warn(
            "INVALID_MANUAL_ENTRIES_RESPONSE",
            response
          )

          return []
        },
        []
      )

    /* ========================================
       LIVE QUERY
    ======================================== */

    const {
      data: items,

      loading,
      refreshing,

      refresh,
    } = useLiveQuery({
      queryKey:
        CACHE_KEY,

      queryFn:
        safeFetchManualEntries,

      initialData: [],

      refetchInterval:
        POLLING_INTERVAL,

      staleWhileRevalidate:
        true,
    })

    /* ========================================
       SAFE ARRAY
    ======================================== */

    const safeItems =
      useMemo(
        () => {

          return Array.isArray(
            items
          )
            ? items
            : []
        },
        [items]
      )

    /* ========================================
       AUTO HIDE SUCCESS
    ======================================== */

    useEffect(() => {

      if (
        !successMessage
      ) {
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
    ])

    /* ========================================
       CATEGORY TABS
    ======================================== */

    const categories =
      useMemo(() => {

        const unique =
          [
            ...new Set(
              safeItems
                .map(
                  (item) =>
                    item.category
                )
                .filter(Boolean)
            ),
          ]

        return [
          "All",
          ...unique,
        ]

      }, [safeItems])

    /* ========================================
       FILTERED ITEMS
    ======================================== */

    const filtered =
      useMemo(() => {

        const query =
          search.toLowerCase()

        return safeItems.filter(
          (item) => {

            const searchable =
              [
                item.title,
                item.content,
                item.category,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()

            const matchesSearch =
              searchable.includes(
                query
              )

            const matchesCategory =
              activeCategory ===
                "All" ||
              item.category ===
                activeCategory

            return (
              matchesSearch &&
              matchesCategory
            )
          }
        )

      }, [
        safeItems,
        search,
        activeCategory,
      ])

    /* ========================================
       PAGINATION
    ======================================== */

    const totalPages =
      useMemo(
        () =>
          Math.max(
            1,
            Math.ceil(
              filtered.length /
              ITEMS_PER_PAGE
            )
          ),
        [filtered]
      )

    const paginatedItems =
      useMemo(
        () =>
          filtered.slice(
            (page - 1) *
              ITEMS_PER_PAGE,

            page *
              ITEMS_PER_PAGE
          ),
        [
          filtered,
          page,
        ]
      )

    /* ========================================
       CREATE ENTRY
    ======================================== */

    const handleCreateEntry =
      useCallback(
        async (
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

            const optimistic =
              {
                id:
                  `temp-${Date.now()}`,

                title:
                  form.title,

                content:
                  form.content,

                category:
                  form.category ||
                  "General",
              }

            /* OPTIMISTIC CACHE */

            setCachedData(
              CACHE_KEY,
              [
                optimistic,
                ...safeItems,
              ]
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

            console.error(
              "CREATE_ENTRY_ERROR",
              error
            )

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
        },
        [
          safeItems,
          refresh,
        ]
      )

    /* ========================================
       UPDATE ENTRY
    ======================================== */

    const handleUpdateEntry =
      useCallback(
        async (
          entryId,
          form,
          onFinish
        ) => {

          setError("")

          const previous =
            [...safeItems]

          try {

            setSubmitting(true)

            const optimistic =
              safeItems.map(
                (item) => {

                  if (
                    item.id ===
                    entryId
                  ) {

                    return {
                      ...item,
                      ...form,
                    }
                  }

                  return item
                }
              )

            /* OPTIMISTIC CACHE */

            setCachedData(
              CACHE_KEY,
              optimistic
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

            console.error(
              "UPDATE_ENTRY_ERROR",
              error
            )

            /* ROLLBACK */

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
        },
        [
          safeItems,
          refresh,
        ]
      )

    /* ========================================
       DELETE ENTRY
    ======================================== */

    const handleDeleteEntry =
      useCallback(
        async (
          entryId
        ) => {

          setError("")

          const previous =
            [...safeItems]

          try {

            setSubmitting(true)

            const optimistic =
              safeItems.filter(
                (item) =>
                  item.id !==
                  entryId
              )

            /* OPTIMISTIC CACHE */

            setCachedData(
              CACHE_KEY,
              optimistic
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
                "🗑️ Entry deleted successfully"
              )
            }

          } catch (error) {

            console.error(
              "DELETE_ENTRY_ERROR",
              error
            )

            /* ROLLBACK */

            setCachedData(
              CACHE_KEY,
              previous
            )

            if (
              mountedRef.current
            ) {

              setError(
                error.message ||
                "Failed to delete entry."
              )
            }

          } finally {

            if (
              mountedRef.current
            ) {

              setSubmitting(false)
            }
          }
        },
        [
          safeItems,
          refresh,
        ]
      )

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

      activeCategory,
      setActiveCategory,

      paginatedItems,
      totalPages,

      handleCreateEntry,
      handleUpdateEntry,
      handleDeleteEntry,

      setError,

      reloadEntries:
        refresh,
    }

  }

export default useManualEntries