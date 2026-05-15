import {
  LogOut,
} from "lucide-react"

import {
  navigationItems,
} from "../constants/navigation"

const SidebarMenu = ({
  activeView,
  setActiveView,
  onLogout,
}) => {

  return (
    <aside
      className="
        flex
        h-full
        min-h-0
        w-full
        flex-col

        overflow-hidden

        rounded-[28px]

        border
        border-[#2a3a33]

        bg-[#111917]

        p-3
        sm:p-4

        shadow-[0_10px_40px_rgba(0,0,0,0.35)]
      "
    >
      {/* HEADER */}
      <div
        className="
          mb-6
          shrink-0

          flex
          items-center
          justify-between
          gap-3

          rounded-2xl

          border
          border-[#27342e]

          bg-[#161f1d]

          px-3
          py-3
          sm:px-4
          sm:py-4
        "
      >
        {/* LEFT */}
        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          {/* LOGO */}
          <div
            className="
              flex
              h-10
              w-10
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
          <div className="min-w-0 flex-1">
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

                truncate

                text-xs

                text-[#8ea59b]
              "
            >
              Admin Panel
            </p>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={onLogout}
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center

            rounded-xl

            border
            border-[#2d3b35]

            bg-[#1a2320]

            text-[#c6d1cc]

            transition-all
            duration-200

            hover:border-red-500/40
            hover:bg-red-500/10
            hover:text-red-300
          "
        >
          <LogOut
            className="
              h-4
              w-4
            "
          />
        </button>
      </div>

      {/* NAV LABEL */}
      <div className="mb-3 shrink-0 px-2">
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

      {/* SCROLLABLE MENU */}
      <div
        className="
          flex-1
          min-h-0

          overflow-y-auto
          overflow-x-hidden

          pr-1

          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        <div className="flex flex-col gap-2">
          {navigationItems.map(
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
                    min-w-0
                    items-center
                    gap-3

                    rounded-2xl

                    px-3
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
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                  </div>

                  {/* LABEL */}
                  <span
                    className="
                      min-w-0
                      flex-1

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
      </div>
    </aside>
  )
}

export default SidebarMenu