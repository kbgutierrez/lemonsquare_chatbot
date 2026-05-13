import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Search,
  MessagesSquare,
} from "lucide-react"

import {
  API_CONFIG,
} from "../../../config/sqlVariables"

const API_URL =
  `${API_CONFIG.BASE_URL}/self_knowledge?filter_type=resolved_chat`

const ITEMS_PER_PAGE = 6

const ResolvedChatsSection =
  () => {

    const [items, setItems] =
      useState([])

    const [loading, setLoading] =
      useState(true)

    const [search, setSearch] =
      useState("")

    const [page, setPage] =
      useState(1)

    useEffect(() => {

      const loadData =
        async () => {

          try {

            setLoading(true)

            const response =
              await fetch(
                API_URL
              )

            const data =
              await response.json()

            setItems(data)

          } catch (error) {

            console.error(
              "RESOLVED_CHATS_ERROR",
              error
            )

          } finally {

            setLoading(false)
          }
        }

      loadData()

    }, [])

    const filtered =
      useMemo(() => {

        return items.filter(
          (item) =>
            item.content
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              )
        )

      }, [items, search])

    const totalPages =
      Math.ceil(
        filtered.length /
          ITEMS_PER_PAGE
      )

    const paginatedItems =
      filtered.slice(
        (page - 1) *
          ITEMS_PER_PAGE,

        page *
          ITEMS_PER_PAGE
      )

    return (
      <div className="flex h-full flex-col gap-5">

        {/* HEADER */}
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between

            gap-4
          "
        >
          <div>
            <h1
              className="
                text-2xl
                font-bold

                text-white
              "
            >
              Resolved Chats
            </h1>

            <p
              className="
                mt-1

                text-sm

                text-[#8ea59b]
              "
            >
              AI learned knowledge
              from resolved user
              conversations.
            </p>
          </div>

          {/* SEARCH */}
          <div
            className="
              flex
              w-full
              items-center
              gap-3

              rounded-2xl

              border
              border-[#2d3b35]

              bg-[#18211f]

              px-4
              py-3

              sm:w-[340px]
            "
          >
            <Search
              className="
                h-4
                w-4

                text-[#70847b]
              "
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search chats..."
              className="
                w-full
                bg-transparent
                text-sm
                text-white
                outline-none
                placeholder:text-[#70847b]
              "
            />
          </div>
        </div>

        {/* CONTENT */}
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
            <div className="flex h-full items-center justify-center">
              <div className="text-center">

                <MessagesSquare
                  className="
                    mx-auto
                    mb-4

                    h-10
                    w-10

                    text-[#f5d547]
                  "
                />

                <h3
                  className="
                    text-lg
                    font-semibold

                    text-white
                  "
                >
                  No resolved chats
                </h3>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {paginatedItems.map(
                (item) => (
                  <div
                    key={item.id}
                    className="
                      rounded-3xl

                      border
                      border-[#26332d]

                      bg-[#18211f]

                      p-5
                    "
                  >
                    <div
                      className="
                        mb-3

                        flex
                        flex-wrap
                        items-center
                        gap-3
                      "
                    >
                      <span
                        className="
                          rounded-2xl

                          bg-[#f5d547]/10

                          px-3
                          py-1

                          text-xs
                          font-semibold

                          text-[#f5d547]
                        "
                      >
                        Resolved Chat
                      </span>

                      <span
                        className="
                          text-xs

                          text-[#8ea59b]
                        "
                      >
                        {item.source}
                      </span>
                    </div>

                    <p
                      className="
                        whitespace-pre-wrap

                        text-sm
                        leading-relaxed

                        text-[#d7e0dc]
                      "
                    >
                      {item.content}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div
            className="
              flex
              items-center
              justify-center

              gap-2
            "
          >
            {Array.from(
              {
                length:
                  totalPages,
              },
              (_, i) =>
                i + 1
            ).map((number) => (
              <button
                key={number}
                onClick={() =>
                  setPage(
                    number
                  )
                }
                className={`
                  h-10
                  w-10

                  rounded-xl

                  text-sm
                  font-semibold

                  transition-all

                  ${
                    page ===
                    number
                      ? `
                        bg-[#f5d547]
                        text-[#111917]
                      `
                      : `
                        bg-[#18211f]
                        text-white

                        hover:bg-[#202b27]
                      `
                  }
                `}
              >
                {number}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

export default ResolvedChatsSection