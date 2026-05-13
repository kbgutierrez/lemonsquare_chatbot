import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

import chatbotService
  from "../services/chatbotService"

/* ========================================
   CHAT HOOK
======================================== */

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

    /*
      Prevent stale async overwrites.
    */
    const activeLoadIdRef =
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
       LOAD CONVERSATION
    ======================================== */

    const loadConversation =
      useCallback(
        async (
          targetSessionId
        ) => {

          if (
            !targetSessionId
          ) {
            return
          }

          /*
            Generate a unique load id so stale
            async responses can be ignored.
          */
          const loadId =
            crypto.randomUUID()

          activeLoadIdRef.current =
            loadId

          setLoading(true)

          try {

            const data =
              await chatbotService.loadSession(
                targetSessionId
              )

            /*
              Ignore stale requests.
            */
            if (
              activeLoadIdRef.current !==
              loadId
            ) {
              return
            }

            if (
              !mountedRef.current
            ) {
              return
            }

            const normalizedMessages =
              Array.isArray(
                data?.messages
              )
                ? data.messages
                : []

            setMessages(
              normalizedMessages
            )

            console.log(
              "SESSION_LOADED",
              {
                sessionId:
                  targetSessionId,

                messageCount:
                  normalizedMessages.length,
              }
            )

          } catch (error) {

            console.error(
              "LOAD_HISTORY_ERROR",
              error
            )

            if (
              mountedRef.current
            ) {

              setMessages([])

              setSessionId(
                null
              )

              sessionIdRef.current =
                null
            }

          } finally {

            if (
              mountedRef.current
            ) {

              setLoading(
                false
              )
            }
          }
        },
        []
      )

    /* ========================================
       AUTO LOAD SESSION
    ======================================== */

    useEffect(() => {

      if (
        !sessionId
      ) {
        return
      }

      loadConversation(
        sessionId
      )

    }, [
      sessionId,
      loadConversation,
    ])

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

          /*
            Prevent duplicate requests.
          */
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

          const typingMessage = {
            id:
              crypto.randomUUID(),

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

          /*
            Optimistic UI.
          */
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

            /*
              NEW SESSION CREATED
            */
            if (
              response?.sessionId
            ) {

              sessionIdRef.current =
                response.sessionId

              /*
                Only trigger state update
                if session changed.
              */
              setSessionId(
                (previous) => {

                  if (
                    previous ===
                    response.sessionId
                  ) {
                    return previous
                  }

                  return response.sessionId
                }
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

            console.log(
              "MESSAGE_SENT_SUCCESS",
              {
                sessionId:
                  response.sessionId,
              }
            )

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
        }) => {

          if (
            !sessionId
          ) {
            return
          }

          /*
            Clear previous state
            before switching sessions.
          */
          setMessages([])

          sessionIdRef.current =
            sessionId

          setSessionId(
            sessionId
          )

          console.log(
            "RESTORE_CONVERSATION",
            {
              sessionId,
            }
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

          activeLoadIdRef.current =
            null

          sessionIdRef.current =
            null

          setMessages([])

          setSessionId(
            null
          )

          console.log(
            "CONVERSATION_CLEARED"
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