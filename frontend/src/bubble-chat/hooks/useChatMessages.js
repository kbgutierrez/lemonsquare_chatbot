import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

import chatbotService
  from "../services/chatbotService"

/* ========================================
   STORAGE KEY
======================================== */

const HISTORY_STORAGE_KEY =
  "chat_session_history"

/* ========================================
   SAVE SESSION HISTORY
======================================== */

const saveConversationHistory =
  ({
    sessionId,
    messages,
  }) => {

    if (
      !sessionId ||
      !Array.isArray(messages) ||
      messages.length === 0
    ) {
      return
    }

    const firstUserMessage =
      messages.find(
        (msg) =>
          msg.sender ===
          "user"
      )

    const preview =
      firstUserMessage?.text ||
      "Conversation"

    const conversation = {
      id:
        sessionId,

      title:
        preview.slice(
          0,
          32
        ),

      preview:
        preview.slice(
          0,
          80
        ),

      updatedAt:
        new Date().toISOString(),

      messageCount:
        messages.length,
    }

    let existing = []

    try {

      existing =
        JSON.parse(
          localStorage.getItem(
            HISTORY_STORAGE_KEY
          ) || "[]"
        )

    } catch {

      existing = []
    }

    const filtered =
      existing.filter(
        (item) =>
          item.id !==
          sessionId
      )

    const updated = [
      conversation,
      ...filtered,
    ]

    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(updated)
    )
  }

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
       REFS
    ======================================== */

    const mountedRef =
      useRef(true)

    const requestLockRef =
      useRef(false)

    const sessionIdRef =
      useRef(null)

    const activeHistoryLoadRef =
      useRef(null)

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
       MOUNT CLEANUP
    ======================================== */

    useEffect(() => {

      mountedRef.current =
        true

      return () => {

        mountedRef.current =
          false
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

          const requestId =
            crypto.randomUUID()

          activeHistoryLoadRef.current =
            requestId

          try {

            const data =
              await chatbotService.loadSession(
                sessionId
              )

            if (
              !mountedRef.current
            ) {
              return
            }

            /*
              Prevent stale async overwrite.
            */
            if (
              activeHistoryLoadRef.current !==
              requestId
            ) {
              return
            }

            if (
              Array.isArray(
                data?.messages
              )
            ) {

              setMessages(
                data.messages
              )

              saveConversationHistory({
                sessionId,
                messages:
                  data.messages,
              })
            }

          } catch (error) {

            console.error(
              "LOAD_HISTORY_ERROR",
              error
            )

            sessionIdRef.current =
              null

            if (
              mountedRef.current
            ) {

              setSessionId(
                null
              )
            }
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

          const trimmed =
            text?.trim()

          if (
            !trimmed
          ) {
            return
          }

          if (
            requestLockRef.current
          ) {
            return
          }

          requestLockRef.current =
            true

          const userMessage = {
            id:
              crypto.randomUUID(),

            sender:
              "user",

            text:
              trimmed,

            time:
              getTime(),
          }

          const typingMessageId =
            crypto.randomUUID()

          const typingMessage = {
            id:
              typingMessageId,

            sender:
              "agent",

            text:
              "",

            time:
              "",

            isTyping:
              true,
          }

          const optimisticMessages = [
            ...messages,
            userMessage,
          ]

          setMessages([
            ...optimisticMessages,
            typingMessage,
          ])

          setLoading(true)

          try {

            const response =
              await chatbotService.sendMessage(
                {
                  SessionID:
                    sessionIdRef.current,

                  MessageContent:
                    trimmed,
                }
              )

            if (
              response?.sessionId
            ) {

              sessionIdRef.current =
                response.sessionId

              setSessionId(
                response.sessionId
              )
            }

            const aiMessage = {
              id:
                crypto.randomUUID(),

              sender:
                "agent",

              text:
                response?.message?.trim() ||
                "The AI returned an empty response.",

              time:
                getTime(),

              ticketIds:
                response?.ticketIds || [],
            }

            const finalMessages = [
              ...optimisticMessages,
              aiMessage,
            ]

            setMessages(
              finalMessages
            )

            saveConversationHistory({
              sessionId:
                response.sessionId,

              messages:
                finalMessages,
            })

          } catch (error) {

            console.error(
              "SEND_MESSAGE_ERROR",
              error
            )

            const errorMessage = {
              id:
                crypto.randomUUID(),

              sender:
                "agent",

              text:
                error.message ||
                "Unable to contact AI service.",

              time:
                getTime(),

              isError:
                true,
            }

            setMessages([
              ...optimisticMessages,
              errorMessage,
            ])

          } finally {

            if (
              mountedRef.current
            ) {

              setLoading(
                false
              )
            }

            requestLockRef.current =
              false
          }
        },
        [messages]
      )

    /* ========================================
       RESTORE CONVERSATION
    ======================================== */

    const restoreConversation =
      useCallback(
        ({
          sessionId,
          messages,
        }) => {

          if (
            !sessionId
          ) {
            return
          }

          sessionIdRef.current =
            sessionId

          setSessionId(
            sessionId
          )

          setMessages(
            messages || []
          )
        },
        []
      )

    /* ========================================
       CLEAR CONVERSATION
    ======================================== */

    const clearConversation =
      useCallback(
        () => {

          setMessages([])

          sessionIdRef.current =
            null

          setSessionId(
            null
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
      restoreConversation,
    }
  }