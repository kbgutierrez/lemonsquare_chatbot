import {
  Search,
} from "lucide-react"

const TicketSearch = ({
  search,
  setSearch,
}) => {

  return (
    <div
      className="
        flex
        items-center
        gap-2

        rounded-2xl

        border
        border-violet-200

        bg-white

        px-4
        py-3
      "
    >
      <Search
        className="
          h-4
          w-4
          text-violet-500
        "
      />

      <input
        value={search}
        onChange={(event) =>
          setSearch(
            event.target.value
          )
        }
        placeholder="Search tickets..."
        className="
          w-full
          bg-transparent
          text-sm
          outline-none
        "
      />
    </div>
  )
}

export default TicketSearch