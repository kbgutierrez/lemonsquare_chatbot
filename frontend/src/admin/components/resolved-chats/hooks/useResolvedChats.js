import {
  useEffect,
  useState,
} from "react"

import {
  API_CONFIG,
} from "../../../../config/sqlVariables"

const API_URL =
  `${API_CONFIG.BASE_URL}/knowledge/explore?doc_type=resolved_chat`

export const useResolvedChats =
  () => {

    const [items, setItems] =
      useState([])

    const [loading, setLoading] =
      useState(true)

    const loadChats =
      async () => {

        try {

          setLoading(true)

          const response =
            await fetch(
              API_URL
            )

          if (
            !response.ok
          ) {

            throw new Error(
              "Failed to fetch resolved chats"
            )
          }

          const data =
            await response.json()

          setItems(
            Array.isArray(
              data
            )
              ? data
              : []
          )

        } catch (error) {

          console.error(
            "RESOLVED_CHATS_ERROR",
            error
          )

          setItems([])

        } finally {

          setLoading(false)
        }
      }

    useEffect(() => {

      loadChats()

    }, [])

    const updateChat =
      async (
        sessionId,
        payload
      ) => {

        const response =
          await fetch(
            `${API_CONFIG.BASE_URL}/self_knowledge/chats/${sessionId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          )

        if (
          !response.ok
        ) {

          throw new Error(
            "Failed to update resolved chat"
          )
        }

        await loadChats()
      }

    const deleteChat =
      async (
        sessionId
      ) => {

        const response =
          await fetch(
            `${API_CONFIG.BASE_URL}/self_knowledge/chats/${sessionId}`,
            {
              method:
                "DELETE",
            }
          )

        if (
          !response.ok
        ) {

          throw new Error(
            "Failed to delete resolved chat"
          )
        }

        await loadChats()
      }

    return {
      items,
      loading,
      loadChats,
      updateChat,
      deleteChat,
    }
  }