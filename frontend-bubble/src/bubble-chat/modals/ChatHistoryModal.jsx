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

const formatDate = (
  dateString
) => {

  if (!dateString) {
    return "Unknown"
  }

  const date =
    new Date(dateString)

  return date.toLocaleString(
    [],
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  )
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
  } =
    useConversationHistory()

  const [page, setPage] =
    useState(1)

  const [
    showClearConfirm,
    setShowClearConfirm,
  ] = useState(false)

  const [
    clearingAll,
    setClearingAll,
  ] = useState(false)

  /* ========================================
     PAGINATION
  ======================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        conversations.length /
        PAGE_SIZE
      )
    )

  const paginatedConversations =
    useMemo(
      () => {

        const start =
          (page - 1) *
          PAGE_SIZE

        const end =
          start + PAGE_SIZE

        return conversations.slice(
          start,
          end
        )

      },
      [
        conversations,
        page,
      ]
    )

  /* ========================================
     LOAD CONVERSATION
  ======================================== */

  const handleConversationClick =
    async (
      conversation
    ) => {

      try {

        const result =
          selectConversation(
            conversation.id
          )

        console.log(
          "SELECTED_CONVERSATION",
          result
        )

        onLoadConversation?.(
          result
        )

        onClose?.()

      } catch (error) {

        console.error(
          "CONVERSATION_SELECT_ERROR",
          error
        )
      }
    }

  /* ========================================
     DELETE
  ======================================== */

  const handleDeleteConversation =
    async (
      event,
      sessionId
    ) => {

      event.stopPropagation()

      try {

        await deleteConversation(
          sessionId
        )

      } catch (error) {

        console.error(
          "DELETE_CONVERSATION_ERROR",
          error
        )
      }
    }

  /* ========================================
     CLEAR ALL
  ======================================== */

  const handleClearAll =
    async () => {

      try {

        setClearingAll(
          true
        )

        await clearAllHistory()

        setShowClearConfirm(
          false
        )

        setPage(1)

      } catch (error) {

        console.error(
          "CLEAR_ALL_HISTORY_ERROR",
          error
        )

      } finally {

        setClearingAll(
          false
        )
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
          <History
            className="
              h-5
              w-5
            "
          />
        }
        headerActions={
          conversations.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setShowClearConfirm(
                  true
                )
              }
              className="
                rounded-xl

                border
                border-red-100

                bg-red-50

                px-3
                py-2

                text-xs
                font-medium

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
        <div
          className="
            p-4
            sm:p-5
          "
        >
          {/* LOADING */}
          {loading && (
            <div
              className="
                flex
                flex-col
                items-center
                justify-center

                py-20
              "
            >
              <div
                className="
                  h-10
                  w-10

                  animate-spin

                  rounded-full

                  border-4
                  border-violet-200
                  border-t-violet-600
                "
              />

              <p
                className="
                  mt-4

                  text-sm

                  text-slate-500
                "
              >
                Loading conversations...
              </p>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            conversations.length === 0 && (
              <div
                className="
                  flex
                  flex-col
                  items-center
                  justify-center

                  py-20

                  text-center
                "
              >
                <div
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center

                    rounded-3xl

                    bg-violet-100
                  "
                >
                  <History
                    className="
                      h-8
                      w-8

                      text-violet-400
                    "
                  />
                </div>

                <p
                  className="
                    mt-5

                    text-sm
                    font-medium

                    text-slate-700
                  "
                >
                  No conversation history yet.
                </p>
              </div>
            )}

          {/* LIST */}
          {!loading &&
            conversations.length > 0 && (
              <>
                <div
                  className="
                    space-y-3
                  "
                >
                  {paginatedConversations.map(
                    (
                      conversation
                    ) => {

                      const isResolved =
                        Boolean(
                          conversation.resolved
                        )

                      return (
                        <div
                          key={
                            conversation.id
                          }
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            handleConversationClick(
                              conversation
                            )
                          }
                          className="
                            group
                            relative
                            w-full

                            cursor-pointer

                            overflow-hidden

                            rounded-3xl

                            border
                            border-violet-100/80

                            bg-white/90

                            p-4

                            text-left

                            shadow-sm

                            transition-all
                            duration-300

                            hover:-translate-y-0.5
                            hover:bg-violet-50/90

                            active:scale-[0.99]
                          "
                        >
                          {/* DELETE */}
                          <button
                            type="button"
                            onClick={(
                              event
                            ) =>
                              handleDeleteConversation(
                                event,
                                conversation.id
                              )
                            }
                            className="
                              absolute
                              right-3
                              top-3

                              z-20

                              flex
                              h-8
                              w-8
                              items-center
                              justify-center

                              rounded-xl

                              text-slate-400

                              transition-all
                              duration-200

                              hover:bg-red-50
                              hover:text-red-500
                            "
                          >
                            <Trash2
                              className="
                                h-4
                                w-4
                              "
                            />
                          </button>

                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-3
                            "
                          >
                            <div
                              className="
                                min-w-0
                                flex-1
                              "
                            >
                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                "
                              >
                                {isResolved ? (
                                  <Lock
                                    className="
                                      h-4
                                      w-4
                                      shrink-0

                                      text-emerald-600
                                    "
                                  />
                                ) : (
                                  <MessageSquare
                                    className="
                                      h-4
                                      w-4
                                      shrink-0

                                      text-violet-600
                                    "
                                  />
                                )}

                                <p
                                  className="
                                    truncate

                                    text-sm
                                    font-semibold

                                    text-slate-900
                                  "
                                >
                                  {
                                    conversation.title
                                  }
                                </p>
                              </div>

                              <p
                                className="
                                  mt-2

                                  line-clamp-2

                                  text-xs
                                  leading-relaxed

                                  text-slate-500
                                "
                              >
                                {
                                  conversation.preview
                                }
                              </p>
                            </div>

                            <ChevronRight
                              className="
                                mt-1
                                h-5
                                w-5
                                shrink-0

                                text-slate-400
                              "
                            />
                          </div>

                          <div
                            className="
                              mt-4

                              flex
                              flex-wrap
                              items-center
                              justify-between

                              gap-3
                            "
                          >
                            <p
                              className="
                                text-[10px]

                                text-slate-400
                              "
                            >
                              {formatDate(
                                conversation.updatedAt
                              )}
                            </p>

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                              "
                            >
                              {isResolved && (
                                <span
                                  className="
                                    rounded-full

                                    bg-emerald-100

                                    px-2
                                    py-1

                                    text-[10px]
                                    font-medium

                                    text-emerald-700
                                  "
                                >
                                  Resolved
                                </span>
                              )}

                              <span
                                className="
                                  rounded-full

                                  bg-violet-100

                                  px-2
                                  py-1

                                  text-[10px]
                                  font-medium

                                  text-violet-700
                                "
                              >
                                {
                                  conversation.messageCount || 0
                                }{" "}
                                messages
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>

                {/* PAGINATION */}
                <div
                  className="
                    mt-5

                    flex
                    items-center
                    justify-between
                  "
                >
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                      setPage(
                        (prev) =>
                          Math.max(
                            1,
                            prev - 1
                          )
                      )
                    }
                    className="
                      flex
                      items-center
                      gap-2

                      rounded-2xl

                      border
                      border-slate-200

                      px-4
                      py-2

                      text-sm

                      disabled:opacity-40
                    "
                  >
                    <ChevronLeft
                      className="
                        h-4
                        w-4
                      "
                    />

                    Previous
                  </button>

                  <p
                    className="
                      text-xs
                      text-slate-500
                    "
                  >
                    Page {page} of {totalPages}
                  </p>

                  <button
                    type="button"
                    disabled={
                      page === totalPages
                    }
                    onClick={() =>
                      setPage(
                        (prev) =>
                          Math.min(
                            totalPages,
                            prev + 1
                          )
                      )
                    }
                    className="
                      flex
                      items-center
                      gap-2

                      rounded-2xl

                      border
                      border-slate-200

                      px-4
                      py-2

                      text-sm

                      disabled:opacity-40
                    "
                  >
                    Next

                    <ChevronRight
                      className="
                        h-4
                        w-4
                      "
                    />
                  </button>
                </div>
              </>
            )}
        </div>
      </ModalShell>

      {/* CLEAR ALL CONFIRMATION */}
      {showClearConfirm && (
        <div
          className="
            fixed
            inset-0
            z-[999]

            flex
            items-center
            justify-center

            bg-black/50

            px-4

            backdrop-blur-sm
          "
        >
          <div
            className="
              relative

              w-full
              max-w-md

              overflow-hidden

              rounded-3xl

              border
              border-red-100

              bg-white

              p-6

              shadow-2xl
            "
          >
            {/* CLOSE */}
            <button
              type="button"
              disabled={clearingAll}
              onClick={() =>
                setShowClearConfirm(
                  false
                )
              }
              className="
                absolute
                right-4
                top-4

                flex
                h-8
                w-8
                items-center
                justify-center

                rounded-xl

                text-slate-400

                transition-all

                hover:bg-slate-100
                hover:text-slate-700
              "
            >
              <X
                className="
                  h-4
                  w-4
                "
              />
            </button>

            <div
              className="
                flex
                flex-col
                items-center

                text-center
              "
            >
              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center

                  rounded-3xl

                  bg-red-100
                "
              >
                <AlertTriangle
                  className="
                    h-8
                    w-8

                    text-red-600
                  "
                />
              </div>

              <h3
                className="
                  mt-5

                  text-xl
                  font-semibold

                  text-slate-900
                "
              >
                Clear All Conversations?
              </h3>

              <p
                className="
                  mt-3

                  text-sm
                  leading-relaxed

                  text-slate-500
                "
              >
                This will archive every active
                conversation from your history.
                This action cannot be undone from
                the chat widget.
              </p>

              <div
                className="
                  mt-6

                  flex
                  w-full
                  gap-3
                "
              >
                <button
                  type="button"
                  disabled={clearingAll}
                  onClick={() =>
                    setShowClearConfirm(
                      false
                    )
                  }
                  className="
                    flex-1

                    rounded-2xl

                    border
                    border-slate-200

                    px-4
                    py-3

                    text-sm
                    font-medium

                    text-slate-700

                    transition-all

                    hover:bg-slate-100

                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={clearingAll}
                  onClick={
                    handleClearAll
                  }
                  className="
                    flex
                    flex-1
                    items-center
                    justify-center
                    gap-2

                    rounded-2xl

                    bg-red-600

                    px-4
                    py-3

                    text-sm
                    font-medium

                    text-white

                    transition-all

                    hover:bg-red-700

                    disabled:cursor-not-allowed
                    disabled:opacity-70
                  "
                >
                  {clearingAll ? (
                    <>
                      <Loader2
                        className="
                          h-4
                          w-4
                          animate-spin
                        "
                      />

                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2
                        className="
                          h-4
                          w-4
                        "
                      />

                      Clear All
                    </>
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