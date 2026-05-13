import {
  useEffect,
  useState,
} from "react"

import {
  History,
  MessageSquare,
  ChevronRight,
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

    loadConversation,
  } =
    useConversationHistory()

  /* ========================================
     INITIAL FETCH
  ======================================== */

  useEffect(() => {

    fetchHistory()

  }, [fetchHistory])

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

        const result =
          await loadConversation(
            conversation.id
          )

        console.log(
          "RESTORED_CONVERSATION",
          result
        )

        /*
          Restore active session
        */
        localStorage.setItem(
          "chat_session_id",
          conversation.id
        )

        /*
          Push messages back to parent
        */
        onLoadConversation?.(
          result
        )

        setTimeout(
          handleClose,
          180
        )

      } catch (error) {

        console.error(
          "CONVERSATION_RESTORE_ERROR",
          error
        )
      }
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

        {/* BODY */}
        <div
          className="
            max-h-[65vh]
            overflow-y-auto
            p-4
          "
          style={{
            scrollbarWidth:
              "none",

            msOverflowStyle:
              "none",
          }}
        >
          <style>
            {`
              div::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>

          {/* LOADING */}
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

          {/* EMPTY */}
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

          {/* CONVERSATIONS */}
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
                  ) => (
                    <button
                      key={
                        conversation.id
                      }

                      type="button"

                      onClick={() =>
                        handleConversationClick(
                          conversation
                        )
                      }

                      className="
                        group
                        w-full

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
                      {/* TOP */}
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
                            <MessageSquare
                              className="
                                h-4
                                w-4
                                shrink-0

                                text-violet-600
                              "
                            />

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

                      {/* FOOTER */}
                      <div
                        className="
                          mt-4

                          flex
                          items-center
                          justify-between
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
                    </button>
                  )
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default ChatHistoryModal