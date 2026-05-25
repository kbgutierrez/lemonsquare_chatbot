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
        panel-base

        overflow-hidden

        rounded-3xl
      "
    >
      <button
        onClick={() =>
          setOpen(!open)
        }
        className="
          hover-surface

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

              text-[var(--text-primary)]
            "
          >
            {title}
          </span>
        </div>

        <ChevronDown
          className={`
            h-4
            w-4

            text-[var(--text-secondary)]

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