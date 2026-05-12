import {
  Upload,
  FolderOpen,
  BrainCircuit,
  Ticket,
} from "lucide-react"

const menuItems = [
  {
    id: "upload",
    label: "Upload",
    icon: Upload,
  },

  {
    id: "files",
    label: "Knowledge Files",
    icon: FolderOpen,
  },

  {
    id: "tickets",
    label: "Tickets",
    icon: Ticket,
  },

  {
    id: "ai",
    label: "AI Configuration",
    icon: BrainCircuit,
  },
]

const SidebarMenu = ({
  activeView,
  setActiveView,
}) => {

  return (
    <aside
      className="
        flex
        h-full
        flex-col

        overflow-hidden

        rounded-[28px]

        border
        border-[#2a3a33]

        bg-[#111917]

        p-4

        shadow-[0_10px_40px_rgba(0,0,0,0.35)]
      "
    >
      {/* LOGO */}
      <div
        className="
          mb-8

          flex
          items-center
          gap-3

          rounded-2xl

          border
          border-[#27342e]

          bg-[#161f1d]

          px-4
          py-4
        "
      >
        {/* LOGO BOX */}
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center

            rounded-2xl

            bg-[#f5d547]
          "
        >
          <span
            className="
              text-sm
              font-black
              tracking-wide

              text-[#111917]
            "
          >
            LS
          </span>
        </div>

        {/* TEXT */}
        <div className="min-w-0">
          <h2
            className="
              truncate

              text-sm
              font-bold

              tracking-wide

              text-white
            "
          >
            Lemon Square
          </h2>

          <p
            className="
              mt-0.5

              text-xs

              text-[#8ea59b]
            "
          >
            Admin Panel
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="mb-3 px-2">
        <p
          className="
            text-[11px]
            font-semibold
            uppercase

            tracking-[0.22em]

            text-[#718379]
          "
        >
          Navigation
        </p>
      </div>

      {/* MENU */}
      <div className="flex flex-col gap-2">
        {menuItems.map(
          ({
            id,
            label,
            icon: Icon,
          }) => {

            const active =
              activeView === id

            return (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setActiveView(id)
                }
                className={`
                  group

                  flex
                  w-full
                  items-center
                  gap-3

                  rounded-2xl

                  px-3.5
                  py-3

                  text-left

                  transition-all
                  duration-200

                  ${
                    active
                      ? `
                        border
                        border-[#46544d]

                        bg-[#1c2723]

                        text-white
                      `
                      : `
                        border
                        border-transparent

                        text-[#b6c3bd]

                        hover:bg-[#171f1d]
                        hover:text-white
                      `
                  }
                `}
              >
                {/* ICON */}
                <div
                  className={`
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center

                    rounded-xl

                    transition-all
                    duration-200

                    ${
                      active
                        ? `
                          bg-[#f5d547]

                          text-[#111917]
                        `
                        : `
                          bg-[#202a27]

                          text-[#b6c3bd]

                          group-hover:bg-[#2a3632]
                          group-hover:text-white
                        `
                    }
                  `}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>

                {/* LABEL */}
                <span
                  className="
                    truncate

                    text-sm
                    font-medium
                  "
                >
                  {label}
                </span>
              </button>
            )
          }
        )}
      </div>
    </aside>
  )
}

export default SidebarMenu