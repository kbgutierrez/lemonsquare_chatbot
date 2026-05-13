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

    /*
      Backend-authoritative
      resolved state.
    */
    const [resolved, setResolved] =
      useState(false)

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

    const getTime =
      (
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
       CHECK RESOLVED STATUS
    ======================================== */

    const syncResolvedStatus =
      useCallback(
        async (
          targetSessionId
        ) => {

          if (
            !targetSessionId
          ) {

            setResolved(false)

            return
          }

          try {

            const sessions =
              await chatbotService.loadUserSessions()

            const matchedSession =
              sessions.find(
                (session) =>
                  session.id ===
                  targetSessionId
              )

            setResolved(
              Boolean(
                matchedSession?.resolved
              )
            )

          } catch (error) {

            console.error(
              "SYNC_RESOLVED_STATUS_ERROR",
              error
            )
          }
        },
        []
      )

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
            Generate a unique load id
            so stale async responses
            can be ignored.
          */
          const loadId =
            crypto.randomUUID()

          activeLoadIdRef.current =
            loadId

          setLoading(true)

          try {

            /*
              Load backend history.
            */
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

            /*
              Sync backend resolved state.
            */
            await syncResolvedStatus(
              targetSessionId
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

              setSessionId(null)

              setResolved(false)

              sessionIdRef.current =
                null
            }

          } finally {

            if (
              mountedRef.current
            ) {

              setLoading(false)
            }
          }
        },
        [syncResolvedStatus]
      )

    /* ========================================
       AUTO LOAD SESSION
    ======================================== */

    useEffect(() => {

      if (!sessionId) {
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

          /*
            Prevent sending
            on resolved chat.
          */
          if (resolved) {

            console.warn(
              "MESSAGE_BLOCKED_RESOLVED_CHAT"
            )

            return
          }

          const trimmed =
            text?.trim()

          if (!trimmed) {
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

            text: "",

            time: "",

            isTyping: true,
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

              setSessionId(
                (
                  previous
                ) => {

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

              isError: true,
            }

            setMessages([
              ...optimisticMessages,
              errorMessage,
            ])

          } finally {

            if (
              mountedRef.current
            ) {

              setLoading(false)
            }

            requestLockRef.current =
              false
          }
        },
        [
          messages,
          resolved,
        ]
      )

    /* ========================================
       RESOLVE CONVERSATION
    ======================================== */

    const resolveConversation =
      useCallback(
        async () => {

          if (
            !sessionIdRef.current
          ) {

            throw new Error(
              "No active session found."
            )
          }

          /*
            Prevent duplicate resolve.
          */
          if (resolved) {

            console.warn(
              "CHAT_ALREADY_RESOLVED"
            )

            return
          }

          try {

            setLoading(true)

            /*
              REAL BACKEND RESOLVE
            */
            await chatbotService.resolveConversation(
              sessionIdRef.current
            )

            /*
              Backend is source of truth.
            */
            setResolved(true)

            console.log(
              "BACKEND_CONVERSATION_RESOLVED",
              {
                sessionId:
                  sessionIdRef.current,
              }
            )

          } catch (error) {

            console.error(
              "RESOLVE_CONVERSATION_ERROR",
              error
            )

            throw error

          } finally {

            if (
              mountedRef.current
            ) {

              setLoading(false)
            }
          }
        },
        [resolved]
      )

    /* ========================================
       RESTORE CONVERSATION
    ======================================== */

    const restoreConversation =
      useCallback(
        ({
          sessionId,
        }) => {

          if (!sessionId) {
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

          setSessionId(null)

          setResolved(false)

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

      resolved,

      sendMessage,

      resolveConversation,

      clearConversation,

      restoreConversation,
    }
  }