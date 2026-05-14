import {
  Search,
  Plus,
} from "lucide-react"

const ManualEntriesHeader =
  ({
    search,
    setSearch,
    setShowModal,
  }) => {

    const handleOpenModal =
      () => {

        console.log(
          "OPEN_CREATE_MODAL"
        )

        setShowModal(
          true
        )
      }

    return (
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-4
        "
      >

        {/* LEFT */}
        <div>
          <h1
            className="
              text-2xl
              font-bold
              text-white
            "
          >
            Manual Entries
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-[#8ea59b]
            "
          >
            Custom AI operational
            rules and manually fed
            knowledge.
          </p>
        </div>

        {/* RIGHT */}
        <div
          className="
            flex
            w-full
            flex-wrap
            items-center
            gap-3
            sm:w-auto
          "
        >

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
              sm:w-[300px]
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
              type="text"

              value={search}

              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }

              placeholder="Search entries..."

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

          {/* ADD BUTTON */}
          <button
            type="button"

            onClick={
              handleOpenModal
            }

            className="
              flex
              items-center
              gap-2
              rounded-2xl
              bg-[#f5d547]
              px-5
              py-3
              text-sm
              font-semibold
              text-[#111917]
              transition-all
              duration-200
              hover:scale-[1.02]
              hover:brightness-105
            "
          >
            <Plus className="h-4 w-4" />

            <span>
              Add Entry
            </span>
          </button>
        </div>
      </div>
    )
  }

export default ManualEntriesHeader