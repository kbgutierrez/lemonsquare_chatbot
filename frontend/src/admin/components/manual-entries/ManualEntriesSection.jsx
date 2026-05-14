import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Search,
  FileText,
  Plus,
  X,
} from "lucide-react"

import {
  API_CONFIG,
  API_ENDPOINTS,
} from "../../../config/sqlVariables"

const API_URL =
  `${API_CONFIG.BASE_URL}/documents/manual`

const CREATE_URL =
  `${API_CONFIG.BASE_URL}${API_ENDPOINTS.DOCUMENT_MANUAL_ENTRY}`

const ITEMS_PER_PAGE = 6

const ManualEntriesSection =
  () => {

    const [items, setItems] =
      useState([])

    const [loading, setLoading] =
      useState(true)

    const [search, setSearch] =
      useState("")

    const [page, setPage] =
      useState(1)

    const [showModal, setShowModal] =
      useState(false)

    const [submitting, setSubmitting] =
      useState(false)

    const [error, setError] =
      useState("")

    const [form, setForm] =
      useState({
        title: "",
        category: "",
        content: "",
      })

    /* ========================================
       NORMALIZE SQL RESPONSE
    ======================================== */

    const normalizeEntry =
      (item) => {

        return {
          id:
            item.EntryID ||
            item.entry_id ||
            item.id,

          title:
            item.Title ||
            item.title ||
            "",

          category:
            item.Category ||
            item.category ||
            "General",

          content:
            item.Content ||
            item.content ||
            "",

          created_at:
            item.CreatedAt ||
            item.created_at,
        }
      }

    /* ========================================
       LOAD MANUAL ENTRIES
    ======================================== */

    const loadData =
      async () => {

        try {

          setLoading(true)

          const response =
            await fetch(
              API_URL
            )

          if (
            !response.ok
          ) {

            throw new Error(
              `Failed to fetch entries (${response.status})`
            )
          }

          const data =
            await response.json()

          console.log(
            "MANUAL_ENTRIES_RESPONSE",
            data
          )

          const normalized =
            Array.isArray(
              data
            )
              ? data.map(
                  normalizeEntry
                )
              : []

          setItems(
            normalized
          )

        } catch (error) {

          console.error(
            "MANUAL_ENTRIES_ERROR",
            error
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
       FILTER
    ======================================== */

    const filtered =
      useMemo(() => {

        return items.filter(
          (item) =>
            (
              item.content ||
              item.title ||
              ""
            )
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
        )

      }, [items, search])

    /* ========================================
       PAGINATION
    ======================================== */

    const totalPages =
      Math.ceil(
        filtered.length /
          ITEMS_PER_PAGE
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

    const createEntry =
      async () => {

        setError("")

        if (
          !form.title.trim() ||
          !form.content.trim()
        ) {

          setError(
            "Title and content are required."
          )

          return
        }

        try {

          setSubmitting(true)

          console.log(
            "CREATE_MANUAL_ENTRY_PAYLOAD",
            form
          )

          const response =
            await fetch(
              CREATE_URL,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify(
                    form
                  ),
              }
            )

          const responseData =
            await response.json()

          console.log(
            "CREATE_MANUAL_ENTRY_RESPONSE",
            responseData
          )

          if (
            !response.ok
          ) {

            throw new Error(
              responseData?.detail ||
                responseData?.message ||
                "Failed to create manual entry."
            )
          }

          /* RELOAD LIST */
          await loadData()

          /* RESET */
          setForm({
            title: "",
            category: "",
            content: "",
          })

          setShowModal(
            false
          )

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

    return (
      <div className="flex h-full flex-col gap-5">

        {/* HEADER */}
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
          "
        >
          <div>
            <h1
              className="
                text-2xl
                font-bold
                text-white
              "
            >
              Manual Entries
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-[#8ea59b]
              "
            >
              Custom AI operational
              rules and manually fed
              knowledge.
            </p>
          </div>

          <div className="flex items-center gap-3">

            {/* SEARCH */}
            <div
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-2xl
                border
                border-[#2d3b35]
                bg-[#18211f]
                px-4
                py-3
                sm:w-[300px]
              "
            >
              <Search
                className="
                  h-4
                  w-4
                  text-[#70847b]
                "
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search entries..."
                className="
                  w-full
                  bg-transparent
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-[#70847b]
                "
              />
            </div>

            {/* ADD BUTTON */}
            <button
              onClick={() =>
                setShowModal(
                  true
                )
              }
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                bg-[#f5d547]
                px-5
                py-3
                text-sm
                font-semibold
                text-[#111917]
                transition-all
                duration-200
                hover:scale-[1.02]
              "
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div
          className="
            flex-1
            overflow-auto
            rounded-[28px]
            border
            border-[#26332d]
            bg-[#121a18]
            p-5
          "
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div
                className="
                  h-10
                  w-10
                  rounded-full
                  border-2
                  border-[#f5d547]/20
                  border-t-[#f5d547]
                  animate-spin
                "
              />
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">

                <FileText
                  className="
                    mx-auto
                    mb-4
                    h-10
                    w-10
                    text-[#f5d547]
                  "
                />

                <h3
                  className="
                    text-lg
                    font-semibold
                    text-white
                  "
                >
                  No manual entries
                </h3>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {paginatedItems.map(
                (item) => (
                  <div
                    key={item.id}
                    className="
                      rounded-3xl
                      border
                      border-[#26332d]
                      bg-[#18211f]
                      p-5
                    "
                  >
                    <div
                      className="
                        mb-3
                        flex
                        flex-wrap
                        items-center
                        gap-3
                      "
                    >
                      <span
                        className="
                          rounded-2xl
                          bg-[#95c11f]/10
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-[#95c11f]
                        "
                      >
                        {item.category}
                      </span>
                    </div>

                    <h3
                      className="
                        mb-2
                        text-lg
                        font-semibold
                        text-white
                      "
                    >
                      {item.title}
                    </h3>

                    <p
                      className="
                        whitespace-pre-wrap
                        text-sm
                        leading-relaxed
                        text-[#d7e0dc]
                      "
                    >
                      {item.content}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div
            className="
              flex
              items-center
              justify-center
              gap-2
            "
          >
            {Array.from(
              {
                length:
                  totalPages,
              },
              (_, i) =>
                i + 1
            ).map((number) => (
              <button
                key={number}
                onClick={() =>
                  setPage(
                    number
                  )
                }
                className={`
                  h-10
                  w-10
                  rounded-xl
                  text-sm
                  font-semibold
                  transition-all

                  ${
                    page === number
                      ? `
                        bg-[#f5d547]
                        text-[#111917]
                      `
                      : `
                        bg-[#18211f]
                        text-white
                        hover:bg-[#202b27]
                      `
                  }
                `}
              >
                {number}
              </button>
            ))}
          </div>
        )}

        {/* MODAL */}
        {showModal && (
          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/50
              p-4
            "
          >
            <div
              className="
                w-full
                max-w-2xl
                rounded-[32px]
                border
                border-[#2a3a33]
                bg-[#111917]
                p-6
              "
            >
              <div
                className="
                  mb-6
                  flex
                  items-center
                  justify-between
                "
              >
                <h2
                  className="
                    text-xl
                    font-bold
                    text-white
                  "
                >
                  Add Manual Entry
                </h2>

                <button
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  <X className="text-white" />
                </button>
              </div>

              <div className="space-y-4">

                {error && (
                  <div
                    className="
                      rounded-2xl
                      border
                      border-red-500/30
                      bg-red-500/10
                      px-4
                      py-3
                      text-sm
                      text-red-300
                    "
                  >
                    {error}
                  </div>
                )}

                <input
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title:
                        e.target.value,
                    })
                  }
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-[#2d3b35]
                    bg-[#18211f]
                    px-4
                    py-3
                    text-white
                    outline-none
                  "
                />

                <input
                  placeholder="Category (Optional)"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category:
                        e.target.value,
                    })
                  }
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-[#2d3b35]
                    bg-[#18211f]
                    px-4
                    py-3
                    text-white
                    outline-none
                  "
                />

                <textarea
                  rows={8}
                  placeholder="Knowledge content..."
                  value={form.content}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      content:
                        e.target.value,
                    })
                  }
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-[#2d3b35]
                    bg-[#18211f]
                    px-4
                    py-3
                    text-white
                    outline-none
                  "
                />

                <button
                  onClick={
                    createEntry
                  }
                  disabled={
                    submitting
                  }
                  className="
                    w-full
                    rounded-2xl
                    bg-[#f5d547]
                    py-3
                    font-semibold
                    text-[#111917]
                  "
                >
                  {submitting
                    ? "Creating..."
                    : "Create Entry"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

export default ManualEntriesSection