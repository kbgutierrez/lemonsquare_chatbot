import {
  useCallback,
  useEffect,
  useState,
} from "react"

import chatbotService
  from "../services/chatbotService"

/* ========================================
   FALLBACK STORAGE KEY
======================================== */

const HISTORY_STORAGE_KEY =
  "chat_session_history"

/* ========================================
   FALLBACK CACHE HELPERS
======================================== */

const loadStoredHistory =
  () => {

    try {

      const raw =
        localStorage.getItem(
          HISTORY_STORAGE_KEY
        )

      if (!raw) {
        return []
      }

      const parsed =
        JSON.parse(raw)

      return Array.isArray(parsed)
        ? parsed
        : []

    } catch {

      return []
    }
  }

const saveStoredHistory =
  (history) => {

    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(history)
    )
  }

/* ========================================
   SORT HISTORY
======================================== */

const sortHistory =
  (history) => {

    return [...history].sort(
      (a, b) =>
        new Date(
          b.updatedAt
        ) -
        new Date(
          a.updatedAt
        )
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
              PRIMARY SOURCE:
              Backend user sessions
            */
            const backendHistory =
              await chatbotService.loadUserSessions()

            const sorted =
              sortHistory(
                backendHistory
              )

            setConversations(
              sorted
            )

            /*
              Save fallback cache.
            */
            saveStoredHistory(
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

            /*
              FALLBACK:
              Use cached history
              if backend fails.
            */
            const cached =
              loadStoredHistory()

            setConversations(
              sortHistory(
                cached
              )
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
       SAVE CONVERSATION METADATA
    ======================================== */

    const saveConversation =
      useCallback(
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

          const existing =
            [...conversations]

          const alreadyExists =
            existing.find(
              (item) =>
                item.id ===
                sessionId
            )

          const firstUserMessage =
            messages.find(
              (msg) =>
                msg.sender ===
                "user"
            )

          const preview =
            firstUserMessage?.text ||
            "Conversation"

          const updatedConversation = {
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

            resolved:
              alreadyExists?.resolved || false,

            resolvedAt:
              alreadyExists?.resolvedAt || null,
          }

          const filtered =
            existing.filter(
              (item) =>
                item.id !==
                sessionId
            )

          const updated =
            sortHistory([
              updatedConversation,
              ...filtered,
            ])

          /*
            Optimistic UI update.
          */
          setConversations(
            updated
          )

          /*
            Fallback cache.
          */
          saveStoredHistory(
            updated
          )

        },
        [conversations]
      )

    /* ========================================
       DELETE CONVERSATION
    ======================================== */

    const deleteConversation =
      useCallback(
        (
          sessionId
        ) => {

          try {

            const updated =
              conversations.filter(
                (item) =>
                  item.id !==
                  sessionId
              )

            setConversations(
              updated
            )

            saveStoredHistory(
              updated
            )

            if (
              selectedConversationId ===
              sessionId
            ) {

              setSelectedConversationId(
                null
              )
            }

          } catch (error) {

            console.error(
              "DELETE_CONVERSATION_ERROR",
              error
            )
          }
        },
        [
          conversations,
          selectedConversationId,
        ]
      )

    /* ========================================
       CLEAR ALL HISTORY
    ======================================== */

    const clearAllHistory =
      useCallback(
        () => {

          localStorage.removeItem(
            HISTORY_STORAGE_KEY
          )

          setConversations([])

          setSelectedConversationId(
            null
          )
        },
        []
      )

    /* ========================================
       RESOLVE CONVERSATION
    ======================================== */

    const resolveConversation =
      useCallback(
        (
          sessionId
        ) => {

          try {

            const updated =
              conversations.map(
                (
                  conversation
                ) => {

                  if (
                    conversation.id !==
                    sessionId
                  ) {
                    return conversation
                  }

                  return {
                    ...conversation,

                    resolved:
                      true,

                    resolvedAt:
                      new Date().toISOString(),
                  }
                }
              )

            setConversations(
              updated
            )

            saveStoredHistory(
              updated
            )

          } catch (error) {

            console.error(
              "RESOLVE_CONVERSATION_ERROR",
              error
            )
          }
        },
        [conversations]
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