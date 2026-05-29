import { useMemo, useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, Archive } from "lucide-react"
import { useResolvedChats } from "./hooks/useResolvedChats"
import ResolvedChatsHeader from "./components/ResolvedChatsHeader"
import ResolvedChatsEmpty from "./components/ResolvedChatsEmpty"
import ResolvedChatsPagination from "./components/ResolvedChatsPagination"
import ResolvedChatCard from "./components/ResolvedChatCard"
import LoadingSpinner from "../../../shared/components/LoadingSpinner"

import ExportResolvedChatsModal
  from "./modals/ExportResolvedChatsModal"

const ITEMS_PER_PAGE = 6

const FILTERS = [
  { key: "active", label: "Active", icon: CheckCircle2 },
  { key: "inactive", label: "Inactive", icon: Archive },
]

const ResolvedChatsSection = () => {
  const [lifecycleFilter, setLifecycleFilter] = useState("active")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)


  const [
    exportModalOpen,
    setExportModalOpen,
  ] = useState(false)

  const {
    items,
    loading,
    isStatusStale,
    deleteChat,
    restoreChat,
  } = useResolvedChats(lifecycleFilter)

  const safeItems = Array.isArray(items) ? items : []

  /* ========================================
     FILTERING
  ======================================== */

  const filtered = useMemo(() => {
    const query = String(search || "").toLowerCase()
    return safeItems.filter((item) => {
      const content =
        typeof item?.content === "string"
          ? item.content
          : JSON.stringify(item?.content || {})
      const searchable = [content, item?.source, item?.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return searchable.includes(query)
    })
  }, [safeItems, search])

  /* ========================================
     PAGINATION
  ======================================== */

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))

  const paginatedItems = useMemo(() => {
    return filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  }, [filtered, page])

  /* ========================================
     RESET PAGE
  ======================================== */

  useEffect(() => {
    setPage(1)
  }, [search, lifecycleFilter])

  /* ========================================
     INVALID PAGE GUARD
  ======================================== */

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [totalPages, page])


  
  /* ========================================
     HANDLERS
  ======================================== */

  const handleDelete = async (sessionId) => {
    try {
      await deleteChat(sessionId)
    } catch (error) {
      console.error("DELETE_CHAT_ERROR", error)
    }
  }

  const handleRestore = async (sessionId) => {
    try {
      await restoreChat(sessionId)
    } catch (error) {
      console.error("RESTORE_CHAT_ERROR", error)
    }
  }

  const showSpinner = loading || isStatusStale

  return (
    <div className="flex h-full flex-col gap-5">
      {/* HEADER */}
      <ResolvedChatsHeader
        search={search}
        setSearch={setSearch}
        onExport={() =>
          setExportModalOpen(true)
        }
      />

      {/* FILTERS — flat text tabs, no card */}
      <div className="flex items-center gap-8 border-b theme-border px-4">
        {FILTERS.map((filter) => {
          const active = lifecycleFilter === filter.key
          const Icon = filter.icon
          return (
            <button
              key={filter.key}
              onClick={() => setLifecycleFilter(filter.key)}
              className={`relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors duration-200 ${
                active
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`} />
              {filter.label}
              {active && (
                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[var(--accent)]" />
              )}
            </button>
          )
        })}
      </div>

      {/* CONTENT — no card, blends into page */}
      <div
        key={lifecycleFilter}
        className="relative flex-1 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {showSpinner ? (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner label="Loading chats..." />
          </div>
        ) : paginatedItems.length === 0 ? (
          <ResolvedChatsEmpty
            title={lifecycleFilter === "inactive" ? "No inactive chats" : "No resolved chats"}
            message={
              lifecycleFilter === "inactive"
                ? "Archived AI-learned conversations will appear here."
                : "No active resolved chats are currently available."
            }
          />
        ) : (
          <div className="flex flex-col">
            <AnimatePresence initial={false} mode="sync">
              {paginatedItems.map((item, index) => (
                <ResolvedChatCard
                  key={item?.id || index}
                  item={item}
                  index={index}
                  lifecycle={lifecycleFilter}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {
        exportModalOpen && (
          <ExportResolvedChatsModal
            onClose={() =>
              setExportModalOpen(false)
            }
          />
        )
      }  

      {/* PAGINATION */}
      <ResolvedChatsPagination page={page} setPage={setPage} totalPages={totalPages} />
    </div>
  )
}

export default ResolvedChatsSection