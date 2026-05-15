import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

import apiClient, {
  buildApiUrl,
} from "../../../../shared/api/client"

import {
  API_ENDPOINTS,
} from "../../../../shared/api/endpoints"

export const useResolvedChats =
  () => {

    /* ========================================
       REFS
    ======================================== */

    const mountedRef =
      useRef(true)

    /* ========================================
       STATE
    ======================================== */

    const [items, setItems] =
      useState([])

    const [loading, setLoading] =
      useState(true)

    const [error, setError] =
      useState("")

    /* ========================================
       CLEANUP
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
       LOAD CHATS
    ======================================== */

    const loadChats =
      useCallback(
        async () => {

          try {

            if (
              mountedRef.current
            ) {

              setLoading(true)

              setError("")
            }

            const endpoint =
              buildApiUrl(
                API_ENDPOINTS.KNOWLEDGE_EXPLORE
              )

            const response =
              await apiClient.get(
                `${endpoint}?doc_type=resolved_chat`
              )

            if (
              !mountedRef.current
            ) {
              return
            }

            setItems(
              Array.isArray(
                response
              )
                ? response
                : []
            )

          } catch (error) {

            console.error(
              "RESOLVED_CHATS_ERROR",
              error
            )

            if (
              mountedRef.current
            ) {

              setItems([])

              setError(
                error.message ||
                "Failed to load resolved chats."
              )
            }

          } finally {

            if (
              mountedRef.current
            ) {

              setLoading(false)
            }
          }
        },
        []
      )

    /* ========================================
       INITIAL LOAD
    ======================================== */

    useEffect(() => {

      loadChats()

    }, [loadChats])

    /* ========================================
       UPDATE CHAT
    ======================================== */

    const updateChat =
      useCallback(
        async (
          sessionId,
          payload
        ) => {

          const endpoint =
            buildApiUrl(
              API_ENDPOINTS.SELF_KNOWLEDGE_UPDATE,
              {
                sessionId,
              }
            )

          await apiClient.put(
            endpoint,
            payload
          )

          await loadChats()
        },
        [loadChats]
      )

    /* ========================================
       DELETE CHAT
    ======================================== */

    const deleteChat =
      useCallback(
        async (
          sessionId
        ) => {

          const endpoint =
            buildApiUrl(
              API_ENDPOINTS.SELF_KNOWLEDGE_DELETE,
              {
                sessionId,
              }
            )

          await apiClient.delete(
            endpoint
          )

          await loadChats()
        },
        [loadChats]
      )

    return {
      items,
      loading,
      error,

      loadChats,

      updateChat,
      deleteChat,
    }
  }