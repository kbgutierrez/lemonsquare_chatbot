import {
  useState,
} from "react"

import {
  motion,
  AnimatePresence,
} from "framer-motion"

import {
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react"

import {
  parseResolvedChat,
} from "../utils/parseResolvedChat"

const ResolvedChatCard = ({
  item,
  index,
  onDelete,
}) => {

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false)

  const parsed =
    parseResolvedChat(
      item.content
    )

  /* ========================================
     DELETE
  ======================================== */

  const handleDelete =
    async () => {

      await onDelete(
        item.id
      )

      setShowDeleteModal(
        false
      )
    }

  return (
    <>
      {/* CARD */}
      <motion.div
        layout

        initial={{
          opacity: 0,
          y: 20,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}

        exit={{
          opacity: 0,
          scale: 0.94,
        }}

        whileHover={{
          y: -4,
        }}

        transition={{
          delay:
            index * 0.05,
          duration: 0.35,
        }}

        className="
          group

          rounded-[28px]

          border
          border-[#26332d]

          bg-[#18211f]

          p-5

          transition-all
          duration-300

          hover:border-[#f5d547]/30
          hover:shadow-[0_12px_50px_rgba(0,0,0,0.35)]
        "
      >

        {/* HEADER */}
        <div
          className="
            mb-5

            flex
            flex-col
            gap-3

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          {/* LEFT */}
          <div>
            <div
              className="
                mb-2

                flex
                flex-wrap
                items-center
                gap-3
              "
            >

              {/* BADGE */}
              <motion.span
                whileHover={{
                  scale: 1.04,
                }}

                className="
                  rounded-2xl

                  border
                  border-[#f5d547]/10

                  bg-[#f5d547]/10

                  px-3
                  py-1

                  text-xs
                  font-semibold

                  text-[#f5d547]
                "
              >
                Resolved Chat
              </motion.span>

              <span
                className="
                  text-xs
                  text-[#8ea59b]
                "
              >
                {item.source}
              </span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">

            {/* DELETE */}
            <motion.button
              whileHover={{
                scale: 1.05,
              }}

              whileTap={{
                scale: 0.95,
              }}

              onClick={() =>
                setShowDeleteModal(
                  true
                )
              }

              className="
                flex
                items-center
                gap-2

                rounded-xl

                border
                border-red-500/20

                bg-red-500/10

                px-3
                py-2

                text-sm
                text-red-300

                transition-all

                hover:bg-red-500/20
                hover:shadow-[0_0_25px_rgba(239,68,68,0.15)]
              "
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </motion.button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-4">

          {/* ISSUE REPORTED */}
          <div>
            <h3
              className="
                mb-2
                text-sm
                font-semibold
                text-[#f5d547]
              "
            >
              Issue Reported
            </h3>

            <p
              className="
                text-sm
                leading-relaxed
                text-[#d7e0dc]
              "
            >
              {
                parsed[
                  "Issue Reported"
                ]
              }
            </p>
          </div>

          {/* ISSUE FOUND */}
          <div>
            <h3
              className="
                mb-2
                text-sm
                font-semibold
                text-[#95c11f]
              "
            >
              Issue Found
            </h3>

            <p
              className="
                text-sm
                leading-relaxed
                text-[#d7e0dc]
              "
            >
              {
                parsed[
                  "Issue Found"
                ]
              }
            </p>
          </div>

          {/* ROOT CAUSE */}
          <div>
            <h3
              className="
                mb-2
                text-sm
                font-semibold
                text-[#ffb347]
              "
            >
              Root Cause
            </h3>

            <p
              className="
                text-sm
                leading-relaxed
                text-[#d7e0dc]
              "
            >
              {
                parsed[
                  "Root Cause"
                ]
              }
            </p>
          </div>

          {/* WORK DONE */}
          <div>
            <h3
              className="
                mb-2
                text-sm
                font-semibold
                text-[#7dd3fc]
              "
            >
              Work Done
            </h3>

            <p
              className="
                text-sm
                leading-relaxed
                text-[#d7e0dc]
              "
            >
              {
                parsed[
                  "Work Done"
                ]
              }
            </p>
          </div>
        </div>
      </motion.div>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
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
              z-[100]

              flex
              items-center
              justify-center

              bg-black/60
              backdrop-blur-sm

              p-4
            "
          >

            {/* MODAL */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 20,
              }}

              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}

              exit={{
                opacity: 0,
                scale: 0.92,
                y: 10,
              }}

              transition={{
                type: "spring",
                damping: 20,
                stiffness: 250,
              }}

              className="
                relative

                w-full
                max-w-md

                overflow-hidden

                rounded-[32px]

                border
                border-red-500/20

                bg-[#161f1c]

                p-6

                shadow-[0_20px_80px_rgba(0,0,0,0.45)]
              "
            >

              {/* CLOSE */}
              <button
                onClick={() =>
                  setShowDeleteModal(
                    false
                  )
                }

                className="
                  absolute
                  right-4
                  top-4

                  rounded-xl

                  p-2

                  text-[#8ea59b]

                  transition-all

                  hover:bg-white/5
                  hover:text-white
                "
              >
                <X className="h-4 w-4" />
              </button>

              {/* ICON */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}

                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}

                className="
                  mb-5

                  flex
                  h-16
                  w-16
                  items-center
                  justify-center

                  rounded-3xl

                  border
                  border-red-500/20

                  bg-red-500/10
                "
              >
                <AlertTriangle
                  className="
                    h-8
                    w-8
                    text-red-400
                  "
                />
              </motion.div>

              {/* TITLE */}
              <h2
                className="
                  text-2xl
                  font-bold
                  text-white
                "
              >
                Delete Resolved Chat?
              </h2>

              {/* DESCRIPTION */}
              <p
                className="
                  mt-3

                  text-sm
                  leading-relaxed

                  text-[#9cb0a8]
                "
              >
                This action permanently removes
                this AI training memory from the
                knowledge base and cannot be
                undone.
              </p>

              {/* BUTTONS */}
              <div
                className="
                  mt-6
                  flex
                  gap-3
                "
              >

                {/* CANCEL */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                  }}

                  whileTap={{
                    scale: 0.97,
                  }}

                  onClick={() =>
                    setShowDeleteModal(
                      false
                    )
                  }

                  className="
                    flex-1

                    rounded-2xl

                    border
                    border-[#2d3b35]

                    bg-[#1b2421]

                    py-3

                    font-medium
                    text-white

                    transition-all

                    hover:bg-[#222d29]
                  "
                >
                  Cancel
                </motion.button>

                {/* DELETE */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                  }}

                  whileTap={{
                    scale: 0.97,
                  }}

                  onClick={
                    handleDelete
                  }

                  className="
                    flex-1

                    rounded-2xl

                    bg-red-500

                    py-3

                    font-semibold
                    text-white

                    transition-all

                    hover:bg-red-400
                    hover:shadow-[0_0_30px_rgba(239,68,68,0.35)]
                  "
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ResolvedChatCard