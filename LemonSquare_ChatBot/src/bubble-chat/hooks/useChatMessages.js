import {
  useState
} from 'react'

import {
  mockMessages
} from '../data/mockMessages'

export const useChatMessages =
  () => {

    const [messages, setMessages] =
      useState(mockMessages)

    const sendMessage =
      (
        text,
        isAgent = false
      ) => {

        const message = {

          id:
            Date.now().toString(),

          sender:
            isAgent
              ? 'agent'
              : 'user',

          text,

          time:
            new Date()
              .toLocaleTimeString(
                [],
                {
                  hour: '2-digit',
                  minute: '2-digit'
                }
              )
        }

        setMessages(
          (prev) => [
            ...prev,
            message
          ]
        )
      }

    const loadConversation =
      (
        conversationMessages
      ) => {

        const loaded =
          conversationMessages.map(
            (
              message,
              index
            ) => ({
              id:
                `loaded-${index}`,

              sender:
                message.sender,

              text:
                message.text,

              time:
                new Date()
                  .toLocaleTimeString(
                    [],
                    {
                      hour: '2-digit',
                      minute: '2-digit'
                    }
                  )
            })
          )

        setMessages(loaded)
      }

    const clearConversation =
      () => {

        setMessages([])
      }

    return {

      messages,

      sendMessage,

      loadConversation,

      clearConversation
    }
  }