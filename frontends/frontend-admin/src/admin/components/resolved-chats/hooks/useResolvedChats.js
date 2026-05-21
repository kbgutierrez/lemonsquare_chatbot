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
  () => {

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

          const response =
            await apiClient.get(
              `${endpoint}?doc_type=resolved_chat`
            )

          return Array.isArray(
            response
          )
            ? response
            : []
        },
        []
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
        CACHE_KEY,

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
              CACHE_KEY,
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
              CACHE_KEY
            )

            await refresh()

          } catch (error) {

            console.error(
              "UPDATE_RESOLVED_CHAT_ERROR",
              error
            )

            /* ROLLBACK */

            setCachedData(
              CACHE_KEY,
              previous
            )

            throw error
          }
        },
        [
          items,
          refresh,
        ]
      )

    /* ========================================
       DELETE CHAT
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

            const optimistic =
              items.filter(
                (item) =>
                  item.id !==
                  sessionId
              )

            /* OPTIMISTIC CACHE */

            setCachedData(
              CACHE_KEY,
              optimistic
            )

            await apiClient.delete(
              endpoint
            )

            invalidateCache(
              CACHE_KEY
            )

            await refresh()

          } catch (error) {

            console.error(
              "DELETE_RESOLVED_CHAT_ERROR",
              error
            )

            /* ROLLBACK */

            setCachedData(
              CACHE_KEY,
              previous
            )

            throw error
          }
        },
        [
          items,
          refresh,
        ]
      )

    return {
      items,
      loading,
      error,

      loadChats:
        refresh,

      updateChat,
      deleteChat,
    }
  }