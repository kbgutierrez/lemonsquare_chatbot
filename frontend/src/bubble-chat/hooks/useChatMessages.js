import {
  useEffect,
  useState,
} from "react"

import chatbotService from "../services/chatbotService"

export const useChatMessages =
  () => {

    const [messages, setMessages] =
      useState([])

    const [loading, setLoading] =
      useState(false)

    const [sessionId, setSessionId] =
      useState(
        localStorage.getItem(
          "chat_session_id"
        ) || null
      )

    /* TIME FORMAT */
    const getTime = (
      date = new Date()
    ) =>
      new Date(date)
        .toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )

    /* LOAD HISTORY */
    useEffect(() => {

      const loadHistory =
        async () => {

          if (!sessionId)
            return

          try {

            const data =
              await chatbotService.loadSession(
                sessionId
              )

            if (
              data?.messages
            ) {

              const mapped =
                data.messages.map(
                  (
                    msg,
                    index
                  ) => ({
                    id:
                      `${index}-${msg.CreatedAt}`,

                    sender:
                      msg.SenderRole ===
                      "user"
                        ? "user"
                        : "agent",

                    text:
                      msg.MessageContent,

                    time:
                      getTime(
                        msg.CreatedAt
                      ),
                  })
                )

              setMessages(
                mapped
              )
            }

          } catch (error) {

            console.error(
              "LOAD_HISTORY_ERROR",
              error
            )
          }
        }

      loadHistory()

    }, [sessionId])

    /* SEND */
    const sendMessage =
      async (
        text
      ) => {

        if (
          !text?.trim()
        ) return

        const userMessage = {
          id:
            Date.now().toString(),

          sender:
            "user",

          text,

          time:
            getTime(),
        }

        /* ADD USER MESSAGE */
        setMessages(
          (prev) => [
            ...prev,
            userMessage,
          ]
        )

        setLoading(true)

        try {

          const response =
            await chatbotService.sendMessage(
              {
                SessionID:
                  sessionId,

                MessageContent:
                  text,
              }
            )

          /* SAVE SESSION */
          if (
            response.session_id
          ) {

            setSessionId(
              response.session_id
            )

            localStorage.setItem(
              "chat_session_id",
              response.session_id
            )
          }

          /* AI MESSAGE */
          const aiMessage = {
            id:
              `${Date.now()}-ai`,

            sender:
              "agent",

            text:
              response.response,

            time:
              getTime(),
          }

          setMessages(
            (prev) => [
              ...prev,
              aiMessage,
            ]
          )

        } catch (error) {

          console.error(
            "SEND_MESSAGE_ERROR",
            error
          )

          setMessages(
            (prev) => [
              ...prev,

              {
                id:
                  `${Date.now()}-error`,

                sender:
                  "agent",

                text:
                  "Something went wrong while contacting the AI.",

                time:
                  getTime(),
              },
            ]
          )
        }

        setLoading(false)
      }

    /* CLEAR */
    const clearConversation =
      () => {

        setMessages([])

        setSessionId(null)

        localStorage.removeItem(
          "chat_session_id"
        )
      }

    return {
      messages,
      loading,
      sessionId,
      sendMessage,
      clearConversation,
    }
  }