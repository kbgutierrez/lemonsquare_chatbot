import {
  useState,
  memo,
} from "react"

import {
  motion,
  AnimatePresence,
} from "framer-motion"

import {
  Trash2,
  AlertTriangle,
  X,
  RotateCcw,
  Archive,
} from "lucide-react"

import {
  parseResolvedChat,
} from "../utils/parseResolvedChat"

/* ========================================
   PARSED FIELD BLOCK
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
    <div>
      <h3
        className={`mb-2 text-sm font-semibold ${color}`}
      >
        {title}
      </h3>

      <p className="text-sm leading-relaxed text-[#d7e0dc]">
        {value}
      </p>
    </div>
  )
}

/* ========================================
   CARD
======================================== */

const ResolvedChatCard = ({
  item,
  index,

  lifecycle = "active",

  onDelete,
  onRestore,
}) => {

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

      } finally {

        setLoading(false)
      }
    }

  const isInactive =
    lifecycle ===
    "inactive"

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
        className={`group rounded-[28px] border p-5 transition-all duration-300 ${
          isInactive
            ? "border-[#38413d] bg-[#141917] opacity-[0.88] hover:border-[#4b5651]"
            : "border-[#26332d] bg-[#18211f] hover:border-[#f5d547]/30 hover:shadow-[0_12px_50px_rgba(0,0,0,0.35)]"
        }`}
      >

        {/* HEADER */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex flex-wrap items-center gap-3">

            <span
              className={`rounded-2xl border px-3 py-1 text-xs font-semibold ${
                isInactive
                  ? "border-[#5f6c66]/20 bg-[#5f6c66]/10 text-[#c4d0ca]"
                  : "border-[#f5d547]/10 bg-[#f5d547]/10 text-[#f5d547]"
              }`}
            >

              {isInactive
                ? "Inactive Chat"
                : "Resolved Chat"}

            </span>

            <span className="text-xs text-[#8ea59b]">
              {item.source}
            </span>

          </div>

          {/* ACTION */}
          {isInactive ? (
            <motion.button
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.95,
              }}
              disabled={loading}
              onClick={
                handleRestore
              }
              className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition-all hover:bg-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] disabled:cursor-not-allowed disabled:opacity-60"
            >

              <RotateCcw className="h-4 w-4" />

              {loading
                ? "Restoring..."
                : "Restore"}

            </motion.button>
          ) : (
            <motion.button
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={() =>
                setShowDeleteModal(
                  true
                )
              }
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-all hover:bg-red-500/20 hover:shadow-[0_0_25px_rgba(239,68,68,0.15)]"
            >

              <Archive className="h-4 w-4" />

              Archive

            </motion.button>
          )}

        </div>

        {/* CONTENT */}
        <div className="space-y-5">

          <FieldBlock
            title="Issue Reported"
            value={
              parsed[
                "Issue Reported"
              ]
            }
            color="text-[#f5d547]"
          />

          <FieldBlock
            title="Issue Found"
            value={
              parsed[
                "Issue Found"
              ]
            }
            color="text-[#95c11f]"
          />

          <FieldBlock
            title="Root Cause"
            value={
              parsed[
                "Root Cause"
              ]
            }
            color="text-[#ffb347]"
          />

          <FieldBlock
            title="Work Done"
            value={
              parsed[
                "Work Done"
              ]
            }
            color="text-[#7dd3fc]"
          />

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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >

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
              className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-red-500/20 bg-[#161f1c] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
            >

              {/* CLOSE */}
              <button
                onClick={() =>
                  setShowDeleteModal(
                    false
                  )
                }
                className="absolute right-4 top-4 rounded-xl p-2 text-[#8ea59b] hover:bg-white/5 hover:text-white"
              >

                <X className="h-4 w-4" />

              </button>

              {/* ICON */}
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10">

                <AlertTriangle className="h-8 w-8 text-red-400" />

              </div>

              {/* TITLE */}
              <h2 className="text-2xl font-bold text-white">
                Archive Resolved Chat?
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-[#9cb0a8]">

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
                  className="flex-1 rounded-2xl border border-[#2d3b35] bg-[#1b2421] py-3 font-medium text-white hover:bg-[#222d29]"
                >

                  Cancel

                </button>

                <button
                  disabled={loading}
                  onClick={
                    handleDelete
                  }
                  className="flex-1 rounded-2xl bg-red-500 py-3 font-semibold text-white transition-all hover:bg-red-400 hover:shadow-[0_0_30px_rgba(239,68,68,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
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