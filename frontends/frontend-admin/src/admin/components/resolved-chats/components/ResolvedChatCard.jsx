import {
  useState,
  memo,
} from "react"

import {
  motion,
  AnimatePresence,
} from "framer-motion"

import {
  AlertTriangle,
  X,
  RotateCcw,
  Archive,
  ChevronRight,
  Minimize2,
} from "lucide-react"

import {
  parseResolvedChat,
} from "../utils/parseResolvedChat"

/* ========================================
   FIELD BLOCK
======================================== */

const FieldBlock = ({
  title,
  value,
  color,
}) => {

  if (!value) {
    return null
  }

  return (
    <div
      className="
        rounded-2xl
        border
        theme-border

        bg-[color:var(--panel-light)]

        p-4
      "
    >

      <h3
        className={`mb-2 text-sm font-semibold ${color}`}
      >
        {title}
      </h3>

      <p
        className="
          whitespace-pre-wrap
          text-sm
          leading-relaxed

          text-[color:var(--text-primary)]
        "
      >
        {value}
      </p>

    </div>
  )
}

/* ========================================
   COMPONENT
======================================== */

const ResolvedChatCard = ({
  item,
  lifecycle = "active",
  onDelete,
  onRestore,
}) => {

  const [
    expanded,
    setExpanded,
  ] = useState(false)

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false)

  const [
    loading,
    setLoading,
  ] = useState(false)

  const parsed =
    parseResolvedChat(
      item.content
    )

  const isInactive =
    lifecycle ===
    "inactive"

  /* ========================================
     DELETE
  ======================================== */

  const handleDelete =
    async () => {

      try {

        setLoading(true)

        await onDelete(
          item.id
        )

        setShowDeleteModal(
          false
        )

        setExpanded(false)

      } finally {

        setLoading(false)
      }
    }

  /* ========================================
     RESTORE
  ======================================== */

  const handleRestore =
    async () => {

      try {

        setLoading(true)

        await onRestore?.(
          item.id
        )

        setExpanded(false)

      } finally {

        setLoading(false)
      }
    }

  return (
    <>

      {/* ========================================
         LIST ITEM
      ======================================== */}

      <motion.button
        type="button"
        onClick={() =>
          setExpanded(true)
        }
        whileHover={{
          scale: 1.005,
        }}
        whileTap={{
          scale: 0.995,
        }}
        className={`
          group
          flex
          w-full
          items-center
          justify-between

          rounded-[24px]
          border

          px-5
          py-4

          text-left

          transition-all
          duration-200

          ${
            isInactive
              ? `
                theme-border
                bg-[color:var(--panel-light)]

                hover:border-[color:var(--text-muted)]
              `
              : `
                theme-border
                bg-[color:var(--panel)]

                hover:border-[color:var(--accent)]/30
                hover:bg-[color:var(--hover)]
              `
          }
        `}
      >

        {/* LEFT */}
        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-3">

            <span
              className={`
                rounded-xl
                border

                px-2.5
                py-1

                text-[11px]
                font-semibold

                ${
                  isInactive
                    ? `
                      border-[color:var(--text-muted)]/20
                      bg-[color:var(--text-muted)]/10

                      text-[color:var(--text-secondary)]
                    `
                    : `
                      border-[color:var(--accent)]/10
                      bg-[color:var(--accent)]/10

                      text-[color:var(--accent)]
                    `
                }
              `}
            >

              {isInactive
                ? "Inactive"
                : "Active"}

            </span>

            <span
              className="
                truncate
                text-sm
                font-semibold

                text-[color:var(--text-primary)]
              "
            >
              {item.source}
            </span>

          </div>

          <p
            className="
              mt-2
              line-clamp-1
              text-sm

              text-[color:var(--text-secondary)]
            "
          >

            {parsed["Issue Reported"] ||
              "No issue summary available."}

          </p>

        </div>

        {/* RIGHT */}
        <div className="ml-4 flex items-center gap-3">

          <ChevronRight
            className="
              h-5
              w-5

              text-[color:var(--text-muted)]

              transition-transform
              duration-200

              group-hover:translate-x-1
            "
          />

        </div>

      </motion.button>

      {/* ========================================
         EXPANDED MODAL
      ======================================== */}

      <AnimatePresence>

        {expanded && (
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
              z-[120]

              flex
              items-center
              justify-center

              bg-[color:var(--modal-overlay)]

              p-5

              backdrop-blur-md
            "
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 10,
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
                duration: 0.18,
              }}
              className="
                relative
                flex
                max-h-[90vh]
                w-full
                max-w-4xl
                flex-col
                overflow-hidden

                rounded-[34px]
                border

                theme-border

                bg-[color:var(--panel)]

                shadow-[var(--shadow-lg)]
              "
            >

              {/* HEADER */}
              <div
                className="
                  flex
                  items-center
                  justify-between

                  border-b
                  theme-border

                  px-7
                  py-5
                "
              >

                <div>

                  <div className="flex items-center gap-3">

                    <span
                      className={`
                        rounded-xl
                        border

                        px-3
                        py-1

                        text-xs
                        font-semibold

                        ${
                          isInactive
                            ? `
                              border-[color:var(--text-muted)]/20
                              bg-[color:var(--text-muted)]/10

                              text-[color:var(--text-secondary)]
                            `
                            : `
                              border-[color:var(--accent)]/10
                              bg-[color:var(--accent)]/10

                              text-[color:var(--accent)]
                            `
                        }
                      `}
                    >

                      {isInactive
                        ? "Inactive Chat"
                        : "Resolved Chat"}

                    </span>

                    <span
                      className="
                        text-sm

                        text-[color:var(--text-secondary)]
                      "
                    >
                      {item.source}
                    </span>

                  </div>

                  <h2
                    className="
                      mt-3
                      text-2xl
                      font-bold

                      text-[color:var(--text-primary)]
                    "
                  >
                    AI Learned Conversation
                  </h2>

                </div>

                {/* MINIMIZE */}
                <button
                  onClick={() =>
                    setExpanded(false)
                  }
                  className="
                    rounded-2xl
                    border

                    theme-border

                    bg-[color:var(--panel-light)]

                    p-3

                    text-[color:var(--text-secondary)]

                    transition-all

                    hover:bg-[color:var(--hover)]
                    hover:text-[color:var(--text-primary)]
                  "
                >

                  <Minimize2 className="h-5 w-5" />

                </button>

              </div>

              {/* CONTENT */}
              <div className="flex-1 overflow-y-auto px-7 py-6">

                <div className="space-y-5">

                  <FieldBlock
                    title="Issue Reported"
                    value={
                      parsed[
                        "Issue Reported"
                      ]
                    }
                    color="text-[color:var(--accent)]"
                  />

                  <FieldBlock
                    title="Issue Found"
                    value={
                      parsed[
                        "Issue Found"
                      ]
                    }
                    color="text-[color:var(--accent-green)]"
                  />

                  <FieldBlock
                    title="Root Cause"
                    value={
                      parsed[
                        "Root Cause"
                      ]
                    }
                    color="text-orange-400"
                  />

                  <FieldBlock
                    title="Work Done"
                    value={
                      parsed[
                        "Work Done"
                      ]
                    }
                    color="text-sky-400"
                  />

                </div>

              </div>

              {/* FOOTER */}
              <div
                className="
                  border-t
                  theme-border

                  px-7
                  py-5
                "
              >

                {isInactive ? (
                  <button
                    disabled={loading}
                    onClick={
                      handleRestore
                    }
                    className="
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2

                      rounded-2xl
                      border

                      border-emerald-500/20
                      bg-emerald-500/10

                      py-4

                      text-sm
                      font-semibold
                      text-emerald-300

                      transition-all

                      hover:bg-emerald-500/20
                      hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]

                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >

                    <RotateCcw className="h-4 w-4" />

                    {loading
                      ? "Restoring..."
                      : "Restore Chat"}

                  </button>
                ) : (
                  <button
                    disabled={loading}
                    onClick={() =>
                      setShowDeleteModal(
                        true
                      )
                    }
                    className="
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2

                      rounded-2xl
                      border

                      border-red-500/20
                      bg-red-500/10

                      py-4

                      text-sm
                      font-semibold
                      text-red-300

                      transition-all

                      hover:bg-red-500/20
                      hover:shadow-[0_0_25px_rgba(239,68,68,0.18)]

                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >

                    <Archive className="h-4 w-4" />

                    Archive Chat

                  </button>
                )}

              </div>

            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ========================================
         DELETE MODAL
      ======================================== */}

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
              z-[140]

              flex
              items-center
              justify-center

              bg-[color:var(--modal-overlay)]

              p-4

              backdrop-blur-sm
            "
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
              }}
              transition={{
                duration: 0.18,
              }}
              className="
                relative
                w-full
                max-w-md
                overflow-hidden

                rounded-[32px]
                border

                border-red-500/20

                bg-[color:var(--panel)]

                p-6

                shadow-[var(--shadow-lg)]
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

                  text-[color:var(--text-secondary)]

                  transition-all

                  hover:bg-[color:var(--hover-light)]
                  hover:text-[color:var(--text-primary)]
                "
              >

                <X className="h-4 w-4" />

              </button>

              {/* ICON */}
              <div
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

                <AlertTriangle className="h-8 w-8 text-red-400" />

              </div>

              {/* TITLE */}
              <h2
                className="
                  text-2xl
                  font-bold

                  text-[color:var(--text-primary)]
                "
              >
                Archive Resolved Chat?
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  leading-relaxed

                  text-[color:var(--text-secondary)]
                "
              >

                This removes the AI memory from active retrieval
                while preserving the data for future restoration.

              </p>

              {/* ACTIONS */}
              <div className="mt-6 flex gap-3">

                <button
                  onClick={() =>
                    setShowDeleteModal(
                      false
                    )
                  }
                  className="
                    flex-1
                    rounded-2xl
                    border

                    theme-border

                    bg-[color:var(--panel-light)]

                    py-3

                    font-medium

                    text-[color:var(--text-primary)]

                    transition-all

                    hover:bg-[color:var(--hover)]
                  "
                >

                  Cancel

                </button>

                <button
                  disabled={loading}
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

                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {loading
                    ? "Archiving..."
                    : "Archive"}

                </button>

              </div>

            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>

    </>
  )
}

export default memo(
  ResolvedChatCard
)