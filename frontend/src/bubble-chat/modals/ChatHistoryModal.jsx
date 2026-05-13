import {
  useState,
} from "react"

import {
  History,
  MessageSquare,
  ChevronRight,
  Trash2,
  Lock,
  CheckCircle2,
  X,
} from "lucide-react"

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

  const [closing, setClosing] =
    useState(false)

  const {
    loading,

    conversations,

    fetchHistory,

    selectConversation,

    deleteConversation,

    clearAllHistory,
  } =
    useConversationHistory()


  /* ========================================
     CLOSE
  ======================================== */

  const handleClose =
    () => {

      setClosing(true)

      setTimeout(
        onClose,
        200
      )
    }

  /* ========================================
     LOAD CONVERSATION
  ======================================== */

  const handleConversationClick =
    async (
      conversation
    ) => {

      try {

        /*
          ONLY select metadata.
          Backend loading now belongs
          to useChatMessages.
        */
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

        setTimeout(
          handleClose,
          180
        )

      } catch (error) {

        console.error(
          "CONVERSATION_SELECT_ERROR",
          error
        )
      }
    }

  /* ========================================
     DELETE CONVERSATION
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
     CLEAR ALL HISTORY
  ======================================== */

  const handleClearAll =
    () => {

      clearAllHistory()
    }

  return (
    <div
      className={`
        fixed
        inset-0
        z-[100]

        flex
        items-center
        justify-center

        bg-black/30

        p-4

        backdrop-blur-[4px]

        transition-all
        duration-200

        ${
          closing
            ? "opacity-0"
            : "opacity-100"
        }
      `}
    >
      {/* MODAL */}
      <div
        className={`
          flex
          w-full
          max-w-lg
          flex-col

          overflow-hidden

          rounded-[30px]

          border
          border-violet-100

          bg-white

          shadow-[0_25px_80px_rgba(0,0,0,0.18)]

          transition-all
          duration-300

          ${
            closing
              ? `
                translate-y-4
                scale-95
                opacity-0
              `
              : `
                translate-y-0
                scale-100
                opacity-100
              `
          }
        `}
      >
        {/* HEADER */}
        <div
          className="
            flex
            items-center
            justify-between

            border-b
            border-violet-100

            bg-gradient-to-r
            from-violet-50
            to-purple-50

            px-5
            py-4
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-2xl

                bg-violet-100
              "
            >
              <History
                className="
                  h-5
                  w-5
                  text-violet-700
                "
              />
            </div>

            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]

                  text-violet-500
                "
              >
                Conversation History
              </p>

              <h2
                className="
                  text-lg
                  font-semibold

                  text-slate-900
                "
              >
                Previous Chats
              </h2>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            {conversations.length > 0 && (
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

                  transition

                  hover:bg-red-100
                "
              >
                Clear All
              </button>
            )}

            <button
              type="button"

              onClick={
                handleClose
              }

              className="
                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-xl

                border
                border-violet-100

                bg-white

                transition

                hover:bg-violet-50
              "
            >
              <X
                className="
                  h-5
                  w-5
                  text-slate-600
                "
              />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div
          className="
            max-h-[65vh]
            overflow-y-auto
            p-4
          "
        >
          {loading && (
            <div
              className="
                flex
                flex-col
                items-center
                justify-center

                py-16
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

          {!loading &&
            conversations.length === 0 && (
              <div
                className="
                  flex
                  flex-col
                  items-center
                  justify-center

                  py-16

                  text-center
                "
              >
                <History
                  className="
                    h-10
                    w-10

                    text-violet-300
                  "
                />

                <p
                  className="
                    mt-4
                    text-sm
                    text-slate-500
                  "
                >
                  No conversation history yet.
                </p>
              </div>
            )}

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

                          rounded-2xl

                          border
                          border-violet-100

                          bg-white

                          p-4

                          text-left

                          transition-all
                          duration-200

                          hover:-translate-y-0.5
                          hover:bg-violet-50
                          hover:shadow-lg

                          active:scale-[0.99]
                        "
                      >
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

                            rounded-lg

                            text-slate-400

                            transition

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
                              duration-200

                              group-hover:translate-x-1
                            "
                          />
                        </div>

                        <div
                          className="
                            mt-4

                            flex
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
      </div>
    </div>
  )
}

export default ChatHistoryModal