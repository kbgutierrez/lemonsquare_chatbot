import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

const Modal = ({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}) => {

  useEffect(() => {
    if (!open) return

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener(
      "keydown",
      handleEsc
    )

    document.body.style.overflow =
      "hidden"

    return () => {
      document.removeEventListener(
        "keydown",
        handleEsc
      )

      document.body.style.overflow =
        ""
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
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
          transition={{
            duration: 0.2,
          }}
          className="
            fixed
            inset-0
            z-[100]

            flex
            items-center
            justify-center

            bg-black/50

            backdrop-blur-md

            p-4
          "
          onClick={onClose}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.92,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            transition={{
              type: "spring",
              damping: 24,
              stiffness: 240,
            }}
            className={`
              modal-surface
              relative
              w-full
              ${maxWidth}

              overflow-hidden

              rounded-3xl

              p-6
            `}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {title && (
              <div
                className="
                  mb-6

                  flex
                  items-center
                  justify-between
                "
              >
                <h2
                  className="
                    text-xl
                    font-bold

                    text-[var(--text-primary)]
                  "
                >
                  {title}
                </h2>

                <button
                  onClick={onClose}
                  className="
                    hover-surface

                    rounded-xl

                    p-2

                    text-[var(--text-secondary)]

                    hover:text-[var(--text-primary)]
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
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal