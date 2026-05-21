import {
  useState,
} from "react"

import {
  ChevronDown,
} from "lucide-react"

const DropdownCard = ({
  title,
  icon: Icon,
  color,
  children,
}) => {

  const [open, setOpen] =
    useState(false)

  return (
    <div
      className="
        overflow-hidden

        rounded-3xl

        border
        border-[#25332d]

        bg-[#151d1b]
      "
    >
      <button
        onClick={() =>
          setOpen(!open)
        }
        className="
          flex
          w-full
          items-center
          justify-between

          p-5
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <Icon
            className={`
              h-4
              w-4
              ${color}
            `}
          />

          <span
            className="
              text-sm
              font-semibold

              text-white
            "
          >
            {title}
          </span>
        </div>

        <ChevronDown
          className={`
            h-4
            w-4

            text-[#8ea59b]

            transition-transform

            ${
              open
                ? "rotate-180"
                : ""
            }
          `}
        />
      </button>

      {open && (
        <div className="px-5 pb-5">
          {children}
        </div>
      )}
    </div>
  )
}

export default DropdownCard