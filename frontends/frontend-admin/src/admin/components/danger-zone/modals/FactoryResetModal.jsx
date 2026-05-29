import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  AlertTriangle,
  Skull,
  X,
} from "lucide-react"

import { createPortal } from "react-dom"

import dangerZoneService from "../../../services/dangerZoneService"

const REQUIRED_TEXT =
  "I_UNDERSTAND_THIS_IS_IRREVERSIBLE"

const FactoryResetModal = ({
  open,
  onClose,
}) => {
  const modalRef =
    useRef(null)

  const [
    mounted,
    setMounted,
  ] = useState(false)

  const [
    confirmationText,
    setConfirmationText,
  ] = useState("")

  const [
    countdown,
    setCountdown,
  ] = useState(null)

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    success,
    setSuccess,
  ] = useState(false)

  const countdownRef =
    useRef(null)

  const canConfirm =
    useMemo(() => {
      return (
        confirmationText.trim() ===
        REQUIRED_TEXT
      )
    }, [
      confirmationText,
    ])

  /* ========================================
     MOUNT
  ======================================== */

  useEffect(() => {
    setMounted(true)
  }, [])

  /* ========================================
     RESET WHEN OPEN
  ======================================== */

  useEffect(() => {
    if (!open) {
      return
    }

    setConfirmationText("")
    setCountdown(null)
    setLoading(false)
    setSuccess(false)
  }, [open])

  /* ========================================
     BODY LOCK
  ======================================== */

  useEffect(() => {
    if (!open) {
      return
    }

    const originalOverflow =
      document.body.style
        .overflow

    document.body.style.overflow =
      "hidden"

    return () => {
      document.body.style.overflow =
        originalOverflow
    }
  }, [open])

  /* ========================================
     ESC
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
          handleCancel()
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
  }, [open])

  /* ========================================
     OUTSIDE CLICK
  ======================================== */

  useEffect(() => {
    if (!open) {
      return
    }

    const handleOutside =
      (event) => {
        if (
          modalRef.current &&
          !modalRef.current.contains(
            event.target
          )
        ) {
          handleCancel()
        }
      }

    document.addEventListener(
      "mousedown",
      handleOutside
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      )
    }
  }, [open])

  /* ========================================
     CLEANUP
  ======================================== */

  useEffect(() => {
    return () => {
      if (
        countdownRef.current
      ) {
        clearInterval(
          countdownRef.current
        )
      }
    }
  }, [])

  /* ========================================
     CANCEL
  ======================================== */

  const handleCancel =
    () => {
      if (
        countdownRef.current
      ) {
        clearInterval(
          countdownRef.current
        )
      }

      countdownRef.current =
        null

      setCountdown(null)

      if (!loading) {
        onClose?.()
      }
    }

  /* ========================================
     WIPE
  ======================================== */

  const executeWipe =
    async () => {
      try {
        setLoading(true)

        await dangerZoneService.wipeAllKnowledge()

        setSuccess(true)

        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } catch (error) {
        console.error(
          "FACTORY_RESET_ERROR",
          error
        )

        alert(
          error?.message ||
            "Factory reset failed."
        )

        setCountdown(null)
      } finally {
        setLoading(false)
      }
    }

  /* ========================================
     START COUNTDOWN
  ======================================== */

  const startCountdown =
    () => {
      if (!canConfirm) {
        return
      }

      let seconds = 5

      setCountdown(seconds)

      countdownRef.current =
        setInterval(() => {
          seconds--

          if (seconds <= 0) {
            clearInterval(
              countdownRef.current
            )

            countdownRef.current =
              null

            executeWipe()

            return
          }

          setCountdown(seconds)
        }, 1000)
    }

  if (
    !mounted ||
    !open
  ) {
    return null
  }

  return createPortal(
    <div
      className="
        fixed
        inset-0
        z-[1500]

        flex
        items-center
        justify-center

        p-4
      "
    >
      <div
        className="
          absolute
          inset-0

          animate-fade-in

          backdrop-blur-md
        "
        style={{
          background:
            "var(--modal-overlay)",
        }}
      />

      <div
        ref={modalRef}
        className="
          modal-surface

          relative
          z-10

          w-full
          max-w-[720px]

          overflow-hidden

          rounded-[32px]

          animate-slide-in
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-start
            justify-between

            px-6
            pt-6
          "
        >
          <div
            className="
              flex
              items-start
              gap-4
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center

                rounded-2xl

                bg-red-500/10
              "
            >
              <AlertTriangle
                className="
                  h-7
                  w-7
                  text-red-500
                "
              />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-bold
                  text-red-400
                "
              >
                Factory Reset AI Knowledge
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-[var(--text-secondary)]
                "
              >
                This action permanently
                deletes all AI knowledge.
              </p>
            </div>
          </div>

          <button
            onClick={
              handleCancel
            }
          >
            <X />
          </button>
        </div>

        {/* CONTENT */}

        <div
          className="
            px-6
            py-6
          "
        >
          <div
            className="
              rounded-2xl

              border
              border-red-500/20

              bg-red-500/5

              p-4
            "
          >
            <p
              className="
                text-sm
                leading-relaxed
                text-[var(--text-secondary)]
              "
            >
              Type the following
              phrase exactly:
            </p>

            <div
              className="
                mt-3

                rounded-xl

                bg-black/20

                p-3

                font-mono
                text-sm

                break-all

                text-red-300
              "
            >
              {REQUIRED_TEXT}
            </div>
          </div>

          <input
            value={
              confirmationText
            }
            onChange={(e) =>
              setConfirmationText(
                e.target.value
              )
            }
            placeholder="Type confirmation phrase..."
            className="
              mt-5
              w-full

              rounded-2xl
              border

              border-[var(--border)]

              bg-[var(--panel-light)]

              px-4
              py-3

              outline-none
            "
          />
        </div>

        {/* FOOTER */}

        <div
          className="
            flex
            gap-3

            px-6
            pb-6
          "
        >
          <button
            onClick={
              handleCancel
            }
            className="
              w-full

              rounded-2xl
              border

              border-[var(--border)]

              py-3
            "
          >
            Cancel
          </button>

          <button
            disabled={
              !canConfirm ||
              loading
            }
            onClick={
              startCountdown
            }
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2

              rounded-2xl

              bg-gradient-to-r
              from-red-600
              to-red-700

              py-3

              font-semibold
              text-white

              disabled:opacity-40
            "
          >
            <Skull
              className="
                h-4
                w-4
              "
            />

            {loading
              ? "Wiping..."
              : countdown !==
                  null
                ? `Wiping in ${countdown}s`
                : success
                  ? "Completed"
                  : "Factory Reset"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default FactoryResetModal