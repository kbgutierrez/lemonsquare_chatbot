import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  ChevronDown,
  Check,
} from "lucide-react"

const UploadCategorySelector = ({
  categories = [],
  selectedCategory = "",
  setSelectedCategory,
}) => {

  const [
    dropdownOpen,
    setDropdownOpen,
  ] = useState(false)

  const dropdownRef =
    useRef(null)

  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(
            event.target
          )
        ) {

          setDropdownOpen(
            false
          )
        }
      }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }

  }, [])

  const categoryLabel =
    selectedCategory ||
    "Auto Detect Category"

  return (
    <div
      ref={dropdownRef}
      className="
        relative
        w-full
      "
    >
      <button
        type="button"
        onClick={() =>
          setDropdownOpen(
            (prev) =>
              !prev
          )
        }
        className="
          flex
          h-11
          w-full
          items-center
          justify-between

          rounded-2xl

          border
          border-[#2f3c36]

          bg-[#1a2320]

          px-4

          text-left
          text-sm
          text-white

          transition-all
          duration-300

          hover:border-[#46544e]
        "
      >
        <span
          className={
            selectedCategory
              ? "text-white"
              : "text-[#8ea59b]"
          }
        >
          {categoryLabel}
        </span>

        <ChevronDown
          className={`
            h-4
            w-4

            text-[#8ea59b]

            transition-transform
            duration-300

            ${
              dropdownOpen
                ? "rotate-180"
                : ""
            }
          `}
        />
      </button>

      {/* DROPDOWN */}
      <div
        className={`
          absolute
          left-0
          right-0
          top-[calc(100%+10px)]
          z-50

          overflow-hidden

          rounded-2xl

          border
          border-[#2d3b35]

          bg-[#18211f]

          shadow-[0_20px_60px_rgba(0,0,0,0.45)]

          transition-all
          duration-300

          ${
            dropdownOpen
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

        {/* AUTO DETECT */}
        <button
          type="button"
          onClick={() => {

            setSelectedCategory(
              ""
            )

            setDropdownOpen(
              false
            )
          }}
          className="
            flex
            w-full
            items-center
            justify-between

            border-b
            border-[#22302b]

            px-4
            py-3

            text-sm
            text-white

            hover:bg-[#202b27]
          "
        >
          <span>
            Auto Detect Category
          </span>

          {!selectedCategory && (
            <Check
              className="
                h-4
                w-4
                text-[#f5d547]
              "
            />
          )}
        </button>

        {/* CATEGORIES */}
        <div
          className="
            max-h-[220px]
            overflow-y-auto
          "
        >
          {categories.map(
            (category) => {

              const active =
                selectedCategory ===
                category

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => {

                    setSelectedCategory(
                      category
                    )

                    setDropdownOpen(
                      false
                    )
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between

                    px-4
                    py-3

                    text-sm
                    text-white

                    hover:bg-[#202b27]
                  "
                >
                  <span>
                    {category}
                  </span>

                  {active && (
                    <Check
                      className="
                        h-4
                        w-4
                        text-[#f5d547]
                      "
                    />
                  )}
                </button>
              )
            }
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadCategorySelector