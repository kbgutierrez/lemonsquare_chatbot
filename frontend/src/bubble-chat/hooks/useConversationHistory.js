import {
  useEffect,
  useState
} from 'react'

export const useConversationHistory =
  () => {

    const [loading, setLoading] =
      useState(false)

    const [conversations, setConversations] =
      useState([])

    const [selectedConversationId, setSelectedConversationId] =
      useState(null)

    /* ===================================== */
    /* PLACEHOLDER CONFIG */
    /* ===================================== */

    const USER_ID =
      'USER_ID_PLACEHOLDER'

    const HISTORY_API =
      'CHAT_HISTORY_API_PLACEHOLDER'

    const LOAD_API =
      'LOAD_CONVERSATION_API_PLACEHOLDER'

    /* ===================================== */
    /* FETCH HISTORY */
    /* ===================================== */

    const fetchHistory =
      async () => {

        try {

          setLoading(true)

          console.log(
            'FETCH CHAT HISTORY',
            {
              userId:
                USER_ID,

              endpoint:
                HISTORY_API
            }
          )

          /*
            FUTURE DATABASE/API FLOW

            const response =
              await fetch(HISTORY_API, {
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
          const mockHistory = [
            {
              id:
                'conversation_1',

              title:
                'Password Reset',

              preview:
                'How do I reset my account password?',

              updatedAt:
                'Today • 10:42 AM',

              messages: [
                {
                  sender:
                    'user',

                  text:
                    'How do I reset my account password?'
                },

                {
                  sender:
                    'agent',

                  text:
                    'You can reset your password inside settings.'
                }
              ]
            },

            {
              id:
                'conversation_2',

              title:
                'Ticket Assistance',

              preview:
                'How do I create a support ticket?',

              updatedAt:
                'Yesterday • 08:15 PM',

              messages: [
                {
                  sender:
                    'user',

                  text:
                    'How do I create a support ticket?'
                },

                {
                  sender:
                    'agent',

                  text:
                    'Go to the support section and press Create Ticket.'
                }
              ]
            }
          ]

          setTimeout(() => {

            setConversations(
              mockHistory
            )

            setLoading(false)

          }, 600)

        } catch (error) {

          console.error(error)

          setLoading(false)
        }
      }

    /* ===================================== */
    /* LOAD CONVERSATION */
    /* ===================================== */

    const loadConversation =
      async (
        conversationId
      ) => {

        try {

          setSelectedConversationId(
            conversationId
          )

          console.log(
            'LOAD CONVERSATION',
            {
              conversationId,

              endpoint:
                LOAD_API
            }
          )

          /*
            FUTURE DATABASE/API FLOW

            const response =
              await fetch(LOAD_API, {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json'
                },

                body: JSON.stringify({
                  userId:
                    USER_ID,

                  conversationId
                })
              })

            const data =
              await response.json()

            return data.messages
          */

          const conversation =
            conversations.find(
              (item) =>
                item.id ===
                conversationId
            )

          return (
            conversation?.messages ||
            []
          )

        } catch (error) {

          console.error(error)

          return []
        }
      }

    /* ===================================== */
    /* DELETE CONVERSATION */
    /* ===================================== */

    const deleteConversation =
      async (
        conversationId
      ) => {

        try {

          console.log(
            'DELETE CONVERSATION',
            {
              conversationId
            }
          )

          /*
            FUTURE DATABASE/API FLOW

            await fetch('/api/delete', {
              method: 'POST',

              body: JSON.stringify({
                userId:
                  USER_ID,

                conversationId
              })
            })
          */

          setConversations(
            (prev) =>
              prev.filter(
                (conversation) =>
                  conversation.id !==
                  conversationId
              )
          )

        } catch (error) {

          console.error(error)
        }
      }

    /* ===================================== */
    /* INITIAL FETCH */
    /* ===================================== */

    useEffect(() => {

      fetchHistory()

    }, [])

    return {

      loading,

      conversations,

      selectedConversationId,

      fetchHistory,

      loadConversation,

      deleteConversation
    }
  }