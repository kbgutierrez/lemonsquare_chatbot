import {
  useCallback,
  useEffect,
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
   HELPERS
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
       FETCH HISTORY
    ======================================== */

    const fetchHistory =
      useCallback(async () => {

        try {

          setLoading(true)

          const stored =
            loadStoredHistory()

          /*
            newest first
          */
          const sorted =
            [...stored].sort(
              (a, b) =>
                new Date(
                  b.updatedAt
                ) -
                new Date(
                  a.updatedAt
                )
            )

          setConversations(
            sorted
          )

        } catch (error) {

          console.error(
            "FETCH_HISTORY_ERROR",
            error
          )

        } finally {

          setLoading(false)
        }

      }, [])

    /* ========================================
       LOAD CONVERSATION
    ======================================== */

    const loadConversation =
      useCallback(
        async (
          sessionId
        ) => {

          try {

            setSelectedConversationId(
              sessionId
            )

            const response =
              await chatbotService.loadSession(
                sessionId
              )

            const existing =
              loadStoredHistory()

            const conversation =
              existing.find(
                (item) =>
                  item.id ===
                  sessionId
              )

            return {
              sessionId,

              messages:
                response?.messages || [],

              resolved:
                Boolean(
                  conversation?.resolved
                ),
            }

          } catch (error) {

            console.error(
              "LOAD_CONVERSATION_ERROR",
              error
            )

            return {
              sessionId:
                null,

              messages: [],

              resolved:
                false,
            }
          }
        },
        []
      )

    /* ========================================
       SAVE CONVERSATION
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
            loadStoredHistory()

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
            [
              updatedConversation,
              ...filtered,
            ]

          saveStoredHistory(
            updated
          )

          setConversations(
            updated
          )
        },
        []
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

            const existing =
              loadStoredHistory()

            const filtered =
              existing.filter(
                (item) =>
                  item.id !==
                  sessionId
              )

            saveStoredHistory(
              filtered
            )

            setConversations(
              filtered
            )

          } catch (error) {

            console.error(
              "DELETE_CONVERSATION_ERROR",
              error
            )
          }
        },
        []
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

            const existing =
              loadStoredHistory()

            const updated =
              existing.map(
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

            saveStoredHistory(
              updated
            )

            setConversations(
              updated
            )

          } catch (error) {

            console.error(
              "RESOLVE_CONVERSATION_ERROR",
              error
            )
          }
        },
        []
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

      loadConversation,

      saveConversation,

      deleteConversation,

      clearAllHistory,

      resolveConversation,
    }
  }