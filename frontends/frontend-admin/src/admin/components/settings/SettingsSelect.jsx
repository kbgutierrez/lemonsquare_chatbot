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

  const selectedOption =
    options.find(
      (option) =>
        option.value === value
    )

  /* ========================================
     OUTSIDE CLICK CLOSE
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

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
  }, [])

  const handleSelect = (
    selectedValue
  ) => {

    onChange({
      target: {
        value: selectedValue,
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

            text-[var(--text-secondary)]
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
              border-amber-600/35

              bg-amber-100/90

              px-2.5
              py-1

              text-[10px]
              font-bold

              text-amber-950

              shadow-[0_4px_14px_rgba(245,158,11,0.12)]

              dark:border-amber-400/20
              dark:bg-amber-400/10
              dark:text-amber-200
            "
          >
            <AlertTriangle
              className="
                h-3
                w-3
              "
            />

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
            setOpen((p) => !p)
          }

          className={`
            input-base

            group

            flex
            items-center
            justify-between

            rounded-3xl

            px-5
            py-4

            text-left
            text-sm
            font-medium

            ${
              open
                ? `
                  border-[var(--accent)]/30
                `
                : ""
            }
          `}
        >
          <span
            className="
              truncate

              text-[var(--text-primary)]
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

              text-[var(--text-secondary)]

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
                glass-panel

                absolute
                z-50

                mt-3
                w-full

                overflow-hidden

                rounded-3xl
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
                {options.map((option) => {

                  const isSelected =
                    option.value === value

                  return (
                    <button
                      key={option.value}

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
                              bg-[var(--accent)]/10
                              text-[var(--accent)]
                            `
                            : `
                              text-[var(--text-primary)]

                              hover:bg-[var(--hover)]
                            `
                        }
                      `}
                    >
                      <span className="truncate">
                        {option.label}
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
                })}
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
            border-amber-600/30

            bg-amber-100/85

            p-4

            shadow-[0_6px_24px_rgba(245,158,11,0.08)]

            dark:border-amber-400/15
            dark:bg-amber-400/5
          "
        >
          <p
            className="
              text-xs
              font-semibold
              leading-relaxed

              text-amber-950

              dark:text-amber-200
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