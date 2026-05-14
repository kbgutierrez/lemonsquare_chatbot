import {
  History,
  MessageSquare,
  ChevronRight,
  Trash2,
  Lock,
  CheckCircle2,
} from "lucide-react"

import ModalShell from "../components/ModalShell.jsx"

import {
  useConversationHistory,
} from "../hooks/useConversationHistory"

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
    (
      event,
      sessionId
    ) => {

      event.stopPropagation()

      deleteConversation(
        sessionId
      )
    }

  /* ========================================
     CLEAR ALL
  ======================================== */

  const handleClearAll =
    () => {

      clearAllHistory()
    }

  return (
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
            onClick={
              handleClearAll
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

              <p
                className="
                  mt-2

                  max-w-xs

                  text-sm

                  text-slate-500
                "
              >
                Your previous chats will
                appear here automatically.
              </p>
            </div>
          )}

        {/* LIST */}
        {!loading &&
          conversations.length > 0 && (
            <div
              className="
                space-y-3
              "
            >
              {conversations.map(
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
                      onKeyDown={(event) => {

                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {

                          handleConversationClick(
                            conversation
                          )
                        }
                      }}
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
                        hover:shadow-[0_12px_30px_rgba(124,58,237,0.10)]

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

                      {/* CONTENT */}
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
                          {/* TITLE */}
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

                          {/* PREVIEW */}
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

                            transition-transform
                            duration-300

                            group-hover:translate-x-1
                          "
                        />
                      </div>

                      {/* FOOTER */}
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
                            flex-wrap
                            items-center
                            gap-2
                          "
                        >
                          {isResolved && (
                            <span
                              className="
                                flex
                                items-center
                                gap-1

                                rounded-full

                                bg-emerald-100

                                px-2
                                py-1

                                text-[10px]
                                font-medium

                                text-emerald-700
                              "
                            >
                              <CheckCircle2
                                className="
                                  h-3
                                  w-3
                                "
                              />

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
          )}
      </div>
    </ModalShell>
  )
}

export default ChatHistoryModal