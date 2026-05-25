import {
  useEffect,
  useRef,
} from "react"

import { X } from "lucide-react"

import {
  motion,
  AnimatePresence,
} from "framer-motion"

import {
  createPortal,
} from "react-dom"

import ManualEntryCategoryOption
  from "./ManualEntryCategoryOption"

const ManualEntryCategoryModal = ({
  open,
  categories,
  selectedCategory,

  onClose,
  onSelect,
}) => {

  const modalRef =
    useRef(null)

  /* ========================================
     BODY LOCK
  ======================================== */

  useEffect(() => {

    if (!open) {
      return
    }

    const originalOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      "hidden"

    return () => {

      document.body.style.overflow =
        originalOverflow
    }

  }, [open])

  /* ========================================
     ESC CLOSE
  ======================================== */

  useEffect(() => {

    if (!open) {
      return
    }

    const handleEscape =
      (event) => {

        if (
          event.key ===
          "Escape"
        ) {

          onClose?.()
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

  }, [
    open,
    onClose,
  ])

  /* ========================================
     OUTSIDE CLICK
  ======================================== */

  useEffect(() => {

    if (!open) {
      return
    }

    const handleClickOutside =
      (event) => {

        if (
          modalRef.current &&
          !modalRef.current.contains(
            event.target
          )
        ) {

          onClose?.()
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

  }, [
    open,
    onClose,
  ])

  if (!open) {
    return null
  }

  return createPortal(
    <AnimatePresence>

      <motion.div
        initial={{
          opacity: 0,
        }}

        animate={{
          opacity: 1,
        }}

        exit={{
          opacity: 0,
        }}

        className="
          fixed
          inset-0

          z-[99999]

          flex
          items-center
          justify-center

          overflow-y-auto

          p-3
          sm:p-5
        "
      >

        {/* BACKDROP */}
        <motion.div
          initial={{
            opacity: 0,
          }}

          animate={{
            opacity: 1,
          }}

          exit={{
            opacity: 0,
          }}

          className="
            absolute
            inset-0
          "
          style={{
            background:
              "var(--modal-overlay)",

            backdropFilter:
              "blur(10px)",
          }}
        />

        {/* MODAL */}
        <motion.div
          ref={modalRef}

          initial={{
            opacity: 0,
            scale: 0.96,
            y: 12,
          }}

          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}

          exit={{
            opacity: 0,
            scale: 0.96,
            y: 12,
          }}

          transition={{
            duration: 0.18,
          }}

          className="
            modal-surface
            relative

            z-[100000]

            flex
            w-full

            max-w-[95vw]
            sm:max-w-[560px]

            max-h-[90vh]

            flex-col

            overflow-hidden

            rounded-[28px]
          "
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

            <div className="min-w-0 flex-1">

              <h3
                className="
                  truncate

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

              onClick={onClose}

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
              "
              style={{
                borderColor:
                  "var(--border)",

                background:
                  "var(--panel-light)",

                color:
                  "var(--text-primary)",
              }}
            >

              <X
                className="
                  h-4
                  w-4
                "
              />

            </button>

          </div>

          {/* OPTIONS */}
          <div
            className="
              flex-1

              overflow-y-auto

              p-3

              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >

            {/* AUTO DETECT */}
            <div className="mb-2">

              <ManualEntryCategoryOption
                active={!selectedCategory}

                label="Auto Detect Category"

                description="Let the AI automatically determine the best category."

                onClick={() =>
                  onSelect("")
                }
              />

            </div>

            {/* CATEGORY LIST */}
            <div className="space-y-2">

              {categories.map(
                (category) => {

                  const active =
                    selectedCategory ===
                    category

                  return (
                    <ManualEntryCategoryOption
                      key={category}

                      active={active}

                      label={category}

                      onClick={() =>
                        onSelect(category)
                      }
                    />
                  )
                }
              )}

            </div>

          </div>

        </motion.div>

      </motion.div>

    </AnimatePresence>,
    document.body
  )
}

export default ManualEntryCategoryModal