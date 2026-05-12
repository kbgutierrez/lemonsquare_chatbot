import {
  useCallback,
  useEffect,
  useState,
} from "react"

import chatbotService from "../services/chatbotService"

export const useChatMessages =
  () => {

    /* ========================================
       STATE
    ======================================== */

    const [messages, setMessages] =
      useState([])

    const [loading, setLoading] =
      useState(false)

    const [sessionId, setSessionId] =
      useState(null)

    /* ========================================
       REQUEST LOCK
    ======================================== */

    let requestLocked =
      false

    /* ========================================
       TIME FORMAT
    ======================================== */

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

    /* ========================================
       INITIALIZE SESSION
    ======================================== */

    useEffect(() => {

      const storedSession =
        localStorage.getItem(
          "chat_session_id"
        )

      if (
        storedSession
      ) {

        setSessionId(
          storedSession
        )
      }

    }, [])

    /* ========================================
       LOAD HISTORY
    ======================================== */

    useEffect(() => {

      const loadHistory =
        async () => {

          if (
            !sessionId
          ) {
            return
          }

          try {

            const data =
              await chatbotService.loadSession(
                sessionId
              )

            if (
              Array.isArray(
                data?.messages
              )
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

            localStorage.removeItem(
              "chat_session_id"
            )

            setSessionId(
              null
            )
          }
        }

      loadHistory()

    }, [sessionId])

    /* ========================================
       SEND MESSAGE
    ======================================== */

    const sendMessage =
      useCallback(
        async (
          text
        ) => {

          if (
            !text?.trim()
          ) {
            return
          }

          /* PREVENT DUPLICATE REQUESTS */

          if (
            requestLocked
          ) {
            return
          }

          requestLocked =
            true

          const userMessage = {
            id:
              crypto.randomUUID(),

            sender:
              "user",

            text:
              text.trim(),

            time:
              getTime(),
          }

          /* OPTIMISTIC UPDATE */

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
                    text.trim(),
                }
              )

            console.log(
              "CHAT_RESPONSE",
              response
            )

            /* SAVE SESSION */

            if (
              response?.session_id
            ) {

              setSessionId(
                response.session_id
              )

              localStorage.setItem(
                "chat_session_id",
                response.session_id
              )
            }

            /* AI RESPONSE */

            const aiMessage = {
              id:
                crypto.randomUUID(),

              sender:
                "agent",

              text:
                response?.response ||
                "The AI returned an empty response.",

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
                    crypto.randomUUID(),

                  sender:
                    "agent",

                  text:
                    error.message ||
                    "Unable to contact AI service.",

                  time:
                    getTime(),
                },
              ]
            )

          } finally {

            setLoading(false)

            requestLocked =
              false
          }
        },
        [sessionId]
      )

    /* ========================================
       CLEAR CONVERSATION
    ======================================== */

    const clearConversation =
      useCallback(
        () => {

          setMessages([])

          setSessionId(
            null
          )

          localStorage.removeItem(
            "chat_session_id"
          )
        },
        []
      )

    return {
      messages,
      loading,
      sessionId,
      sendMessage,
      clearConversation,
    }
  }