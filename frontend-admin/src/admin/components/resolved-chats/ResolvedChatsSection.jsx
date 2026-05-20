import { useMemo, useState, useEffect } from "react"

import { AnimatePresence } from "framer-motion"

import { useResolvedChats } from "./hooks/useResolvedChats"

import ResolvedChatsHeader from "./components/ResolvedChatsHeader"
import ResolvedChatsEmpty from "./components/ResolvedChatsEmpty"
import ResolvedChatsPagination from "./components/ResolvedChatsPagination"
import ResolvedChatCard from "./components/ResolvedChatCard"

const ITEMS_PER_PAGE = 6

const ResolvedChatsSection = () => {
  const { items, loading, deleteChat } = useResolvedChats()

  const safeItems = Array.isArray(items) ? items : []

  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  /* ========================================
     FILTERING (STABLE)
  ======================================== */
  const filtered = useMemo(() => {
    const query = String(search || "").toLowerCase()

    return safeItems.filter((item) => {
      const content = String(item?.content || "").toLowerCase()
      const source = String(item?.source || "").toLowerCase()

      return content.includes(query) || source.includes(query)
    })
  }, [safeItems, search])

  /* ========================================
     PAGINATION (DERIVED)
  ======================================== */
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / ITEMS_PER_PAGE)
  )

  const paginatedItems = useMemo(() => {
    return filtered.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    )
  }, [filtered, page])

  /* ========================================
     FIX: RESET PAGE ON SEARCH CHANGE
  ======================================== */
  useEffect(() => {
    setPage(1)
  }, [search])

  /* ========================================
     FIX: PREVENT INVALID PAGE STATE
  ======================================== */
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [totalPages, page])

  /* ========================================
     DELETE HANDLER
  ======================================== */
  const handleDelete = async (sessionId) => {
    try {
      await deleteChat(sessionId)
    } catch (error) {
      console.error("DELETE_CHAT_ERROR", error)
    }
  }

  return (
    <div className="flex h-full flex-col gap-5">
      <ResolvedChatsHeader search={search} setSearch={setSearch} />

      <div className="flex-1 overflow-auto rounded-[28px] border border-[#26332d] bg-[#121a18] p-5">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#f5d547]/20 border-t-[#f5d547]" />
          </div>
        ) : paginatedItems.length === 0 ? (
          <ResolvedChatsEmpty />
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {paginatedItems.map((item, index) => (
                <ResolvedChatCard
                  key={item?.id || index}
                  item={item}
                  index={index}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ResolvedChatsPagination
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />
    </div>
  )
}

export default ResolvedChatsSection