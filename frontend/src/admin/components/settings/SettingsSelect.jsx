import {
  ChevronDown,
} from "lucide-react"

const SettingsSelect = ({
  label,
  value,
  onChange,
  options = [],
}) => {

  return (
    <div className="space-y-3">

      {/* LABEL */}
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
          {label}
        </p>
      </div>

      {/* SELECT */}
      <div className="relative">

        <select
          value={value}
          onChange={onChange}
          className="
            w-full
            appearance-none

            rounded-2xl

            border
            border-[#2a3732]

            bg-[#141d1a]

            px-4
            py-3.5
            pr-12

            text-sm
            font-medium

            text-white

            outline-none

            transition-all
            duration-200

            focus:border-[#f5d547]/30
            focus:bg-[#18211f]
            focus:shadow-[0_0_0_4px_rgba(245,213,71,0.06)]
          "
        >
          {options.map(
            (option) => (
              <option
                key={option.value}
                value={option.value}
                className="
                  bg-[#141d1a]
                  text-white
                "
              >
                {option.label}
              </option>
            )
          )}
        </select>

        {/* ICON */}
        <div
          className="
            pointer-events-none

            absolute
            right-4
            top-1/2

            -translate-y-1/2
          "
        >
          <ChevronDown
            className="
              h-4
              w-4

              text-[#74877f]
            "
          />
        </div>
      </div>
    </div>
  )
}

export default SettingsSelect