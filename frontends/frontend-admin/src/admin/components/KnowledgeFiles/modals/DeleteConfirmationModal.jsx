import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  AlertTriangle,
  Trash2,
  X,
} from "lucide-react"

import {
  createPortal,
} from "react-dom"

const DeleteConfirmationModal = ({
  open,
  file,
  deleting,
  mode = "archive",

  onClose,
  onConfirm,
}) => {
  const modalRef =
    useRef(null)

  const [
    mounted,
    setMounted,
  ] = useState(false)

  const isHardDelete =
    mode === "hard-delete"

  /* ========================================
     MOUNT
  ======================================== */

  useEffect(() => {
    setMounted(true)
  }, [])

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

    const handleOutsideClick =
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
      handleOutsideClick
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      )
    }
  }, [
    open,
    onClose,
  ])

  if (
    !mounted ||
    !open ||
    !file
  ) {
    return null
  }

  return createPortal(
    <div
      className="
        fixed
        inset-0
        z-[1200]

        flex
        items-center
        justify-center

        p-4
      "
    >
      {/* BACKDROP */}

      <div
        className="
          absolute
          inset-0

          backdrop-blur-md
          animate-fade-in
        "
        style={{
          background:
            "var(--modal-overlay)",
        }}
      />

      {/* MODAL */}

      <div
        ref={modalRef}
        className="
          modal-surface

          relative
          z-10

          w-full
          max-w-[500px]

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
            gap-4

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
                shrink-0
                items-center
                justify-center

                rounded-2xl
              "
              style={{
                background:
                  "rgba(239,68,68,0.12)",

                border:
                  "1px solid rgba(239,68,68,0.18)",
              }}
            >
              <AlertTriangle
                className="
                  h-7
                  w-7
                "
                style={{
                  color:
                    "#ef4444",
                }}
              />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-bold
                "
                style={{
                  color:
                    "var(--text-primary)",
                }}
              >
                {isHardDelete
                  ? "Permanently Delete Document"
                  : "Archive Document"}
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-relaxed
                "
                style={{
                  color:
                    "var(--text-secondary)",
                }}
              >
                {isHardDelete
                  ? "This will permanently remove the document from the database and AI Brain. This action cannot be undone."
                  : "Are you sure you want to archive this knowledge file?"}
              </p>
            </div>
          </div>

          <button
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

              transition-all
              duration-200

              hover:scale-105
              active:scale-95
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
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* FILE */}

        <div className="px-6 pt-5">
          <div
            className="
              rounded-2xl
              border
              p-4
            "
            style={{
              borderColor:
                "var(--border)",

              background:
                "var(--panel-light)",
            }}
          >
            <p
              className="
                text-xs
                font-medium
                uppercase
                tracking-wide
              "
              style={{
                color:
                  "var(--text-muted)",
              }}
            >
              Selected File
            </p>

            <p
              className="
                mt-2
                break-all
                text-sm
                font-semibold
              "
              style={{
                color:
                  "var(--text-primary)",
              }}
            >
              {file.file_name}
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div
          className="
            flex
            gap-3

            px-6
            py-6
          "
        >
          <button
            onClick={onClose}
            className="
              hover-surface

              w-full

              rounded-2xl
              border

              py-3

              font-medium

              transition-all
              duration-200

              hover:scale-[1.02]
              active:scale-[0.98]
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
            Cancel
          </button>

          <button
            disabled={deleting}
            onClick={() =>
              onConfirm?.(
                file.document_id
              )
            }
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2

              rounded-2xl

              py-3

              font-semibold

              transition-all
              duration-200

              hover:scale-[1.02]
              active:scale-[0.98]

              disabled:cursor-not-allowed
              disabled:opacity-70
            "
            style={{
              background:
                "linear-gradient(135deg,#ef4444,#dc2626)",

              color:
                "#ffffff",
            }}
          >
            <Trash2
              className="
                h-4
                w-4
              "
            />

            {deleting
              ? (
                  isHardDelete
                    ? "Deleting..."
                    : "Archiving..."
                )
              : (
                  isHardDelete
                    ? "Delete Permanently"
                    : "Archive File"
                )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default DeleteConfirmationModal