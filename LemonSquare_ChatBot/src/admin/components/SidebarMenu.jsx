import {
  Upload,
  FolderOpen,
  BrainCircuit,
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
    <div
      className="
        rounded-3xl

        border
        border-violet-100

        bg-white/80

        p-3

        shadow-sm
        backdrop-blur-sm
      "
    >
      {/* TITLE */}
      <p
        className="
          mb-3

          px-2

          text-xs
          font-bold
          uppercase
          tracking-[0.2em]
          text-violet-500
        "
      >
        Navigation
      </p>

      {/* ITEMS */}
      <div className="space-y-2">
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

                  px-3
                  py-3

                  text-left
                  text-sm
                  font-medium

                  transition-all
                  duration-200

                  ${
                    active
                      ? `
                        bg-gradient-to-r
                        from-violet-600
                        to-purple-500

                        text-white

                        shadow-lg
                      `
                      : `
                        text-violet-700

                        hover:bg-violet-50
                      `
                  }
                `}
              >
                {/* ICON */}
                <div
                  className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center

                    rounded-xl

                    transition-all
                    duration-200

                    ${
                      active
                        ? `
                          bg-white/20
                        `
                        : `
                          bg-violet-100

                          group-hover:bg-violet-200
                        `
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-4
                      w-4

                      ${
                        active
                          ? "text-white"
                          : "text-violet-700"
                      }
                    `}
                  />
                </div>

                {/* LABEL */}
                <span className="truncate">
                  {label}
                </span>
              </button>
            )
          }
        )}
      </div>
    </div>
  )
}

export default SidebarMenu