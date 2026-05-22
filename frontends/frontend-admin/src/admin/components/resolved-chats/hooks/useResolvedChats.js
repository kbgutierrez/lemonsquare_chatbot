import {
  useCallback,
} from "react"

import apiClient, {
  buildApiUrl,
} from "../../../../shared/api/client"

import {
  API_ENDPOINTS,
} from "../../../../shared/api/endpoints"

import useLiveQuery
  from "../../../../shared/hooks/useLiveQuery"

import {
  invalidateCache,
  setCachedData,
} from "../../../../shared/cache/liveQueryCache"

const CACHE_KEY =
  "resolved_chats"

export const useResolvedChats =
  (
    lifecycle = "active"
  ) => {

    /* ========================================
       FETCHER
    ======================================== */

    const fetchResolvedChats =
      useCallback(
        async () => {

          const endpoint =
            buildApiUrl(
              API_ENDPOINTS.KNOWLEDGE_EXPLORE
            )

          /*
            BACKEND NOW SUPPORTS:

            ?lifecycle=active
            ?lifecycle=inactive
          */

          const response =
            await apiClient.get(
              `${endpoint}?doc_type=resolved_chat&lifecycle=${lifecycle}`
            )

          return Array.isArray(
            response
          )
            ? response
            : []
        },
        [
          lifecycle,
        ]
      )

    /* ========================================
       LIVE QUERY
    ======================================== */

    const {
      data: items = [],
      loading,
      error,
      refresh,
    } = useLiveQuery({
      queryKey:
        `${CACHE_KEY}_${lifecycle}`,

      queryFn:
        fetchResolvedChats,

      staleWhileRevalidate:
        true,

      refetchInterval:
        15000,
    })

    /* ========================================
       UPDATE CHAT
    ======================================== */

    const updateChat =
      useCallback(
        async (
          sessionId,
          payload
        ) => {

          const previous =
            [...items]

          try {

            const optimistic =
              items.map(
                (item) => {

                  if (
                    item.id ===
                    sessionId
                  ) {

                    return {
                      ...item,
                      ...payload,
                    }
                  }

                  return item
                }
              )

            /* OPTIMISTIC CACHE */

            setCachedData(
              `${CACHE_KEY}_${lifecycle}`,
              optimistic
            )

            const endpoint =
              buildApiUrl(
                API_ENDPOINTS.SELF_KNOWLEDGE_UPDATE,
                {
                  sessionId,
                }
              )

            console.log(
              "UPDATE_SESSION_ID:",
              sessionId
            )

            console.log(
              "UPDATE_ENDPOINT:",
              endpoint
            )

            await apiClient.put(
              endpoint,
              payload
            )

            invalidateCache(
              `${CACHE_KEY}_${lifecycle}`
            )

            await refresh()

          } catch (error) {

            console.error(
              "UPDATE_RESOLVED_CHAT_ERROR",
              error
            )

            /* ROLLBACK */

            setCachedData(
              `${CACHE_KEY}_${lifecycle}`,
              previous
            )

            throw error
          }
        },
        [
          items,
          refresh,
          lifecycle,
        ]
      )

    /* ========================================
       ARCHIVE CHAT
    ======================================== */

    const deleteChat =
      useCallback(
        async (
          sessionId
        ) => {

          const previous =
            [...items]

          try {

            console.log(
              "DELETE_SESSION_ID:",
              sessionId
            )

            const endpoint =
              buildApiUrl(
                API_ENDPOINTS.SELF_KNOWLEDGE_DELETE,
                {
                  sessionId,
                }
              )

            console.log(
              "DELETE_ENDPOINT:",
              endpoint
            )

            /*
              OPTIMISTIC REMOVE
            */

            const optimistic =
              items.filter(
                (item) =>
                  item.id !==
                  sessionId
              )

            setCachedData(
              `${CACHE_KEY}_${lifecycle}`,
              optimistic
            )

            await apiClient.delete(
              endpoint
            )

            invalidateCache(
              `${CACHE_KEY}_${lifecycle}`
            )

            invalidateCache(
              `${CACHE_KEY}_active`
            )

            invalidateCache(
              `${CACHE_KEY}_inactive`
            )

            await refresh()

          } catch (error) {

            console.error(
              "DELETE_RESOLVED_CHAT_ERROR",
              error
            )

            /* ROLLBACK */

            setCachedData(
              `${CACHE_KEY}_${lifecycle}`,
              previous
            )

            throw error
          }
        },
        [
          items,
          refresh,
          lifecycle,
        ]
      )

    /* ========================================
       RESTORE CHAT
    ======================================== */

    const restoreChat =
      useCallback(
        async (
          sessionId
        ) => {

          const previous =
            [...items]

          try {

            console.log(
              "RESTORE_SESSION_ID:",
              sessionId
            )

            const endpoint =
              buildApiUrl(
                API_ENDPOINTS.SELF_KNOWLEDGE_RESTORE,
                {
                  sessionId,
                }
              )

            console.log(
              "RESTORE_ENDPOINT:",
              endpoint
            )

            /*
              OPTIMISTIC REMOVE
              FROM INACTIVE LIST
            */

            const optimistic =
              items.filter(
                (item) =>
                  item.id !==
                  sessionId
              )

            setCachedData(
              `${CACHE_KEY}_${lifecycle}`,
              optimistic
            )

            await apiClient.post(
              endpoint
            )

            invalidateCache(
              `${CACHE_KEY}_${lifecycle}`
            )

            invalidateCache(
              `${CACHE_KEY}_active`
            )

            invalidateCache(
              `${CACHE_KEY}_inactive`
            )

            await refresh()

          } catch (error) {

            console.error(
              "RESTORE_RESOLVED_CHAT_ERROR",
              error
            )

            /* ROLLBACK */

            setCachedData(
              `${CACHE_KEY}_${lifecycle}`,
              previous
            )

            throw error
          }
        },
        [
          items,
          refresh,
          lifecycle,
        ]
      )

    return {
      items,
      loading,
      error,

      lifecycle,

      loadChats:
        refresh,

      updateChat,
      deleteChat,
      restoreChat,
    }
  }