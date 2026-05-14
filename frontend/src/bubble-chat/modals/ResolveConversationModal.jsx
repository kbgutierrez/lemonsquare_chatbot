import {
  useState,
} from "react"

import {
  CheckCircle2,
  Loader2,
} from "lucide-react"

import ModalShell from "../components/ModalShell.jsx"

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
    <ModalShell
      onClose={handleClose}
      title="Resolve Conversation"
      subtitle="Session Completion"
      size="sm"
      scrollable={false}
      icon={
        <CheckCircle2
          className="
            h-5
            w-5
          "
        />
      }
    >
      <div
        className="
          p-5
          sm:p-6
        "
      >
        {/* CONTENT */}
        <div
          className="
            rounded-2xl

            border
            border-slate-200/60

            bg-white/70

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
    </ModalShell>
  )
}

export default ResolveConversationModal