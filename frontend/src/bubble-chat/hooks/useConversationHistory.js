import {
  useCallback,
  useEffect,
  useState,
} from "react"

import chatbotService
  from "../services/chatbotService"

/* ========================================
   SORT HISTORY
======================================== */

const sortHistory =
  (history = []) => {

    return [...history].sort(
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
  }

/* ========================================
   BUILD PREVIEW FROM BACKEND HISTORY
======================================== */

const buildConversationPreview =
  (messages = []) => {

    const firstUserMessage =
      messages.find(
        (message) =>
          message.sender === "user"
      )

    const latestMessage =
      messages[
        messages.length - 1
      ]

    const title =
      firstUserMessage?.text
        ?.trim()
        ?.slice(0, 32) ||
      "Conversation"

    const preview =
      latestMessage?.text
        ?.trim()
        ?.slice(0, 80) ||
      "No preview available."

    return {
      title,
      preview,
    }
  }

/* ========================================
   DEDUPLICATE SESSIONS
======================================== */

const deduplicateSessions =
  (sessions = []) => {

    const unique =
      new Map()

    sessions.forEach(
      (session) => {

        if (
          !session?.id
        ) {
          return
        }

        unique.set(
          session.id,
          session
        )
      }
    )

    return Array.from(
      unique.values()
    )
  }

/* ========================================
   HOOK
======================================== */

export const useConversationHistory =
  () => {

    const [loading, setLoading] =
      useState(false)

    const [conversations, setConversations] =
      useState([])

    const [selectedConversationId, setSelectedConversationId] =
      useState(null)

    /* ========================================
       FETCH USER HISTORY
    ======================================== */

    const fetchHistory =
      useCallback(
        async () => {

          try {

            setLoading(true)

            /*
              STEP 1:
              Load backend sessions
            */
            const backendSessions =
              await chatbotService.loadUserSessions()

            /*
              STEP 2:
              Hydrate previews using
              REAL backend history
            */
            const hydratedSessions =
              await Promise.all(
                backendSessions.map(
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

                      return {
                        ...session,

                        title,

                        preview,

                        updatedAt:
                          history.messages?.[
                            history.messages.length - 1
                          ]?.createdAt ||
                          session.createdAt,
                      }

                    } catch (error) {

                      console.error(
                        "SESSION_PREVIEW_LOAD_ERROR",
                        session.id,
                        error
                      )

                      return {
                        ...session,

                        title:
                          "Conversation",

                        preview:
                          "Unable to load preview.",
                      }
                    }
                  }
                )
              )

            /*
              STEP 3:
              Remove duplicates
            */
            const deduplicated =
              deduplicateSessions(
                hydratedSessions
              )

            /*
              STEP 4:
              Sort newest first
            */
            const sorted =
              sortHistory(
                deduplicated
              )

            setConversations(
              sorted
            )

            console.log(
              "BACKEND_HISTORY_LOADED",
              sorted
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

            setLoading(
              false
            )
          }
        },
        []
      )

    /* ========================================
       SELECT CONVERSATION
    ======================================== */

    const selectConversation =
      useCallback(
        (
          sessionId
        ) => {

          setSelectedConversationId(
            sessionId
          )

          const conversation =
            conversations.find(
              (item) =>
                item.id ===
                sessionId
            )

          return {
            sessionId,

            resolved:
              Boolean(
                conversation?.resolved
              ),
          }
        },
        [conversations]
      )

    /* ========================================
       SAVE CONVERSATION
    ======================================== */

    /*
      IMPORTANT:
      Frontend no longer owns
      history persistence.

      Backend is source of truth.

      We only refresh history.
    */

    const saveConversation =
      useCallback(
        async () => {

          await fetchHistory()

        },
        [fetchHistory]
      )

    /* ========================================
       DELETE PLACEHOLDER
    ======================================== */

    const deleteConversation =
      useCallback(
        (
          sessionId
        ) => {

          console.warn(
            "DELETE_CONVERSATION_NOT_IMPLEMENTED",
            sessionId
          )
        },
        []
      )

    /* ========================================
       CLEAR PLACEHOLDER
    ======================================== */

    const clearAllHistory =
      useCallback(
        () => {

          console.warn(
            "CLEAR_ALL_NOT_IMPLEMENTED"
          )
        },
        []
      )

    /* ========================================
       RESOLVE CONVERSATION
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

            /*
              Refresh backend truth
            */
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