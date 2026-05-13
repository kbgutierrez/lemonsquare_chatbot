import {
  useState,
} from "react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import {
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react"

const ResolveConversationModal = ({
  onClose,
  onResolve,
}) => {

  const [resolving, setResolving] =
    useState(false)

  /* ========================================
     HANDLE RESOLVE
  ======================================== */

  const handleResolve =
    async () => {

      /*
        Prevent duplicate clicks
      */
      if (resolving) {
        return
      }

      try {

        setResolving(true)

        await onResolve?.()

      } catch (error) {

        console.error(
          "RESOLVE_MODAL_ERROR",
          error
        )

      } finally {

        setResolving(false)
      }
    }

  /* ========================================
     HANDLE CLOSE
  ======================================== */

  const handleClose =
    () => {

      /*
        Prevent closing while resolving
      */
      if (resolving) {
        return
      }

      onClose?.()
    }

  return (
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
          z-50

          flex
          items-center
          justify-center

          bg-black/40

          p-4

          backdrop-blur-sm
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
            y: 12,
          }}

          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}

          exit={{
            opacity: 0,
            scale: 0.95,
            y: 12,
          }}

          transition={{
            duration: 0.2,
          }}

          className="
            relative
            w-full
            max-w-sm

            overflow-hidden

            rounded-3xl

            border
            border-white/20

            bg-white/80

            shadow-2xl

            backdrop-blur-xl
          "
        >
          <div
            className="
              absolute
              inset-0

              bg-gradient-to-br
              from-violet-500/10
              via-fuchsia-500/5
              to-purple-500/10
            "
          />

          <div
            className="
              relative
              p-6
            "
          >
            {/* HEADER */}
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center

                    rounded-2xl

                    bg-gradient-to-br
                    from-violet-500
                    to-purple-600

                    text-white

                    shadow-lg
                  "
                >
                  <CheckCircle2
                    size={22}
                  />
                </div>

                <div>
                  <h3
                    className="
                      text-lg
                      font-semibold

                      text-slate-900
                    "
                  >
                    Resolve conversation
                  </h3>

                  <p
                    className="
                      text-xs
                      text-slate-500
                    "
                  >
                    Mark this session as completed
                  </p>
                </div>
              </div>

              <button
                type="button"

                disabled={
                  resolving
                }

                onClick={
                  handleClose
                }

                className="
                  rounded-xl
                  p-2

                  text-slate-500

                  transition

                  hover:bg-slate-100
                  hover:text-slate-900

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* CONTENT */}
            <div
              className="
                mt-5

                rounded-2xl

                border
                border-slate-200/60

                bg-white/60

                p-4
              "
            >
              <p
                className="
                  text-sm
                  leading-relaxed

                  text-slate-600
                "
              >
                Confirm that the current support
                session has been completed and
                safely resolve the conversation.

                <span
                  className="
                    mt-3
                    block

                    font-medium
                    text-emerald-700
                  "
                >
                  The resolved conversation will
                  automatically be learned by the AI
                  and appear in the Admin panel.
                </span>
              </p>
            </div>

            {/* ACTIONS */}
            <div
              className="
                mt-6

                flex
                justify-end
                gap-3
              "
            >
              <button
                type="button"

                disabled={
                  resolving
                }

                onClick={
                  handleClose
                }

                className="
                  rounded-2xl

                  border
                  border-slate-200

                  bg-white

                  px-4
                  py-2

                  text-sm
                  font-medium

                  text-slate-700

                  transition

                  hover:bg-slate-50

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"

                disabled={
                  resolving
                }

                onClick={
                  handleResolve
                }

                className="
                  flex
                  items-center
                  justify-center
                  gap-2

                  rounded-2xl

                  bg-gradient-to-r
                  from-violet-600
                  to-purple-600

                  px-5
                  py-2

                  text-sm
                  font-medium

                  text-white

                  transition-all

                  hover:scale-[1.02]

                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {resolving ? (
                  <>
                    <Loader2
                      className="
                        h-4
                        w-4
                        animate-spin
                      "
                    />

                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      className="
                        h-4
                        w-4
                      "
                    />

                    Resolve
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ResolveConversationModal