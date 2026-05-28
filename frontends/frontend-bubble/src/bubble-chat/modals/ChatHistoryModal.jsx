import { useMemo, useState } from "react"
import {
  History,
  MessageSquare,
  Trash2,
  Lock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react"

import ModalShell from "../components/ModalShell.jsx"

import { useConversationHistory }
  from "../hooks/useConversationHistory"

import { useTheme }
  from "../context/ThemeContext.jsx"

import { cn }
  from "../utils/cn"

const PAGE_SIZE = 3

const formatDate = (
  dateString
) => {

  if (!dateString) {
    return "Unknown"
  }

  return new Date(
    dateString
  ).toLocaleString(
    [],
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  )
}

const PaginationButton = ({
  children,
  disabled,
  onClick,
  theme,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}

    className={cn(
      "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm disabled:opacity-40"
    )}

    style={{
      borderColor:
        theme.inputBorder,

      backgroundColor:
        theme.windowWrapperBg,

      color:
        theme.agentText,
    }}
  >
    {children}
  </button>
)

const EmptyState = ({
  theme,
}) => (
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
        h-14
        w-14
        items-center
        justify-center
        rounded-2xl
      "

      style={{
        backgroundColor:
          theme.agentBubbleBg,
      }}
    >
      <History
        className="h-7 w-7"

        style={{
          color:
            theme.accent,
        }}
      />
    </div>

    <p
      className="
        mt-4
        text-sm
        font-medium
      "

      style={{
        color:
          theme.agentText,
      }}
    >
      No conversation history yet.
    </p>
  </div>
)

const LoadingState = ({
  theme,
}) => (
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
        h-9
        w-9
        animate-spin
        rounded-full
        border-4
      "

      style={{
        borderColor:
          theme.agentBubbleBorder,

        borderTopColor:
          theme.accent,
      }}
    />

    <p
      className="mt-4 text-sm"

      style={{
        color:
          theme.agentTimestamp,
      }}
    >
      Loading conversations...
    </p>
  </div>
)

const ConversationCard = ({
  conversation,
  onSelect,
  onDelete,
  theme,
}) => {

  const isLocked =
    Boolean(
      conversation.locked
    )

  const isResolved =
    Boolean(
      conversation.resolved
    )

  const isEscalated =
    Boolean(
      conversation.escalated
    )

  return (
    <div
      role="button"

      tabIndex={0}

      onClick={onSelect}

      className={cn(
        `
          group
          relative
          w-full
          cursor-pointer
          overflow-hidden
          rounded-2xl
          border
          p-4
          backdrop-blur-md
          transition-all
          duration-200
          hover:-translate-y-0.5
          active:scale-[0.99]
        `
      )}

      style={{
        backgroundColor:
          theme.agentBubbleBg,

        borderColor:
          theme.agentBubbleBorder,
      }}
    >

      <div
        className="
          flex
          items-start
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

            {isLocked ? (
              <Lock
                className="
                  h-4
                  w-4
                  shrink-0
                "

                style={{
                  color:
                    theme.accent,
                }}
              />
            ) : (
              <MessageSquare
                className="
                  h-4
                  w-4
                  shrink-0
                "

                style={{
                  color:
                    theme.accent,
                }}
              />
            )}

            <p
              className="
                truncate
                text-sm
                font-semibold
              "

              style={{
                color:
                  theme.agentText,
              }}
            >
              {conversation.title}
            </p>
          </div>

          <p
            className="
              mt-2
              line-clamp-2
              text-xs
            "

            style={{
              color:
                theme.agentTimestamp,
            }}
          >
            {conversation.preview}
          </p>
        </div>

        <button
          type="button"

          onClick={onDelete}

          className={cn(
            `
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              transition-all
              hover:scale-105
              active:scale-95
            `
          )}

          style={{
            backgroundColor:
              theme.windowWrapperBg,

            color:
              theme.agentTimestamp,
          }}

          title="Delete conversation"
        >
          <Trash2
            className="h-4 w-4"
          />
        </button>
      </div>

      <div
        className="
          mt-4
          flex
          items-center
          justify-between
        "
      >

        <p
          className="text-[10px]"

          style={{
            color:
              theme.agentTimestamp,
          }}
        >
          {formatDate(
            conversation.updatedAt
          )}
        </p>

        <div
          className="
            flex
            flex-wrap
            gap-2
            justify-end
          "
        >

          {isResolved && (
            <span
              className="
                rounded-full
                px-2
                py-1
                text-[10px]
                font-medium
              "

              style={{
                backgroundColor:
                  theme.resolvedBannerBg,

                color:
                  theme.resolvedBannerText,
              }}
            >
              Resolved
            </span>
          )}

          {isEscalated && (
            <span
              className="
                rounded-full
                px-2
                py-1
                text-[10px]
                font-medium
              "

              style={{
                backgroundColor:
                  theme.resolvedBannerBg,

                color:
                  theme.resolvedBannerText,
              }}
            >
              Escalated
            </span>
          )}

          {isLocked &&
            !isResolved &&
            !isEscalated && (
              <span
                className="
                  rounded-full
                  px-2
                  py-1
                  text-[10px]
                  font-medium
                "

                style={{
                  backgroundColor:
                    theme.resolvedBannerBg,

                  color:
                    theme.resolvedBannerText,
                }}
              >
                Locked
              </span>
            )}

          <span
            className="
              rounded-full
              px-2
              py-1
              text-[10px]
              font-medium
            "

            style={{
              backgroundColor:
                theme.agentBubbleBorder,

              color:
                theme.agentText,
            }}
          >
            {conversation.messageCount || 0} msgs
          </span>
        </div>
      </div>
    </div>
  )
}

const DeleteConfirmModal = ({
  onClose,
  onConfirm,
  deleting,
  theme,
  title,
}) => (
  <div
    className={cn(
      `
        fixed
        inset-0
        z-[999]
        flex
        items-center
        justify-center
        bg-black/40
        backdrop-blur-sm
        px-4
      `
    )}
  >

    <div
      className={cn(
        `
          relative
          w-full
          max-w-md
          rounded-2xl
          p-6
          shadow-2xl
        `
      )}

      style={{
        backgroundColor:
          theme.windowWrapperBg,

        border:
          `1px solid ${theme.inputBorder}`,
      }}
    >

      <button
        onClick={onClose}

        className="
          absolute
          right-3
          top-3
        "

        style={{
          color:
            theme.agentTimestamp,
        }}
      >
        <X
          className="h-4 w-4"
        />
      </button>

      <div className="text-center">

        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
          "

          style={{
            backgroundColor:
              theme.agentBubbleBg,
          }}
        >
          <AlertTriangle
            className="h-7 w-7"

            style={{
              color:
                theme.accent,
            }}
          />
        </div>

        <h3
          className="
            mt-4
            text-lg
            font-semibold
          "

          style={{
            color:
              theme.agentText,
          }}
        >
          Delete "{title}"?
        </h3>

        <p
          className="
            mt-2
            text-sm
          "

          style={{
            color:
              theme.agentTimestamp,
          }}
        >
          This conversation will be permanently removed.
        </p>

        <div
          className="
            mt-6
            flex
            gap-3
          "
        >

          <button
            onClick={onClose}

            className="
              flex-1
              rounded-xl
              border
              py-2
              text-sm
            "

            style={{
              borderColor:
                theme.inputBorder,

              backgroundColor:
                theme.windowWrapperBg,

              color:
                theme.agentText,
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}

            disabled={deleting}

            className="
              flex-1
              rounded-xl
              py-2
              text-sm
              text-white
            "

            style={{
              backgroundColor:
                "#dc2626",
            }}
          >

            {deleting ? (
              <span
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                <Loader2
                  className="
                    h-4
                    w-4
                    animate-spin
                  "
                />

                Deleting
              </span>
            ) : (
              "Delete"
            )}

          </button>
        </div>
      </div>
    </div>
  </div>
)

const ClearAllConfirmModal = ({
  onClose,
  onConfirm,
  clearing,
  theme,
}) => (
  <div
    className={cn(
      `
        fixed
        inset-0
        z-[999]
        flex
        items-center
        justify-center
        bg-black/40
        backdrop-blur-sm
        px-4
      `
    )}
  >

    <div
      className={cn(
        `
          relative
          w-full
          max-w-md
          rounded-2xl
          p-6
          shadow-2xl
        `
      )}

      style={{
        backgroundColor:
          theme.windowWrapperBg,

        border:
          `1px solid ${theme.inputBorder}`,
      }}
    >

      <button
        onClick={onClose}

        className="
          absolute
          right-3
          top-3
        "

        style={{
          color:
            theme.agentTimestamp,
        }}
      >
        <X
          className="h-4 w-4"
        />
      </button>

      <div className="text-center">

        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
          "

          style={{
            backgroundColor:
              theme.agentBubbleBg,
          }}
        >
          <AlertTriangle
            className="h-7 w-7"

            style={{
              color:
                theme.accent,
            }}
          />
        </div>

        <h3
          className="
            mt-4
            text-lg
            font-semibold
          "

          style={{
            color:
              theme.agentText,
          }}
        >
          Clear all chats?
        </h3>

        <p
          className="
            mt-2
            text-sm
          "

          style={{
            color:
              theme.agentTimestamp,
          }}
        >
          This action cannot be undone.
        </p>

        <div
          className="
            mt-6
            flex
            gap-3
          "
        >

          <button
            onClick={onClose}

            className="
              flex-1
              rounded-xl
              border
              py-2
              text-sm
            "

            style={{
              borderColor:
                theme.inputBorder,

              backgroundColor:
                theme.windowWrapperBg,

              color:
                theme.agentText,
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}

            disabled={clearing}

            className="
              flex-1
              rounded-xl
              py-2
              text-sm
              text-white
            "

            style={{
              backgroundColor:
                "#dc2626",
            }}
          >

            {clearing ? (
              <span
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                <Loader2
                  className="
                    h-4
                    w-4
                    animate-spin
                  "
                />

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
)

const ChatHistoryModal = ({
  onClose,
  onLoadConversation,
}) => {

  const { theme } =
    useTheme()

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

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null)

  const [deleting, setDeleting] =
    useState(false)

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        conversations.length /
          PAGE_SIZE
      )
    )

  const paginatedConversations =
    useMemo(() => {

      const start =
        (page - 1) *
        PAGE_SIZE

      return conversations.slice(
        start,
        start + PAGE_SIZE
      )

    }, [
      conversations,
      page,
    ])

  const handleConversationClick =
    async conversation => {

      try {

        const result =
          selectConversation(
            conversation.id
          )

        onLoadConversation?.(
          result
        )

        onClose?.()

      } catch (e) {

        console.error(
          "CONVERSATION_SELECT_ERROR",
          e
        )
      }
    }

  const handleDeleteClick =
    (
      event,
      conversation
    ) => {

      event.stopPropagation()

      setDeleteTarget(
        conversation
      )
    }

  const handleConfirmDelete =
    async () => {

      if (!deleteTarget) {
        return
      }

      try {

        setDeleting(true)

        await deleteConversation(
          deleteTarget.id
        )

        setDeleteTarget(
          null
        )

      } catch (e) {

        console.error(
          "DELETE_CONVERSATION_ERROR",
          e
        )

      } finally {

        setDeleting(false)
      }
    }

  const handleClearAll =
    async () => {

      try {

        setClearingAll(true)

        await clearAllHistory()

        setShowClearConfirm(
          false
        )

        setPage(1)

      } catch (e) {

        console.error(
          "CLEAR_ALL_HISTORY_ERROR",
          e
        )

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
          <History
            className="h-5 w-5"

            style={{
              color:
                theme.headerText,
            }}
          />
        }

        headerActions={
          conversations.length >
            0 && (
            <button
              type="button"

              onClick={() =>
                setShowClearConfirm(
                  true
                )
              }

              className={cn(
                `
                  rounded-xl
                  border
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  transition-all
                  duration-200
                `
              )}

              style={{
                backgroundColor:
                  theme.agentBubbleBg,

                borderColor:
                  theme.agentBubbleBorder,

                color:
                  theme.agentText,
              }}
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

          {loading && (
            <LoadingState
              theme={theme}
            />
          )}

          {!loading &&
            conversations.length ===
              0 && (
              <EmptyState
                theme={theme}
              />
            )}

          {!loading &&
            conversations.length >
              0 && (
              <>
                <div className="space-y-3">

                  {paginatedConversations.map(
                    conversation => (
                      <ConversationCard
                        key={
                          conversation.id
                        }

                        conversation={
                          conversation
                        }

                        onSelect={() =>
                          handleConversationClick(
                            conversation
                          )
                        }

                        onDelete={event =>
                          handleDeleteClick(
                            event,
                            conversation
                          )
                        }

                        theme={theme}
                      />
                    )
                  )}

                </div>

                <div
                  className="
                    mt-5
                    flex
                    items-center
                    justify-between
                  "
                >

                  <PaginationButton
                    disabled={
                      page === 1
                    }

                    onClick={() =>
                      setPage(p =>
                        Math.max(
                          1,
                          p - 1
                        )
                      )
                    }

                    theme={theme}
                  >
                    <ChevronLeft
                      className="h-4 w-4"
                    />

                    Prev
                  </PaginationButton>

                  <p
                    className="text-xs"

                    style={{
                      color:
                        theme.agentTimestamp,
                    }}
                  >
                    {page} / {totalPages}
                  </p>

                  <PaginationButton
                    disabled={
                      page ===
                      totalPages
                    }

                    onClick={() =>
                      setPage(p =>
                        Math.min(
                          totalPages,
                          p + 1
                        )
                      )
                    }

                    theme={theme}
                  >
                    Next

                    <ChevronRight
                      className="h-4 w-4"
                    />
                  </PaginationButton>
                </div>
              </>
            )}
        </div>
      </ModalShell>

      {deleteTarget && (
        <DeleteConfirmModal
          onClose={() =>
            setDeleteTarget(
              null
            )
          }

          onConfirm={
            handleConfirmDelete
          }

          deleting={deleting}

          theme={theme}

          title={
            deleteTarget.title
          }
        />
      )}

      {showClearConfirm && (
        <ClearAllConfirmModal
          onClose={() =>
            setShowClearConfirm(
              false
            )
          }

          onConfirm={
            handleClearAll
          }

          clearing={clearingAll}

          theme={theme}
        />
      )}
    </>
  )
}

export default ChatHistoryModal