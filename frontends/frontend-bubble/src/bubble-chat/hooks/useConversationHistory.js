import {
  useCallback,
  useEffect,
  useState,
} from "react"

import chatbotService
  from "../services/chatbotService"

/* ========================================
   HELPERS
======================================== */

const sortHistory = (
  history = []
) =>
  [...history].sort(
    (a, b) =>
      new Date(
        b.updatedAt ||
          b.createdAt
      ) -
      new Date(
        a.updatedAt ||
          a.createdAt
      )
  )

const deduplicateSessions = (
  sessions = []
) =>
  Array.from(
    new Map(
      sessions
        .filter(
          session =>
            session?.id
        )
        .map(session => [
          session.id,
          session,
        ])
    ).values()
  )

const buildConversationPreview =
  (messages = []) => {

    const firstUserMessage =
      messages.find(
        message =>
          message.sender ===
          "user"
      )

    const latestMessage =
      messages.at(-1)

    return {
      title:
        firstUserMessage?.text
          ?.trim()
          ?.slice(0, 32) ||
        "Conversation",

      preview:
        latestMessage?.text
          ?.trim()
          ?.slice(0, 80) ||
        "No preview available.",
    }
  }

const buildInitialSessions =
  (
    backendSessions
  ) =>
    sortHistory(
      deduplicateSessions(
        backendSessions.map(
          session => ({
            ...session,

            title:
              "Loading conversation...",

            preview:
              "Fetching latest messages...",

            isHydrating:
              true,
          })
        )
      )
    )

/* ========================================
   HOOK
======================================== */

export const useConversationHistory =
  () => {

    const [loading, setLoading] =
      useState(false)

    const [
      conversations,
      setConversations,
    ] = useState([])

    const [
      selectedConversationId,
      setSelectedConversationId,
    ] = useState(null)

    /* ========================================
       HYDRATE SESSION
    ======================================== */

    const hydrateSession =
      useCallback(
        async (
          session
        ) => {

          try {

            const history =
              await chatbotService.loadSession(
                session.id
              )

            const {
              title,
              preview,
            } =
              buildConversationPreview(
                history.messages
              )

            setConversations(
              previous =>
                sortHistory(
                  previous.map(
                    item => {

                      if (
                        item.id !==
                        session.id
                      ) {

                        return item
                      }

                      return {
                        ...item,

                        title,

                        preview,

                        isHydrating:
                          false,

                        updatedAt:
                          history.messages?.at(
                            -1
                          )?.createdAt ||
                          item.updatedAt,
                      }
                    }
                  )
                )
            )

          } catch (error) {

            console.error(
              "SESSION_PREVIEW_LOAD_ERROR",
              session.id,
              error
            )

            setConversations(
              previous =>
                previous.map(
                  item =>
                    item.id !==
                    session.id
                      ? item
                      : {
                          ...item,

                          title:
                            "Conversation",

                          preview:
                            "Unable to load preview.",

                          isHydrating:
                            false,
                        }
                )
            )
          }
        },
        []
      )

    /* ========================================
       FETCH HISTORY
    ======================================== */

    const fetchHistory =
      useCallback(
        async () => {

          try {

            setLoading(true)

            const backendSessions =
              await chatbotService.loadUserSessions()

            const initialSessions =
              buildInitialSessions(
                backendSessions
              )

            setConversations(
              initialSessions
            )

            setLoading(false)

            await Promise.allSettled(
              initialSessions.map(
                hydrateSession
              )
            )

          } catch (error) {

            console.error(
              "FETCH_HISTORY_ERROR",
              error
            )

            setConversations(
              []
            )

          } finally {

            setLoading(false)
          }
        },
        [hydrateSession]
      )

    /* ========================================
       SELECT
    ======================================== */

    const selectConversation =
      useCallback(
        sessionId => {

          setSelectedConversationId(
            sessionId
          )

          const conversation =
            conversations.find(
              item =>
                item.id ===
                sessionId
            )

          return {
            sessionId,

            resolved:
              Boolean(
                conversation?.resolved
              ),

            locked:
              Boolean(
                conversation?.locked
              ),

            status:
              conversation?.status ||
              "active",

            ticketSubmitted:
              Boolean(
                conversation?.ticketSubmitted
              ),

            archived:
              String(
                conversation?.status || ""
              ).toLowerCase() ===
              "archived",

            escalated:
              String(
                conversation?.status || ""
              ).toLowerCase() ===
              "escalated",
          }
        },
        [conversations]
      )

    /* ========================================
       SAVE
    ======================================== */

    const saveConversation =
      useCallback(
        async () => {

          await fetchHistory()

        },
        [fetchHistory]
      )

    /* ========================================
       DELETE
    ======================================== */

    const deleteConversation =
      useCallback(
        async (
          sessionId
        ) => {

          if (!sessionId) {
            return
          }

          try {

            setConversations(
              previous =>
                previous.filter(
                  conversation =>
                    conversation.id !==
                    sessionId
                )
            )

            setSelectedConversationId(
              previous =>
                previous ===
                sessionId
                  ? null
                  : previous
            )

            await chatbotService.deleteConversation(
              sessionId
            )

          } catch (error) {

            console.error(
              "DELETE_CONVERSATION_ERROR",
              error
            )

            await fetchHistory()
          }
        },
        [fetchHistory]
      )

    /* ========================================
       CLEAR ALL
    ======================================== */

    const clearAllHistory =
      useCallback(
        async () => {

          try {

            setConversations(
              []
            )

            setSelectedConversationId(
              null
            )

            await chatbotService.clearAllSessions()

          } catch (error) {

            console.error(
              "CLEAR_ALL_HISTORY_ERROR",
              error
            )

            await fetchHistory()
          }
        },
        [fetchHistory]
      )

    /* ========================================
       RESOLVE
    ======================================== */

    const resolveConversation =
      useCallback(
        async (
          sessionId
        ) => {

          try {

            await chatbotService.resolveConversation(
              sessionId
            )

            await fetchHistory()

          } catch (error) {

            console.error(
              "RESOLVE_CONVERSATION_ERROR",
              error
            )
          }
        },
        [fetchHistory]
      )

    /* ========================================
       INITIAL LOAD
    ======================================== */

    useEffect(() => {

      fetchHistory()

    }, [fetchHistory])

    return {
      loading,

      conversations,

      selectedConversationId,

      fetchHistory,

      selectConversation,

      saveConversation,

      deleteConversation,

      clearAllHistory,

      resolveConversation,
    }
  }