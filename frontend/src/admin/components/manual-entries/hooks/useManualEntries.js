import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  fetchManualEntries,
  createManualEntry,
  updateManualEntry,
  deleteManualEntry,
} from "../services/manualEntriesService"

const ITEMS_PER_PAGE = 6

const useManualEntries =
  () => {

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
       LOAD DATA
    ======================================== */

    const loadData =
      async () => {

        try {

          setLoading(true)

          setError("")

          const data =
            await fetchManualEntries()

          console.log(
            "MANUAL_ENTRIES_LOADED",
            data
          )

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

          setError(
            error.message ||
              "Failed to load manual entries."
          )

          setItems([])

        } finally {

          setLoading(false)
        }
      }

    useEffect(() => {

      loadData()

    }, [])

    /* ========================================
       AUTO HIDE SUCCESS
    ======================================== */

    useEffect(() => {

      if (
        !successMessage
      ) {
        return
      }

      const timeout =
        setTimeout(() => {

          setSuccessMessage(
            ""
          )

        }, 3500)

      return () =>
        clearTimeout(
          timeout
        )

    }, [successMessage])

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
       FILTER
    ======================================== */

    const filtered =
      useMemo(() => {

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
                search.toLowerCase()
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
      Math.max(
        1,
        Math.ceil(
          filtered.length /
            ITEMS_PER_PAGE
        )
      )

    const paginatedItems =
      filtered.slice(
        (page - 1) *
          ITEMS_PER_PAGE,

        page *
          ITEMS_PER_PAGE
      )

    /* ========================================
       CREATE ENTRY
    ======================================== */

    const handleCreateEntry =
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

          setSuccessMessage(
            `✨ AI categorized entry as ${
              response?.category ||
              form?.category ||
              "General"
            }`
          )

          if (
            resetForm
          ) {

            resetForm()
          }

          if (
            closeModal
          ) {

            closeModal()
          }

        } catch (error) {

          console.error(
            "CREATE_ENTRY_ERROR",
            error
          )

          setError(
            error.message ||
              "Failed to create entry."
          )

        } finally {

          setSubmitting(false)
        }
      }

    /* ========================================
       UPDATE ENTRY
    ======================================== */

    const handleUpdateEntry =
      async (
        entryId,
        form,
        onFinish
      ) => {

        setError("")

        console.log(
          "HANDLE_UPDATE_ENTRY_ID",
          entryId
        )

        console.log(
          "HANDLE_UPDATE_ENTRY_FORM",
          form
        )

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

          setSuccessMessage(
            "✅ Entry updated successfully"
          )

          if (
            onFinish
          ) {

            onFinish()
          }

        } catch (error) {

          console.error(
            "UPDATE_ENTRY_ERROR",
            error
          )

          setError(
            error.message ||
              "Failed to update entry."
          )

        } finally {

          setSubmitting(false)
        }
      }

    /* ========================================
       DELETE ENTRY
    ======================================== */

    const handleDeleteEntry =
      async (
        entryId
      ) => {

        console.log(
          "HANDLE_DELETE_ENTRY_ID",
          entryId
        )

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

          setSuccessMessage(
            "🗑️ Entry deleted successfully"
          )

        } catch (error) {

          console.error(
            "DELETE_ENTRY_ERROR",
            error
          )

          setError(
            error.message ||
              "Failed to delete entry."
          )

        } finally {

          setSubmitting(false)
        }
      }

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