import {
  Search,
} from "lucide-react"

const ResolvedChatsHeader = ({
  search,
  setSearch,
}) => {

  return (
    <div
      className="
        flex
        flex-col
        gap-4

        lg:flex-row
        lg:items-center
        lg:justify-between
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
          AI learned knowledge from
          successful conversations.
        </p>
      </div>

      <div
        className="
          flex
          items-center
          gap-3

          rounded-2xl
          border
          border-[#2d3b35]

          bg-[#18211f]

          px-4
          py-3

          lg:w-[360px]
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
          placeholder="Search resolved chats..."
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
  )
}

export default ResolvedChatsHeader