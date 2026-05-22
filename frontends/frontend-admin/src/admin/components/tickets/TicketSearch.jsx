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

            text-[var(--text-secondary)]
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

            text-[var(--text-primary)]
          "
        >
          Tickets
        </h2>

        <p
          className="
            mt-2

            text-sm

            text-[var(--text-secondary)]
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
            border-[var(--border)]

            bg-[var(--panel)]

            px-4
            py-3

            transition-all
            duration-200

            focus-within:border-[var(--accent)]/30
            focus-within:bg-[var(--panel-light)]
            focus-within:shadow-[0_0_0_4px_rgba(245,213,71,0.05)]

            lg:w-[340px]
          "
        >
          <Search
            className="
              h-4
              w-4
              shrink-0

              text-[var(--text-secondary)]
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

              text-[var(--text-primary)]

              outline-none

              placeholder:text-[var(--text-secondary)]
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
              muted-card

              flex
              items-center
              gap-3

              rounded-2xl

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

                bg-[var(--accent)]/10
              "
            >
              <Ticket
                className="
                  h-5
                  w-5

                  text-[var(--accent)]
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

                  text-[var(--text-secondary)]
                "
              >
                Total
              </p>

              <p
                className="
                  mt-1

                  text-lg
                  font-bold

                  text-[var(--text-primary)]
                "
              >
                {totalTickets}
              </p>
            </div>
          </div>

          {/* STATUS */}
          <div
            className="
              muted-card

              flex
              items-center
              gap-3

              rounded-2xl

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

                  text-red-600

                  dark:text-red-400
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

                  text-[var(--text-secondary)]
                "
              >
                Moderation
              </p>

              <p
                className="
                  mt-1

                  text-sm
                  font-semibold

                  text-[var(--text-primary)]
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