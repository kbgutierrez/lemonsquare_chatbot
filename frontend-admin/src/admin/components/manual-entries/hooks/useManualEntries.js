import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

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
       REFS
    ======================================== */

    const mountedRef =
      useRef(true)

    const successTimeoutRef =
      useRef(null)

    /* ========================================
       STATE
    ======================================== */

    const [items, setItems] =
      useState([])

    const [loading, setLoading] =
      useState(true)

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
       LOAD DATA
    ======================================== */

    const loadData =
      useCallback(
        async () => {

          try {

            if (
              mountedRef.current
            ) {

              setLoading(true)

              setError("")
            }

            const data =
              await fetchManualEntries()

            console.log(
              "MANUAL_ENTRIES_LOADED",
              data
            )

            if (
              !mountedRef.current
            ) {
              return
            }

            setItems(
              Array.isArray(data)
                ? data
                : []
            )

          } catch (error) {

            console.error(
              "MANUAL_ENTRIES_ERROR",
              error
            )

            if (
              mountedRef.current
            ) {

              setError(
                error.message ||
                "Failed to load manual entries."
              )

              setItems([])
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

    useEffect(() => {

      loadData()

    }, [loadData])

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
              items
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

      }, [items])

    /* ========================================
       FILTERED ITEMS
    ======================================== */

    const filtered =
      useMemo(() => {

        const query =
          search.toLowerCase()

        return items.filter(
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
        items,
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

            console.log(
              "CREATE_ENTRY_FORM",
              form
            )

            const response =
              await createManualEntry(
                form
              )

            console.log(
              "CREATE_ENTRY_RESPONSE",
              response
            )

            await loadData()

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
        [loadData]
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

          if (
            entryId === undefined ||
            entryId === null ||
            entryId === ""
          ) {

            setError(
              "Missing manual entry ID."
            )

            return
          }

          try {

            setSubmitting(true)

            const response =
              await updateManualEntry(
                entryId,
                form
              )

            console.log(
              "UPDATE_ENTRY_RESPONSE",
              response
            )

            await loadData()

            if (
              mountedRef.current
            ) {

              setSuccessMessage(
                "✅ Entry updated successfully"
              )

              onFinish?.()
            }

          } catch (error) {

            console.error(
              "UPDATE_ENTRY_ERROR",
              error
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
        [loadData]
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

          if (
            entryId === undefined ||
            entryId === null ||
            entryId === ""
          ) {

            setError(
              "Missing manual entry ID."
            )

            return
          }

          const confirmed =
            window.confirm(
              "Delete this manual entry?"
            )

          if (
            !confirmed
          ) {
            return
          }

          try {

            setSubmitting(true)

            const response =
              await deleteManualEntry(
                entryId
              )

            console.log(
              "DELETE_ENTRY_RESPONSE",
              response
            )

            await loadData()

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
        [loadData]
      )

    return {
      items,
      loading,
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
        loadData,
    }
  }

export default useManualEntries