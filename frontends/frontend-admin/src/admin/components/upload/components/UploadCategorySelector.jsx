import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  ChevronDown,
  Check,
  X,
} from "lucide-react"

const UploadCategorySelector = ({
  categories = [],
  selectedCategory = "",
  setSelectedCategory,
}) => {
  const [
    modalOpen,
    setModalOpen,
  ] = useState(false)

  const modalCardRef =
    useRef(null)

  /* ========================================
     BODY SCROLL LOCK
  ======================================== */
  useEffect(() => {
    if (!modalOpen) return

    const originalOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      "hidden"

    return () => {
      document.body.style.overflow =
        originalOverflow
    }
  }, [modalOpen])

  /* ========================================
     ESC CLOSE
  ======================================== */
  useEffect(() => {
    if (!modalOpen) return

    const handleEscape =
      (event) => {
        if (event.key === "Escape") {
          setModalOpen(false)
        }
      }

    document.addEventListener(
      "keydown",
      handleEscape
    )

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      )
    }
  }, [modalOpen])

  /* ========================================
     CLICK OUTSIDE
  ======================================== */
  useEffect(() => {
    if (!modalOpen) return

    const handleClickOutside =
      (event) => {
        if (
          modalCardRef.current &&
          !modalCardRef.current.contains(
            event.target
          )
        ) {
          setModalOpen(false)
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
  }, [modalOpen])

  /* ========================================
     LABEL
  ======================================== */
  const categoryLabel =
    useMemo(() => {
      return (
        selectedCategory ||
        "Auto Detect Category"
      )
    }, [selectedCategory])

  /* ========================================
     SELECT
  ======================================== */
  const handleSelect =
    (value) => {
      setSelectedCategory(value)
      setModalOpen(false)
    }

  return (
    <>
      {/* TRIGGER */}
      <button
        type="button"
        onClick={() =>
          setModalOpen(true)
        }
        className={`
          flex
          h-11
          w-full
          items-center
          justify-between

          rounded-2xl

          border

          px-4

          text-left
          text-sm

          transition-all
          duration-300

          ${
            modalOpen
              ? `
                border-[#d8b93d]/50
                bg-[#1f2925]
                shadow-[0_0_0_4px_rgba(216,185,61,0.08)]
              `
              : `
                border-[#2f3c36]
                bg-[#1a2320]
                hover:border-[#46544e]
              `
          }
        `}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`
              h-2.5
              w-2.5
              shrink-0
              rounded-full

              ${
                selectedCategory
                  ? "bg-[#f5d547]"
                  : "bg-[#6f847b]"
              }
            `}
          />

          <span
            className={`
              truncate

              ${
                selectedCategory
                  ? "text-white"
                  : "text-[#8ea59b]"
              }
            `}
          >
            {categoryLabel}
          </span>
        </div>

        <ChevronDown
          className={`
            h-4
            w-4
            shrink-0

            text-[#8ea59b]

            transition-transform
            duration-300

            ${
              modalOpen
                ? "rotate-180"
                : ""
            }
          `}
        />
      </button>

      {/* MODAL */}
      <div
        className={`
          fixed
          inset-0
          z-[120]

          flex
          items-center
          justify-center

          px-4

          transition-all
          duration-300

          ${
            modalOpen
              ? `
                pointer-events-auto
                opacity-100
              `
              : `
                pointer-events-none
                opacity-0
              `
          }
        `}
      >
        {/* BACKDROP */}
        <div
          className={`
            absolute
            inset-0

            bg-black/70
            backdrop-blur-md

            transition-opacity
            duration-300

            ${
              modalOpen
                ? "opacity-100"
                : "opacity-0"
            }
          `}
        />

        {/* CARD */}
        <div
          ref={modalCardRef}
          className={`
            relative
            z-10

            flex
            w-full
            max-w-[520px]
            flex-col

            overflow-hidden

            rounded-[28px]

            border
            border-[#2f3c36]

            bg-[#141c1a]

            shadow-[0_30px_80px_rgba(0,0,0,0.55)]

            transition-all
            duration-300

            ${
              modalOpen
                ? `
                  translate-y-0
                  scale-100
                  opacity-100
                `
                : `
                  translate-y-3
                  scale-[0.98]
                  opacity-0
                `
            }
          `}
        >
          {/* HEADER */}
          <div
            className="
              flex
              items-start
              justify-between
              gap-4

              border-b
              border-[#24312b]

              px-5
              py-5
            "
          >
            <div>
              <h3
                className="
                  text-lg
                  font-bold
                  text-white
                "
              >
                Select Category
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-[#8ea59b]
                "
              >
                Choose a category or use automatic AI detection.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setModalOpen(false)
              }
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

                bg-[#18211f]

                text-[#8ea59b]

                transition-all
                duration-200

                hover:border-[#46544e]
                hover:text-white
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* OPTIONS */}
          <div
            className="
              max-h-[420px]
              overflow-y-auto

              p-3
            "
          >
            {/* AUTO DETECT */}
            <button
              type="button"
              onClick={() =>
                handleSelect("")
              }
              className={`
                mb-2

                flex
                w-full
                items-center
                justify-between

                rounded-2xl

                border

                px-4
                py-4

                text-left

                transition-all
                duration-200

                ${
                  !selectedCategory
                    ? `
                      border-[#d8b93d]/30
                      bg-[#d8b93d]/10
                    `
                    : `
                      border-transparent
                      bg-[#18211f]

                      hover:border-[#2f3c36]
                      hover:bg-[#1d2724]
                    `
                }
              `}
            >
              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Auto Detect Category
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-[#8ea59b]
                  "
                >
                  Let the AI automatically determine the best category.
                </p>
              </div>

              {!selectedCategory && (
                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center

                    rounded-full

                    bg-[#f5d547]
                  "
                >
                  <Check
                    className="
                      h-4
                      w-4
                      text-[#111917]
                    "
                  />
                </div>
              )}
            </button>

            {/* CATEGORY LIST */}
            <div className="space-y-2">
              {categories.map(
                (category) => {
                  const active =
                    selectedCategory ===
                    category

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        handleSelect(category)
                      }
                      className={`
                        flex
                        w-full
                        items-center
                        justify-between

                        rounded-2xl

                        border

                        px-4
                        py-4

                        text-left

                        transition-all
                        duration-200

                        ${
                          active
                            ? `
                              border-[#d8b93d]/30
                              bg-[#d8b93d]/10
                            `
                            : `
                              border-transparent
                              bg-[#18211f]

                              hover:border-[#2f3c36]
                              hover:bg-[#1d2724]
                            `
                        }
                      `}
                    >
                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <p
                          className="
                            truncate
                            text-sm
                            font-medium
                            text-white
                          "
                        >
                          {category}
                        </p>
                      </div>

                      {active && (
                        <div
                          className="
                            ml-4

                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center

                            rounded-full

                            bg-[#f5d547]
                          "
                        >
                          <Check
                            className="
                              h-4
                              w-4
                              text-[#111917]
                            "
                          />
                        </div>
                      )}
                    </button>
                  )
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UploadCategorySelector