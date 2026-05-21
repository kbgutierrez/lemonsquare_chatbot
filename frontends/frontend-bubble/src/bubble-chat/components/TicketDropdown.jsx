import { useState } from "react"

import { ChevronDown } from "lucide-react"

const TicketDropdown = ({
  icon: Icon,
  value,
  items,
  onChange,
}) => {

  const [open, setOpen] =
    useState(false)

  const toggleDropdown =
    () => {

      setOpen(
        previous =>
          !previous
      )
    }

  const handleSelect =
    item => {

      onChange(item)

      setOpen(false)
    }

  return (
    <div className="relative z-[80]">

      <button
        type="button"
        onClick={toggleDropdown}
        className="
          flex
          items-center
          gap-2

          rounded-2xl
          border
          border-violet-200

          bg-white/80

          px-4
          py-2.5

          text-sm
          font-medium
          text-slate-700

          shadow-sm

          transition-all
          duration-200

          hover:bg-violet-50
        "
      >

        {Icon && (
          <Icon
            className="
              h-4
              w-4
              text-violet-500
            "
          />
        )}

        {value}

        <ChevronDown
          className={`
            h-4
            w-4

            transition-transform
            duration-200

            ${
              open
                ? "rotate-180"
                : ""
            }
          `}
        />

      </button>

      <div
        className={`
          absolute
          right-0
          top-[calc(100%+10px)]
          z-[90]

          min-w-[180px]

          overflow-hidden

          rounded-2xl
          border
          border-violet-100

          bg-white

          shadow-[0_20px_40px_rgba(0,0,0,0.12)]

          transition-all
          duration-200

          ${
            open
              ? `
                pointer-events-auto
                translate-y-0
                opacity-100
              `
              : `
                pointer-events-none
                -translate-y-2
                opacity-0
              `
          }
        `}
      >

        {items.map(item => (

          <button
            key={item}
            type="button"
            onClick={() =>
              handleSelect(
                item
              )
            }
            className="
              w-full

              px-4
              py-3

              text-left
              text-sm
              text-slate-700

              transition-colors
              duration-150

              hover:bg-violet-50
            "
          >
            {item}
          </button>

        ))}

      </div>

    </div>
  )
}

export default TicketDropdown