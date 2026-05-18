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
   BUILD PREVIEW
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
   DEDUPLICATE
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
       FETCH HISTORY
    ======================================== */

    const fetchHistory =
      useCallback(
        async () => {

          try {

            setLoading(true)

            /*
              STEP 1:
              LOAD SESSION LIST ONLY
            */

            const backendSessions =
              await chatbotService.loadUserSessions()

            /*
              STEP 2:
              IMMEDIATE RENDER
              PLACEHOLDER CARDS
            */

            const initialSessions =
              sortHistory(
                deduplicateSessions(
                  backendSessions.map(
                    (
                      session
                    ) => ({
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

            setConversations(
              initialSessions
            )

            setLoading(false)

            /*
              STEP 3:
              HYDRATE ONE-BY-ONE
            */

            initialSessions.forEach(
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
                    (
                      previous
                    ) => {

                      return sortHistory(
                        previous.map(
                          (
                            item
                          ) => {

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
                                history.messages?.[
                                  history.messages.length - 1
                                ]?.createdAt ||
                                item.updatedAt,
                            }
                          }
                        )
                      )
                    }
                  )

                } catch (error) {

                  console.error(
                    "SESSION_PREVIEW_LOAD_ERROR",
                    session.id,
                    error
                  )

                  setConversations(
                    (
                      previous
                    ) => {

                      return previous.map(
                        (
                          item
                        ) => {

                          if (
                            item.id !==
                            session.id
                          ) {

                            return item
                          }

                          return {
                            ...item,

                            title:
                              "Conversation",

                            preview:
                              "Unable to load preview.",

                            isHydrating:
                              false,
                          }
                        }
                      )
                    }
                  )
                }
              }
            )

          } catch (error) {

            console.error(
              "FETCH_HISTORY_ERROR",
              error
            )

            setConversations(
              []
            )

            setLoading(
              false
            )
          }
        },
        []
      )

    /* ========================================
       SELECT
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
       CLEAR ALL
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