import {
  useMemo,
  useState,
} from "react"

import {
  AnimatePresence,
} from "framer-motion"

import {
  useResolvedChats,
} from "./hooks/useResolvedChats"

import ResolvedChatsHeader
  from "./components/ResolvedChatsHeader"

import ResolvedChatsEmpty
  from "./components/ResolvedChatsEmpty"

import ResolvedChatsPagination
  from "./components/ResolvedChatsPagination"

import ResolvedChatCard
  from "./components/ResolvedChatCard"

import ResolvedChatEditModal
  from "./components/ResolvedChatEditModal"

const ITEMS_PER_PAGE = 6

const ResolvedChatsSection =
  () => {

    const {
      items,
      loading,
      updateChat,
      deleteChat,
    } =
      useResolvedChats()

    const safeItems =
      Array.isArray(items)
        ? items
        : []

    const [search, setSearch] =
      useState("")

    const [page, setPage] =
      useState(1)

    const [
      selectedItem,
      setSelectedItem,
    ] = useState(null)

    const [
      modalOpen,
      setModalOpen,
    ] = useState(false)

    const filtered =
      useMemo(() => {

        const query =
          String(search || "")
            .toLowerCase()

        return safeItems.filter(
          (item) => {

            const content =
              String(
                item?.content ||
                ""
              ).toLowerCase()

            const source =
              String(
                item?.source ||
                ""
              ).toLowerCase()

            return (
              content.includes(
                query
              ) ||
              source.includes(
                query
              )
            )
          }
        )

      }, [
        safeItems,
        search,
      ])

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          filtered.length /
            ITEMS_PER_PAGE
        )
      )

    const paginatedItems =
      filtered.slice(
        (page - 1) *
          ITEMS_PER_PAGE,

        page *
          ITEMS_PER_PAGE
      )

    const handleEdit =
      (item) => {

        setSelectedItem(
          item
        )

        setModalOpen(
          true
        )
      }

    const handleDelete =
      async (
        sessionId
      ) => {

        const confirmed =
          window.confirm(
            "Delete this resolved chat?"
          )

        if (
          !confirmed
        ) {
          return
        }

        try {

          await deleteChat(
            sessionId
          )

        } catch (error) {

          console.error(
            "DELETE_CHAT_ERROR",
            error
          )
        }
      }

    return (
      <>
        <div className="flex h-full flex-col gap-5">

          <ResolvedChatsHeader
            search={search}
            setSearch={
              setSearch
            }
          />

          <div
            className="
              flex-1
              overflow-auto

              rounded-[28px]

              border
              border-[#26332d]

              bg-[#121a18]

              p-5
            "
          >
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div
                  className="
                    h-10
                    w-10

                    rounded-full

                    border-2
                    border-[#f5d547]/20
                    border-t-[#f5d547]

                    animate-spin
                  "
                />
              </div>
            ) : paginatedItems.length ===
              0 ? (
              <ResolvedChatsEmpty />
            ) : (
              <div className="grid gap-4">

                <AnimatePresence mode="popLayout">

                  {paginatedItems.map(
                    (
                      item,
                      index
                    ) => (
                      <ResolvedChatCard
                        key={
                          item?.id ||
                          index
                        }

                        item={
                          item
                        }

                        index={
                          index
                        }

                        onEdit={
                          handleEdit
                        }

                        onDelete={
                          handleDelete
                        }
                      />
                    )
                  )}

                </AnimatePresence>
              </div>
            )}
          </div>

          <ResolvedChatsPagination
            page={page}

            setPage={
              setPage
            }

            totalPages={
              totalPages
            }
          />
        </div>

        <ResolvedChatEditModal
          open={modalOpen}

          item={selectedItem}

          onClose={() =>
            setModalOpen(
              false
            )
          }

          onSave={
            updateChat
          }
        />
      </>
    )
  }

export default ResolvedChatsSection