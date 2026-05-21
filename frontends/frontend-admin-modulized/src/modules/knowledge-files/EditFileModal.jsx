import {
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import {
  X,
  Check,
  FileText,
} from "lucide-react"

const resolveFileName =
  (file) => {

    return (
      file?.file_name ||
      file?.filename ||
      file?.name ||
      file?.title ||
      "Unnamed File"
    )
  }

const resolveDocumentId =
  (file) => {

    return (
      file?.document_id ||
      file?.id ||
      file?.file_id ||
      "-"
    )
  }

const EditFileModal = ({
  file,
  categories = [],
  onClose,
  onSave,
  saving = false,
}) => {

  const dropdownRef =
    useRef(null)

  const [
    dropdownOpen,
    setDropdownOpen,
  ] = useState(false)

  const [
    form,
    setForm,
  ] = useState({
    file_name: "",
    category: "",
  })

  /* ========================================
     NORMALIZED CATEGORIES
  ======================================== */

  const normalizedCategories =
    useMemo(() => {

      return Array.from(
        new Set(
          (Array.isArray(categories)
            ? categories
            : []
          )
            .filter(Boolean)
        )
      )
    }, [categories])

  /* ========================================
     SYNC FORM
  ======================================== */

  useEffect(() => {

    if (!file) {

      return
    }

    setForm({
      file_name:
        resolveFileName(file),

      category:
        file.category ||
        "",
    })

  }, [file])

  /* ========================================
     OUTSIDE CLICK
  ======================================== */

  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(
            event.target
          )
        ) {

          setDropdownOpen(false)
        }
      }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )

  }, [])

  /* ========================================
     CLOSE ON ESCAPE
  ======================================== */

  useEffect(() => {

    const handleEscape =
      (event) => {

        if (
          event.key === "Escape"
        ) {

          if (
            dropdownOpen
          ) {

            setDropdownOpen(
              false
            )

            return
          }

          onClose?.()
        }
      }

    document.addEventListener(
      "keydown",
      handleEscape
    )

    return () =>
      document.removeEventListener(
        "keydown",
        handleEscape
      )

  }, [
    onClose,
    dropdownOpen,
  ])

  /* ========================================
     SAVE
  ======================================== */

  const handleSave =
    async () => {

      if (!file) {

        return
      }

      const trimmedFileName =
        form.file_name
          .trim()

      const trimmedCategory =
        form.category
          .trim()

      if (
        !trimmedFileName
      ) {

        alert(
          "File name is required."
        )

        return
      }

      try {

        await onSave?.(
          resolveDocumentId(file),
          trimmedFileName,
          trimmedCategory
        )

        setDropdownOpen(false)

        onClose?.()

      } catch (error) {

        console.error(
          "SAVE_DOCUMENT_ERROR",
          error
        )
      }
    }

  if (!file) {

    return null
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

          overflow-y-auto

          bg-black/60
          p-4

          backdrop-blur-sm
        "

        onClick={onClose}
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
            damping: 24,
            stiffness: 240,
          }}

          className="
            relative
            z-[101]

            my-auto
            w-full
            max-w-xl

            overflow-visible

            rounded-[32px]
            border
            border-[#2a3a33]

            bg-[#111917]

            p-6

            shadow-[0_20px_80px_rgba(0,0,0,0.45)]
          "

          onClick={(e) =>
            e.stopPropagation()
          }
        >
          {/* HEADER */}
          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-xl font-bold text-white">
              Edit Document
            </h2>

            <button
              onClick={onClose}

              className="
                rounded-xl
                p-2

                text-[#8ea59b]

                transition-colors

                hover:bg-white/5
                hover:text-white
              "
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          {/* FILE PREVIEW */}
          <div
            className="
              mb-5

              flex
              items-center
              gap-3

              rounded-2xl
              border
              border-[#2d3b35]

              bg-[#18211f]

              p-4
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center

                rounded-2xl
                border
                border-[#2d3b35]

                bg-[#111917]
              "
            >
              <FileText className="h-5 w-5 text-[#f5d547]" />
            </div>

            <div className="min-w-0">

              <p
                className="
                  truncate

                  text-sm
                  font-semibold

                  text-white
                "
              >
                {resolveFileName(
                  file
                )}
              </p>

              <p
                className="
                  mt-0.5

                  text-xs

                  text-[#74877f]
                "
              >
                {resolveDocumentId(
                  file
                )}
              </p>

            </div>
          </div>

          {/* FORM */}
          <div className="space-y-4 overflow-visible">

            {/* FILE NAME */}
            <div>

              <label className="mb-1.5 block text-sm text-[#8ea59b]">
                File Name
              </label>

              <input
                value={form.file_name}

                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    file_name:
                      e.target.value,
                  }))
                }

                placeholder="File name"

                className="
                  w-full

                  rounded-2xl
                  border
                  border-[#2d3b35]

                  bg-[#18211f]

                  px-4
                  py-3

                  text-white

                  outline-none

                  focus:border-[#f5d547]
                "
              />

            </div>

            {/* CATEGORY */}
            <div
              ref={dropdownRef}

              className="
                relative
                z-[120]
              "
            >
              <label className="mb-1.5 block text-sm text-[#8ea59b]">
                Category
              </label>

              {/* WHOLE BUTTON */}
              <button
                type="button"

                onClick={() =>
                  setDropdownOpen(
                    true
                  )
                }

                className="
                  flex
                  w-full
                  items-center
                  justify-between

                  rounded-2xl
                  border
                  border-[#2d3b35]

                  bg-[#18211f]

                  px-4
                  py-3

                  text-left
                  text-white

                  transition-colors

                  hover:bg-[#202b27]
                "
              >
                <span>
                  {form.category ||
                    "Select category"}
                </span>

                {form.category && (
                  <Check className="h-4 w-4 text-[#f5d547]" />
                )}
              </button>

              {/* CATEGORY PANEL */}
              <AnimatePresence>
                {dropdownOpen && (
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
                      fixed
                      inset-0
                      z-[9999]

                      flex
                      items-center
                      justify-center

                      bg-black/40

                      p-4
                    "
                  >
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 16,
                      }}

                      animate={{
                        opacity: 1,
                        y: 0,
                      }}

                      exit={{
                        opacity: 0,
                        y: 16,
                      }}

                      transition={{
                        duration: 0.18,
                      }}

                      className="
                        w-full
                        max-w-[420px]

                        overflow-hidden

                        rounded-[28px]
                        border
                        border-[#2d3b35]

                        bg-[#18211f]

                        shadow-[0_20px_80px_rgba(0,0,0,0.55)]
                      "

                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      {/* HEADER */}
                      <div
                        className="
                          flex
                          items-center
                          justify-between

                          border-b
                          border-[#2d3b35]

                          px-5
                          py-4
                        "
                      >
                        <div>
                          <p
                            className="
                              text-base
                              font-semibold

                              text-white
                            "
                          >
                            Available Categories
                          </p>

                          <p
                            className="
                              mt-0.5

                              text-xs

                              text-[#74877f]
                            "
                          >
                            Select a category for this document
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            setDropdownOpen(
                              false
                            )
                          }

                          className="
                            rounded-xl
                            p-2

                            text-[#8ea59b]

                            transition-colors

                            hover:bg-[#202b27]
                            hover:text-white
                          "
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* CATEGORY LIST */}
                      <div
                        className="
                          max-h-[420px]
                          overflow-y-auto

                          py-2

                          [scrollbar-width:none]
                          [&::-webkit-scrollbar]:hidden
                        "
                      >
                        {normalizedCategories.length > 0 ? (

                          normalizedCategories.map(
                            (category) => {

                              const active =
                                form.category ===
                                category

                              return (
                                <button
                                  key={category}

                                  type="button"

                                  onClick={() => {

                                    setForm(
                                      (prev) => ({
                                        ...prev,
                                        category,
                                      })
                                    )

                                    setDropdownOpen(
                                      false
                                    )
                                  }}

                                  className={`
                                    flex
                                    w-full
                                    items-center
                                    justify-between

                                    gap-3

                                    px-5
                                    py-4

                                    text-left
                                    text-sm

                                    transition-colors

                                    ${
                                      active
                                        ? `
                                          bg-[#202b27]
                                          text-white
                                        `
                                        : `
                                          text-[#d5dfdb]
                                          hover:bg-[#202b27]
                                        `
                                    }
                                  `}
                                >
                                  <span className="break-words">
                                    {category}
                                  </span>

                                  {active && (
                                    <Check className="h-4 w-4 shrink-0 text-[#f5d547]" />
                                  )}
                                </button>
                              )
                            }
                          )

                        ) : (

                          <div
                            className="
                              px-5
                              py-4

                              text-sm
                              text-[#74877f]
                            "
                          >
                            No categories available
                          </div>

                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 pt-2">

              <button
                onClick={onClose}

                className="
                  w-full

                  rounded-2xl
                  border
                  border-[#2d3b35]

                  bg-[#18211f]

                  py-3

                  text-white

                  transition-colors

                  hover:bg-[#202b27]
                "
              >
                Cancel
              </button>

              <button
                disabled={saving}

                onClick={handleSave}

                className="
                  w-full

                  rounded-2xl

                  bg-[#f5d547]

                  py-3

                  font-semibold

                  text-[#111917]

                  transition-opacity

                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default EditFileModal