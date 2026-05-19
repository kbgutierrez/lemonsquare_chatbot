import {
  useMemo,
  useState,
} from "react"

import {
  History,
  MessageSquare,
  ChevronRight,
  Trash2,
  Lock,
  ChevronLeft,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react"

import ModalShell from "../components/ModalShell.jsx"

import {
  useConversationHistory,
} from "../hooks/useConversationHistory"

const PAGE_SIZE = 3

const formatDate = (dateString) => {

  if (!dateString) return "Unknown"

  const date = new Date(dateString)

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const ChatHistoryModal = ({
  onClose,
  onLoadConversation,
}) => {

  const {
    loading,
    conversations,
    selectConversation,
    deleteConversation,
    clearAllHistory,
  } = useConversationHistory()

  const [page, setPage] = useState(1)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearingAll, setClearingAll] = useState(false)

  const totalPages = Math.max(
    1,
    Math.ceil(conversations.length / PAGE_SIZE)
  )

  const paginatedConversations = useMemo(() => {

    const start = (page - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE

    return conversations.slice(start, end)

  }, [conversations, page])

  const handleConversationClick = async (conversation) => {

    try {

      const result = selectConversation(conversation.id)

      onLoadConversation?.(result)
      onClose?.()

    } catch (error) {
      console.error("CONVERSATION_SELECT_ERROR", error)
    }
  }

  const handleDeleteConversation = async (event, sessionId) => {

    event.stopPropagation()

    try {
      await deleteConversation(sessionId)
    } catch (error) {
      console.error("DELETE_CONVERSATION_ERROR", error)
    }
  }

  const handleClearAll = async () => {

    try {

      setClearingAll(true)
      await clearAllHistory()

      setShowClearConfirm(false)
      setPage(1)

    } catch (error) {
      console.error("CLEAR_ALL_HISTORY_ERROR", error)
    } finally {
      setClearingAll(false)
    }
  }

  return (
    <>
      <ModalShell
        onClose={onClose}
        title="Previous Chats"
        subtitle="Conversation History"
        size="lg"
        icon={
          <History className="h-5 w-5 text-emerald-600" />
        }
        headerActions={
          conversations.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="
                rounded-xl

                border
                border-red-100

                bg-red-50

                px-3
                py-2

                text-xs
                font-semibold

                text-red-600

                transition-all
                duration-200

                hover:bg-red-100
              "
            >
              Clear All
            </button>
          )
        }
      >

        <div className="p-4 sm:p-5">

          {/* LOADING */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">

              <div className="
                h-9
                w-9
                animate-spin
                rounded-full
                border-4
                border-emerald-100
                border-t-emerald-500
              " />

              <p className="mt-4 text-sm text-slate-500">
                Loading conversations...
              </p>

            </div>
          )}

          {/* EMPTY */}
          {!loading && conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">

              <div className="
                flex
                h-14
                w-14
                items-center
                justify-center

                rounded-2xl

                bg-emerald-50
              ">
                <History className="h-7 w-7 text-emerald-500" />
              </div>

              <p className="mt-4 text-sm font-medium text-slate-700">
                No conversation history yet.
              </p>

            </div>
          )}

          {/* LIST */}
          {!loading && conversations.length > 0 && (
            <>

              <div className="space-y-3">

                {paginatedConversations.map((conversation) => {

                  const isResolved = Boolean(conversation.resolved)

                  return (
                    <div
                      key={conversation.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleConversationClick(conversation)}
                      className="
                        group

                        relative

                        w-full
                        cursor-pointer

                        overflow-hidden

                        rounded-2xl

                        border
                        border-emerald-100/60

                        bg-white/70

                        p-4

                        text-left

                        backdrop-blur-md

                        transition-all
                        duration-200

                        hover:-translate-y-0.5
                        hover:bg-emerald-50/60

                        active:scale-[0.99]
                      "
                    >

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={(e) =>
                          handleDeleteConversation(e, conversation.id)
                        }
                        className="
                          absolute
                          right-3
                          top-3

                          flex
                          h-7
                          w-7
                          items-center
                          justify-center

                          rounded-lg

                          text-slate-400

                          transition-all

                          hover:bg-red-50
                          hover:text-red-500
                        "
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-2">

                            {isResolved ? (
                              <Lock className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <MessageSquare className="h-4 w-4 text-emerald-500" />
                            )}

                            <p className="truncate text-sm font-semibold text-slate-900">
                              {conversation.title}
                            </p>

                          </div>

                          <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                            {conversation.preview}
                          </p>

                        </div>

                        <ChevronRight className="h-5 w-5 text-slate-400" />

                      </div>

                      <div className="mt-4 flex items-center justify-between">

                        <p className="text-[10px] text-slate-400">
                          {formatDate(conversation.updatedAt)}
                        </p>

                        <div className="flex gap-2">

                          {isResolved && (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-medium text-emerald-700">
                              Resolved
                            </span>
                          )}

                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                            {conversation.messageCount || 0} msgs
                          </span>

                        </div>

                      </div>

                    </div>
                  )

                })}

              </div>

              {/* PAGINATION */}
              <div className="mt-5 flex items-center justify-between">

                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="
                    flex
                    items-center
                    gap-2

                    rounded-xl

                    border
                    border-emerald-100

                    px-3
                    py-2

                    text-sm

                    disabled:opacity-40
                  "
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>

                <p className="text-xs text-slate-500">
                  {page} / {totalPages}
                </p>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="
                    flex
                    items-center
                    gap-2

                    rounded-xl

                    border
                    border-emerald-100

                    px-3
                    py-2

                    text-sm

                    disabled:opacity-40
                  "
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>

              </div>

            </>
          )}

        </div>

      </ModalShell>

      {/* CONFIRM MODAL */}
      {showClearConfirm && (
        <div className="
          fixed
          inset-0
          z-[999]

          flex
          items-center
          justify-center

          bg-black/40

          backdrop-blur-sm
          px-4
        ">

          <div className="
            relative
            w-full
            max-w-md

            rounded-2xl

            bg-white

            p-6

            shadow-2xl
          ">

            <button
              onClick={() => setShowClearConfirm(false)}
              className="absolute right-3 top-3 text-slate-400"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                Clear all chats?
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                This action cannot be undone.
              </p>

              <div className="mt-6 flex gap-3">

                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2 text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleClearAll}
                  className="flex-1 rounded-xl bg-red-600 py-2 text-sm text-white"
                >
                  {clearingAll ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Clearing
                    </span>
                  ) : (
                    "Clear"
                  )}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </>
  )
}

export default ChatHistoryModal