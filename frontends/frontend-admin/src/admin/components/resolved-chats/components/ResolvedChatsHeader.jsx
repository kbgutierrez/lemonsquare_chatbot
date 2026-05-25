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

            text-[color:var(--text-primary)]
          "
        >
          Resolved Chats
        </h1>

        <p
          className="
            mt-1
            text-sm

            text-[color:var(--text-secondary)]
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
          theme-border

          bg-[color:var(--panel)]

          px-4
          py-3

          shadow-[var(--shadow-soft)]

          transition-all
          duration-200

          focus-within:border-[color:var(--accent)]
          focus-within:shadow-[0_0_0_4px_rgba(245,213,71,0.08)]

          lg:w-[360px]
        "
      >

        <Search
          className="
            h-4
            w-4

            text-[color:var(--text-muted)]
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
            text-[color:var(--text-primary)]

            outline-none

            placeholder:text-[color:var(--placeholder)]
          "
        />

      </div>
    </div>
  )
}

export default ResolvedChatsHeader