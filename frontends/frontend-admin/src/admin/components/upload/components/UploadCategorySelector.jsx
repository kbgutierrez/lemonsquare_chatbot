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

import {
  createPortal,
} from "react-dom"

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

  const modalContent =
    createPortal(
      <div
        className={`
          fixed
          inset-0
          z-[999]

          flex
          items-center
          justify-center

          p-4

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

            backdrop-blur-md

            transition-opacity
            duration-300

            ${
              modalOpen
                ? "opacity-100"
                : "opacity-0"
            }
          `}
          style={{
            background:
              "var(--modal-overlay)",
          }}
        />

        {/* CARD */}
        <div
          ref={modalCardRef}
          className={`
            modal-surface
            relative
            z-10

            flex
            w-full
            max-w-[520px]
            flex-col

            overflow-hidden

            rounded-[28px]

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
              px-5
              py-5
            "
            style={{
              borderBottom:
                "1px solid var(--border)",
            }}
          >
            <div>
              <h3
                className="
                  text-lg
                  font-bold
                "
                style={{
                  color:
                    "var(--text-primary)",
                }}
              >
                Select Category
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                "
                style={{
                  color:
                    "var(--text-secondary)",
                }}
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
                hover-surface
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                transition-all
                duration-200
              "
              style={{
                borderColor:
                  "var(--border)",

                background:
                  "var(--panel-light)",

                color:
                  "var(--text-secondary)",
              }}
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
              `}
              style={{
                borderColor:
                  !selectedCategory
                    ? "rgba(245, 213, 71, 0.25)"
                    : "transparent",

                background:
                  !selectedCategory
                    ? "rgba(245, 213, 71, 0.10)"
                    : "var(--panel-light)",
              }}
            >
              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                  "
                  style={{
                    color:
                      "var(--text-primary)",
                  }}
                >
                  Auto Detect Category
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                  "
                  style={{
                    color:
                      "var(--text-secondary)",
                  }}
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
                  "
                  style={{
                    background:
                      "var(--accent)",
                  }}
                >
                  <Check
                    className="
                      h-4
                      w-4
                    "
                    style={{
                      color:
                        "#111917",
                    }}
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
                        handleSelect(
                          category
                        )
                      }
                      className="
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
                      "
                      style={{
                        borderColor:
                          active
                            ? "rgba(245, 213, 71, 0.25)"
                            : "transparent",

                        background:
                          active
                            ? "rgba(245, 213, 71, 0.10)"
                            : "var(--panel-light)",
                      }}
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
                          "
                          style={{
                            color:
                              "var(--text-primary)",
                          }}
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
                          "
                          style={{
                            background:
                              "var(--accent)",
                          }}
                        >
                          <Check
                            className="
                              h-4
                              w-4
                            "
                            style={{
                              color:
                                "#111917",
                            }}
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
      </div>,
      document.body
    )

  return (
    <>
      {/* TRIGGER */}
      <button
        type="button"
        onClick={() =>
          setModalOpen(true)
        }
        className="
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
        "
        style={{
          borderColor:
            modalOpen
              ? "rgba(245, 213, 71, 0.45)"
              : "var(--border)",

          background:
            modalOpen
              ? "var(--hover)"
              : "var(--panel-light)",

          boxShadow:
            modalOpen
              ? "0 0 0 4px rgba(245, 213, 71, 0.08)"
              : "none",
        }}
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
          "
        >
          <div
            className="
              h-2.5
              w-2.5
              shrink-0
              rounded-full
            "
            style={{
              background:
                selectedCategory
                  ? "var(--accent)"
                  : "var(--text-muted)",
            }}
          />

          <span
            className="
              truncate
            "
            style={{
              color:
                selectedCategory
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
            }}
          >
            {categoryLabel}
          </span>
        </div>

        <ChevronDown
          className={`
            h-4
            w-4
            shrink-0
            transition-transform
            duration-300

            ${
              modalOpen
                ? "rotate-180"
                : ""
            }
          `}
          style={{
            color:
              "var(--text-secondary)",
          }}
        />
      </button>

      {modalContent}
    </>
  )
}

export default UploadCategorySelector