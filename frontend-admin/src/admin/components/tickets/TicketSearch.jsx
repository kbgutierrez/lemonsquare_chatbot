import {
  Search,
  Ticket,
  ShieldAlert,
} from "lucide-react"

const TicketSearch = ({
  search,
  setSearch,
  totalTickets = 0,
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
      {/* LEFT */}
      <div className="min-w-0">

        <p
          className="
            text-xs
            font-semibold
            uppercase

            tracking-[0.22em]

            text-[#74877f]
          "
        >
          Support Workspace
        </p>

        <h2
          className="
            mt-2

            text-3xl
            font-bold

            tracking-tight

            text-white
          "
        >
          Tickets
        </h2>

        <p
          className="
            mt-2

            text-sm

            text-[#8ea59b]
          "
        >
          Manage support requests,
          blocked users, and ticket
          moderation.
        </p>
      </div>

      {/* RIGHT */}
      <div
        className="
          flex
          flex-col
          gap-3

          lg:items-end
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
            border-[#2b3933]

            bg-[#141d1a]

            px-4
            py-3

            transition-all
            duration-200

            focus-within:border-[#f5d547]/30
            focus-within:bg-[#18211f]

            lg:w-[340px]
          "
        >
          <Search
            className="
              h-4
              w-4
              shrink-0

              text-[#74877f]
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

              text-white

              outline-none

              placeholder:text-[#74877f]
            "
          />
        </div>

        {/* METRICS */}
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-3
          "
        >
          {/* TOTAL */}
          <div
            className="
              flex
              items-center
              gap-3

              rounded-2xl

              border
              border-[#2b3933]

              bg-[#141d1a]

              px-4
              py-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-2xl

                bg-[#f5d547]/10
              "
            >
              <Ticket
                className="
                  h-5
                  w-5

                  text-[#f5d547]
                "
              />
            </div>

            <div>
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase

                  tracking-[0.18em]

                  text-[#74877f]
                "
              >
                Total
              </p>

              <p
                className="
                  mt-1

                  text-lg
                  font-bold

                  text-white
                "
              >
                {totalTickets}
              </p>
            </div>
          </div>

          {/* STATUS */}
          <div
            className="
              flex
              items-center
              gap-3

              rounded-2xl

              border
              border-[#2b3933]

              bg-[#141d1a]

              px-4
              py-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-2xl

                bg-red-500/10
              "
            >
              <ShieldAlert
                className="
                  h-5
                  w-5

                  text-red-400
                "
              />
            </div>

            <div>
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase

                  tracking-[0.18em]

                  text-[#74877f]
                "
              >
                Moderation
              </p>

              <p
                className="
                  mt-1

                  text-sm
                  font-semibold

                  text-white
                "
              >
                Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketSearch