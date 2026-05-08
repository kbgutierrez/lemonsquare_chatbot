import {
  useEffect,
  useState
} from 'react'

import {
  History,
  MessageSquare,
  ChevronRight,
  X
} from 'lucide-react'

const ChatHistoryModal = ({
  onClose,

  /* LOAD CHAT INTO WINDOW */
  onLoadConversation
}) => {

  const [loading, setLoading] =
    useState(true)

  const [conversations, setConversations] =
    useState([])

  const [selectedId, setSelectedId] =
    useState(null)

  const [closing, setClosing] =
    useState(false)

  /* ===================================== */
  /* PLACEHOLDER USER ID */
  /* ===================================== */

  const USER_ID =
    'USER_ID_PLACEHOLDER'

  /* ===================================== */
  /* PLACEHOLDER API URL */
  /* ===================================== */

  const API_URL =
    'CHAT_HISTORY_API_PLACEHOLDER'

  /* FETCH */
  useEffect(() => {

    const fetchConversations =
      async () => {

        try {

          console.log(
            'FETCH HISTORY:',
            {
              userId: USER_ID,
              endpoint: API_URL
            }
          )

          /*
            FUTURE DATABASE/API CALL

            const response =
              await fetch(API_URL, {
                method: 'POST',
                headers: {
                  'Content-Type':
                    'application/json'
                },
                body: JSON.stringify({
                  userId: USER_ID
                })
              })

            const data =
              await response.json()

            setConversations(data)
          */

          /* MOCK DATA */
          const mockData = [
            {
              id: 'conversation_1',

              title:
                'Password Reset',

              preview:
                'How do I reset my account password?',

              updatedAt:
                'Today • 10:42 AM',

              messages: [
                {
                  sender: 'user',
                  text:
                    'How do I reset my account password?'
                },

                {
                  sender: 'agent',
                  text:
                    'You can reset your password through settings.'
                }
              ]
            },

            {
              id: 'conversation_2',

              title:
                'Ticket Assistance',

              preview:
                'How can I submit a support ticket?',

              updatedAt:
                'Yesterday • 08:15 PM',

              messages: [
                {
                  sender: 'user',
                  text:
                    'How can I submit a support ticket?'
                },

                {
                  sender: 'agent',
                  text:
                    'Go to the support portal and click Create Ticket.'
                }
              ]
            }
          ]

          setTimeout(() => {

            setConversations(
              mockData
            )

            setLoading(false)

          }, 600)

        } catch (error) {

          console.error(error)

          setLoading(false)
        }
      }

    fetchConversations()

  }, [])

  /* CLOSE */
  const handleClose = () => {

    setClosing(true)

    setTimeout(() => {
      onClose()
    }, 200)
  }

  /* LOAD CONVERSATION */
  const handleConversationClick = (
    conversation
  ) => {

    setSelectedId(
      conversation.id
    )

    console.log(
      'LOAD CONVERSATION:',
      conversation
    )

    /*
      FUTURE FLOW:

      1. Fetch full conversation
      2. Inject into chatbot
      3. Restore session
      4. Restore conversation ID
    */

    if (onLoadConversation) {

      onLoadConversation(
        conversation.messages
      )
    }

    setTimeout(() => {
      handleClose()
    }, 180)
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
        backdrop-blur-[4px]

        p-4

        transition-all
        duration-200

        ${
          closing
            ? 'opacity-0'
            : 'opacity-100'
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

          {/* TITLE */}
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
              <History className="h-5 w-5 text-violet-700" />
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

          {/* CLOSE */}
          <button
            type="button"

            onClick={handleClose}

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

              transition-all
              duration-200

              hover:bg-violet-50
            "
          >
            <X className="h-5 w-5 text-slate-600" />
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
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
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

          {/* LIST */}
          {!loading && (
            <div className="space-y-3">

              {conversations.map(
                (conversation) => (
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

                    className={`
                      group

                      w-full

                      rounded-2xl

                      border

                      p-4

                      text-left

                      transition-all
                      duration-200

                      hover:-translate-y-0.5
                      hover:shadow-lg

                      active:scale-[0.99]

                      ${
                        selectedId ===
                        conversation.id
                          ? `
                            border-violet-300
                            bg-violet-50
                          `
                          : `
                            border-violet-100
                            bg-white
                            hover:bg-violet-50
                          `
                      }
                    `}
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

                        {/* TITLE */}
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
                            {conversation.title}
                          </p>
                        </div>

                        {/* PREVIEW */}
                        <p
                          className="
                            mt-2
                            line-clamp-2
                            text-xs
                            text-slate-500
                          "
                        >
                          {conversation.preview}
                        </p>
                      </div>

                      {/* ARROW */}
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
                        {conversation.updatedAt}
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
                          conversation.messages.length
                        } messages
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