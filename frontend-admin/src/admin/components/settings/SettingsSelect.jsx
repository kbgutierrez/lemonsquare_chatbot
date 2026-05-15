import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import {
  ChevronDown,
  Check,
  AlertTriangle,
} from "lucide-react"

const SettingsSelect = ({
  label,
  value,
  onChange,
  options = [],
  warning = "",
}) => {

  const [open, setOpen] =
    useState(false)

  const containerRef =
    useRef(null)

  /* ========================================
     CLOSE OUTSIDE
  ======================================== */

  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (
          containerRef.current &&
          !containerRef.current.contains(
            event.target
          )
        ) {

          setOpen(false)
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

  /* ========================================
     SELECT OPTION
  ======================================== */

  const selectedOption =
    options.find(
      (option) =>
        option.value === value
    )

  const handleSelect =
    (selectedValue) => {

      onChange({
        target: {
          value:
            selectedValue,
        },
      })

      setOpen(false)
    }

  return (
    <div className="space-y-3">

      {/* LABEL */}
      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >
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

        {warning && (
          <div
            className="
              inline-flex
              items-center
              gap-1.5

              rounded-full

              border
              border-amber-500/20

              bg-amber-500/10

              px-2.5
              py-1

              text-[10px]
              font-semibold

              text-amber-300
            "
          >
            <AlertTriangle className="h-3 w-3" />

            Caution
          </div>
        )}
      </div>

      {/* SELECT */}
      <div
        ref={containerRef}
        className="relative"
      >
        {/* TRIGGER */}
        <button
          type="button"

          onClick={() =>
            setOpen(
              (prev) => !prev
            )
          }

          className={`
            group

            flex
            w-full
            items-center
            justify-between

            rounded-3xl

            border

            px-5
            py-4

            text-left
            text-sm
            font-medium

            transition-all
            duration-300

            ${
              open
                ? `
                  border-[#f5d547]/30
                  bg-[#18211f]

                  shadow-[0_0_0_4px_rgba(245,213,71,0.06)]
                `
                : `
                  border-[#2a3732]
                  bg-[#141d1a]

                  hover:border-[#3a4a43]
                `
            }
          `}
        >
          <span
            className="
              truncate

              text-white
            "
          >
            {
              selectedOption?.label ||
              "Select option"
            }
          </span>

          <ChevronDown
            className={`
              h-5
              w-5

              text-[#74877f]

              transition-transform
              duration-300

              ${
                open
                  ? "rotate-180"
                  : ""
              }
            `}
          />
        </button>

        {/* DROPDOWN */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
                scale: 0.98,
              }}

              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}

              exit={{
                opacity: 0,
                y: -8,
                scale: 0.98,
              }}

              transition={{
                duration: 0.18,
              }}

              className="
                absolute
                z-50

                mt-3
                w-full

                overflow-hidden

                rounded-3xl

                border
                border-[#2b3933]

                bg-[#101715]

                shadow-[0_20px_60px_rgba(0,0,0,0.45)]

                backdrop-blur-xl
              "
            >
              <div
                className="
                  max-h-[280px]
                  overflow-y-auto

                  [scrollbar-width:none]
                  [&::-webkit-scrollbar]:hidden
                "
              >
                {options.map(
                  (
                    option
                  ) => {

                    const isSelected =
                      option.value ===
                      value

                    return (
                      <button
                        key={
                          option.value
                        }

                        type="button"

                        onClick={() =>
                          handleSelect(
                            option.value
                          )
                        }

                        className={`
                          flex
                          w-full
                          items-center
                          justify-between

                          px-5
                          py-4

                          text-left
                          text-sm

                          transition-all
                          duration-200

                          ${
                            isSelected
                              ? `
                                bg-[#f5d547]/10

                                text-[#f5d547]
                              `
                              : `
                                text-[#d7e2dd]

                                hover:bg-[#18211f]
                              `
                          }
                        `}
                      >
                        <span
                          className="
                            truncate
                          "
                        >
                          {
                            option.label
                          }
                        </span>

                        {isSelected && (
                          <Check
                            className="
                              h-4
                              w-4
                            "
                          />
                        )}
                      </button>
                    )
                  }
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* WARNING */}
      {warning && (
        <motion.div
          initial={{
            opacity: 0,
            y: 6,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            duration: 0.25,
          }}

          className="
            rounded-2xl

            border
            border-amber-500/15

            bg-amber-500/5

            p-4
          "
        >
          <p
            className="
              text-xs
              leading-relaxed

              text-amber-200
            "
          >
            {warning}
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default SettingsSelect