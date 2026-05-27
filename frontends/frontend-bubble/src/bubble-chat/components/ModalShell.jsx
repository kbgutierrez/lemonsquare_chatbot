import {
  useEffect,
  useMemo,
} from "react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import {
  X,
} from "lucide-react"

const backdropVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,
  },
}

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 20,
  },

  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },

  exit: {
    opacity: 0,
    scale: 0.97,
    y: 12,
  },
}

const SIZE_CLASSES = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

const ModalShell = ({
  open = true,

  onClose,

  children,

  title,
  subtitle,

  icon,

  headerActions,

  size = "md",

  scrollable = true,

  bodyClassName,
}) => {

  /* ========================================
     ESC CLOSE
  ======================================== */

  useEffect(() => {

    const handleKeyDown =
      event => {

        if (
          event.key ===
          "Escape"
        ) {

          onClose?.()
        }
      }

    window.addEventListener(
      "keydown",
      handleKeyDown
    )

    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      )
    }

  }, [onClose])

  /* ========================================
     SIZE CLASS
  ======================================== */

  const sizeClass =
    useMemo(
      () =>
        SIZE_CLASSES[size] ||
        SIZE_CLASSES.md,

      [size]
    )

  return (
    <AnimatePresence>

      {open && (

        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={
            backdropVariants
          }
          transition={{
            duration: 0.2,
          }}
          className="
            fixed
            inset-0

            z-[140]

            flex
            items-center
            justify-center

            bg-black/35

            p-3
            sm:p-4

            backdrop-blur-[6px]
          "
        >

          {/* CLICK OUTSIDE */}
          <button
            type="button"
            aria-label="Close modal overlay"
            onClick={onClose}
            className="
              absolute
              inset-0
              cursor-default
            "
          />

          {/* MODAL */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={
              modalVariants
            }
            transition={{
              duration: 0.24,
              ease: "easeOut",
            }}
            className={`
              relative
              z-10

              flex
              w-full
              flex-col

              overflow-hidden

              rounded-[28px]
              border
              border-white/40

              bg-white/95

              shadow-[0_30px_90px_rgba(0,0,0,0.18)]

              backdrop-blur-2xl

              sm:rounded-[32px]

              ${sizeClass}
            `}
          >

            {/* BACKGROUND */}
            <div
              className="
                pointer-events-none

                absolute
                inset-0

                overflow-hidden
              "
            >
              <div
                className="
                  absolute
                  right-[-60px]
                  top-[-60px]

                  h-48
                  w-48

                  rounded-full

                  bg-violet-200/25

                  blur-3xl
                "
              />
            </div>

            {/* HEADER */}
            <div
              className="
                relative
                z-10

                flex
                items-start
                justify-between
                gap-4

                border-b
                border-violet-100/80

                bg-gradient-to-r
                from-violet-50/90
                to-purple-50/70

                px-4
                py-4

                sm:px-5
              "
            >

              {/* LEFT */}
              <div
                className="
                  flex
                  min-w-0
                  items-start
                  gap-3
                "
              >

                {/* ICON */}
                {icon && (
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center

                      rounded-2xl

                      bg-violet-100

                      text-violet-700
                    "
                  >
                    {icon}
                  </div>
                )}

                {/* TEXT */}
                <div className="min-w-0">

                  {subtitle && (
                    <p
                      className="
                        text-[10px]
                        font-semibold
                        uppercase

                        tracking-[0.18em]

                        text-violet-500
                      "
                    >
                      {subtitle}
                    </p>
                  )}

                  {title && (
                    <h2
                      className="
                        mt-1

                        truncate

                        text-lg
                        font-semibold

                        text-slate-900

                        sm:text-xl
                      "
                    >
                      {title}
                    </h2>
                  )}

                </div>

              </div>

              {/* ACTIONS */}
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                {headerActions}

                {/* CLOSE */}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center

                    rounded-xl

                    border
                    border-violet-100

                    bg-white/80

                    text-slate-600

                    transition-all
                    duration-200

                    hover:bg-violet-50
                    hover:text-slate-900
                  "
                >
                  <X
                    className="
                      h-5
                      w-5
                    "
                  />
                </button>

              </div>

            </div>

            {/* BODY */}
            <div
              className={`
                relative
                z-10

                ${
                  scrollable
                    ? `
                      max-h-[75dvh]
                      overflow-y-auto
                    `
                    : ""
                }

                ${bodyClassName || ""}
              `}
            >
              {children}
            </div>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>
  )
}

export default ModalShell