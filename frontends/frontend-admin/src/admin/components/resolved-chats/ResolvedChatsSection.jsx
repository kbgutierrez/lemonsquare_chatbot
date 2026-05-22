import {
  useMemo,
  useState,
  useEffect,
} from "react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import {
  CheckCircle2,
  Archive,
} from "lucide-react"

import {
  useResolvedChats,
} from "./hooks/useResolvedChats"

import ResolvedChatsHeader from "./components/ResolvedChatsHeader"
import ResolvedChatsEmpty from "./components/ResolvedChatsEmpty"
import ResolvedChatsPagination from "./components/ResolvedChatsPagination"
import ResolvedChatCard from "./components/ResolvedChatCard"

const ITEMS_PER_PAGE = 6

const FILTERS = [
  {
    key: "active",
    label: "Active",
    icon: CheckCircle2,
  },
  {
    key: "inactive",
    label: "Inactive",
    icon: Archive,
  },
]

const ResolvedChatsSection = () => {

  const [
    lifecycleFilter,
    setLifecycleFilter,
  ] = useState("active")

  /*
    IMPORTANT FIX:

    lifecycle now controls
    backend fetching itself.
  */

  const {
    items,
    loading,

    deleteChat,
    restoreChat,
  } = useResolvedChats(
    lifecycleFilter
  )

  const safeItems =
    Array.isArray(items)
      ? items
      : []

  const [
    search,
    setSearch,
  ] = useState("")

  const [
    page,
    setPage,
  ] = useState(1)

  /* ========================================
     FILTERING
  ======================================== */

  const filtered =
    useMemo(() => {

      const query =
        String(search || "")
          .toLowerCase()

      return safeItems.filter(
        (item) => {

          const content =
            typeof item?.content ===
            "string"

              ? item.content
              : JSON.stringify(
                  item?.content || {}
                )

          const searchable =
            [
              content,
              item?.source,
              item?.category,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()

          return searchable.includes(
            query
          )
        }
      )

    }, [
      safeItems,
      search,
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
     RESET PAGE
  ======================================== */

  useEffect(() => {

    setPage(1)

  }, [
    search,
    lifecycleFilter,
  ])

  /* ========================================
     INVALID PAGE GUARD
  ======================================== */

  useEffect(() => {

    if (
      page > totalPages
    ) {
      setPage(totalPages)
    }

  }, [
    totalPages,
    page,
  ])

  /* ========================================
     ARCHIVE
  ======================================== */

  const handleDelete =
    async (
      sessionId
    ) => {

      try {

        await deleteChat(
          sessionId
        )

      } catch (error) {

        console.error(
          "DELETE_CHAT_ERROR",
          error
        )
      }
    }

  /* ========================================
     RESTORE
  ======================================== */

  const handleRestore =
    async (
      sessionId
    ) => {

      try {

        await restoreChat(
          sessionId
        )

      } catch (error) {

        console.error(
          "RESTORE_CHAT_ERROR",
          error
        )
      }
    }

  return (
    <div className="flex h-full flex-col gap-5">

      {/* HEADER */}
      <ResolvedChatsHeader
        search={search}
        setSearch={setSearch}
      />

      {/* FILTERS */}
      <div className="rounded-[32px] border border-[#26332d] bg-[#101715] p-2">

        <div className="grid grid-cols-2 gap-2">

          {FILTERS.map(
            (filter) => {

              const active =
                lifecycleFilter ===
                filter.key

              const Icon =
                filter.icon

              return (
                <motion.button
                  key={filter.key}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={() =>
                    setLifecycleFilter(
                      filter.key
                    )
                  }
                  className={`group relative overflow-hidden rounded-[24px] border px-6 py-5 transition-all duration-300 ${
                    active
                      ? "border-[#314136] bg-[#16211d]"
                      : "border-transparent bg-transparent hover:bg-[#141c19]"
                  }`}
                >

                  <AnimatePresence>

                    {active && (
                      <motion.div
                        layoutId="resolved-chat-filter-bg"
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.25,
                        }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(149,193,31,0.08),transparent_70%)]"
                      />
                    )}

                  </AnimatePresence>

                  <motion.div
                    animate={{
                      opacity:
                        active
                          ? 1
                          : 0,

                      scaleX:
                        active
                          ? 1
                          : 0.4,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className="absolute bottom-0 left-1/2 h-[3px] w-[55%] -translate-x-1/2 rounded-full bg-[#f5d547]"
                  />

                  <div className="relative z-10 flex items-center justify-center gap-2">

                    <Icon
                      className={`h-4 w-4 transition-colors duration-300 ${
                        active
                          ? "text-[#dff7a3]"
                          : "text-[#7f948c]"
                      }`}
                    />

                    <span
                      className={`text-sm font-semibold transition-colors duration-300 ${
                        active
                          ? "text-white"
                          : "text-[#8ca29a]"
                      }`}
                    >

                      {filter.label}

                    </span>

                  </div>

                </motion.button>
              )
            }
          )}

        </div>

      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto rounded-[28px] border border-[#26332d] bg-[#121a18] p-5">

        {loading ? (
          <div className="flex h-full items-center justify-center">

            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#f5d547]/20 border-t-[#f5d547]" />

          </div>
        ) : paginatedItems.length === 0 ? (
          <ResolvedChatsEmpty
            title={
              lifecycleFilter ===
              "inactive"

                ? "No inactive chats"

                : "No resolved chats"
            }
            message={
              lifecycleFilter ===
              "inactive"

                ? "Archived AI-learned conversations will appear here."

                : "No active resolved chats are currently available."
            }
          />
        ) : (
          <div className="grid gap-4">

            <AnimatePresence mode="popLayout">

              {paginatedItems.map(
                (
                  item,
                  index
                ) => (
                  <ResolvedChatCard
                    key={
                      item?.id ||
                      index
                    }
                    item={item}
                    index={index}
                    lifecycle={
                      lifecycleFilter
                    }
                    onDelete={
                      handleDelete
                    }
                    onRestore={
                      handleRestore
                    }
                  />
                )
              )}

            </AnimatePresence>

          </div>
        )}

      </div>

      {/* PAGINATION */}
      <ResolvedChatsPagination
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />

    </div>
  )
}

export default ResolvedChatsSection