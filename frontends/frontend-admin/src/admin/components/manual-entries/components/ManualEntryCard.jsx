import {
  useEffect,
  useState,
  useCallback,
  memo,
} from "react"

import {
  motion,
  AnimatePresence,
} from "framer-motion"

import {
  Pencil,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Check,
  RotateCcw,
  ChevronRight,
  Minimize2,
} from "lucide-react"

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
        muted-card
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

const ManualEntryCard = ({
  item,
  submitting,
  handleUpdateEntry,
  handleDeleteEntry,
  handleRestoreEntry,
  allowedCategories = [],
}) => {

  const [
    expanded,
    setExpanded,
  ] = useState(false)

  const [
    editing,
    setEditing,
  ] = useState(false)

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false)

  const [
    showCategoryModal,
    setShowCategoryModal,
  ] = useState(false)

  const [form, setForm] = useState({
    title: "",
    category: "",
    content: "",
  })

  /* ========================================
     SYNC ITEM → FORM
  ======================================== */

  useEffect(() => {

    setForm({
      title:
        item?.title || "",

      category:
        item?.category || "",

      content:
        item?.content || "",
    })

  }, [item])

  /* ========================================
     CATEGORY OPTIONS
  ======================================== */

  const categoryOptions = [
    ...new Set(
      [
        ...(allowedCategories || []),

        item?.category,
      ].filter(Boolean)
    ),
  ]

  /* ========================================
     HANDLERS
  ======================================== */

  const handleCancel =
    useCallback(() => {

      setForm({
        title:
          item?.title || "",

        category:
          item?.category || "",

        content:
          item?.content || "",
      })

      setEditing(false)

      setShowCategoryModal(false)

    }, [item])

  const handleSave =
    useCallback(async () => {

      if (!item?.id) {

        console.error(
          "Missing manual entry ID."
        )

        return
      }

      await handleUpdateEntry(
        item.id,
        form,
        () => setEditing(false)
      )

    }, [
      item,
      form,
      handleUpdateEntry,
    ])

  const handleDelete =
    useCallback(async () => {

      if (!item?.id) {

        console.error(
          "Missing manual entry ID."
        )

        return
      }

      await handleDeleteEntry(
        item.id
      )

      setShowDeleteModal(false)

      setExpanded(false)

    }, [
      item,
      handleDeleteEntry,
    ])

  const handleRestore =
    useCallback(async () => {

      if (!item?.id) {

        console.error(
          "Missing manual entry ID."
        )

        return
      }

      await handleRestoreEntry(
        item.id
      )

      setExpanded(false)

    }, [
      item,
      handleRestoreEntry,
    ])

  const handleSelectCategory =
    useCallback((category) => {

      setForm((prev) => ({
        ...prev,
        category,
      }))

      setShowCategoryModal(false)

    }, [])

  /* ========================================
     STATE
  ======================================== */

  const isInactive =
    !item.is_active

  /* ========================================
     RENDER
  ======================================== */

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
        className={`group flex w-full items-center justify-between rounded-[24px] border px-5 py-4 text-left transition-all duration-200 ${
          isInactive
            ? `
              border-[color:var(--border)]
              bg-[color:var(--panel)]

              hover:border-[color:var(--text-muted)]
            `
            : `
              border-[color:var(--border)]
              bg-[color:var(--panel)]

              hover:border-[color:var(--accent-green)]/30
              hover:bg-[color:var(--hover)]
            `
        }`}
      >

        {/* LEFT */}
        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-3">

            <span
              className={`rounded-xl border px-2.5 py-1 text-[11px] font-semibold ${
                isInactive
                  ? `
                    border-red-500/20
                    bg-red-500/10
                    text-red-300
                  `
                  : `
                    border-emerald-500/20
                    bg-emerald-500/10
                    text-emerald-300
                  `
              }`}
            >

              {isInactive
                ? "Inactive"
                : "Active"}

            </span>

            <span
              className="
                rounded-xl

                border
                border-[color:var(--accent-green)]/10

                bg-[color:var(--accent-green)]/10

                px-2.5
                py-1

                text-[11px]
                font-semibold

                text-[color:var(--accent-green)]
              "
            >

              {form.category || "General"}

            </span>

            <span
              className="
                truncate
                text-sm
                font-semibold
                text-[color:var(--text-primary)]
              "
            >
              {form.title || "Untitled Entry"}
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

            {form.content ||
              "No content available."}

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
                modal-surface

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
                      className={`rounded-xl border px-3 py-1 text-xs font-semibold ${
                        isInactive
                          ? `
                            border-red-500/20
                            bg-red-500/10
                            text-red-300
                          `
                          : `
                            border-emerald-500/20
                            bg-emerald-500/10
                            text-emerald-300
                          `
                      }`}
                    >

                      {isInactive
                        ? "Inactive Entry"
                        : "Active Entry"}

                    </span>

                    <span
                      className="
                        rounded-xl

                        border
                        border-[color:var(--accent-green)]/10

                        bg-[color:var(--accent-green)]/10

                        px-3
                        py-1

                        text-xs
                        font-semibold

                        text-[color:var(--accent-green)]
                      "
                    >

                      {form.category || "General"}

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
                    Manual Knowledge Entry
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

                {!editing ? (
                  <div className="space-y-5">

                    <FieldBlock
                      title="Title"
                      value={form.title}
                      color="text-[color:var(--accent-green)]"
                    />

                    <FieldBlock
                      title="Category"
                      value={form.category}
                      color="text-[#7dd3fc]"
                    />

                    <FieldBlock
                      title="Knowledge Content"
                      value={form.content}
                      color="text-[color:var(--accent)]"
                    />

                  </div>
                ) : (
                  <div className="space-y-4">

                    {/* TITLE */}
                    <input
                      value={form.title}
                      disabled={submitting}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          title:
                            e.target.value,
                        }))
                      }
                      className="input-base"
                    />

                    {/* CATEGORY */}
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() =>
                        setShowCategoryModal(true)
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-between

                        rounded-2xl

                        border
                        theme-border

                        bg-[color:var(--panel)]

                        px-4
                        py-3

                        text-left
                        text-[color:var(--text-primary)]

                        transition-all
                        duration-200

                        hover:border-[color:var(--accent-green)]/40
                        hover:bg-[color:var(--hover)]
                      "
                    >
                      <span className="truncate">
                        {form.category ||
                          "Select category"}
                      </span>

                      <ChevronDown
                        className="
                          h-4
                          w-4
                          text-[color:var(--accent-green)]
                        "
                      />
                    </button>

                    {/* CONTENT */}
                    <textarea
                      rows={12}
                      value={form.content}
                      disabled={submitting}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          content:
                            e.target.value,
                        }))
                      }
                      className="
                        input-base

                        min-h-[280px]

                        resize-none

                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    />

                  </div>
                )}

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

                {!editing ? (
                  <div className="flex gap-3">

                    <button
                      onClick={() =>
                        setEditing(true)
                      }
                      className="
                        flex
                        flex-1
                        items-center
                        justify-center
                        gap-2

                        rounded-2xl

                        border
                        border-[color:var(--accent-green)]/20

                        bg-[color:var(--accent-green)]/10

                        py-4

                        text-sm
                        font-semibold

                        text-[color:var(--accent-green)]

                        transition-all

                        hover:bg-[color:var(--accent-green)]/20
                      "
                    >

                      <Pencil className="h-4 w-4" />

                      Edit Entry

                    </button>

                    {isInactive ? (
                      <button
                        disabled={submitting}
                        onClick={
                          handleRestore
                        }
                        className="
                          flex
                          flex-1
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

                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      >

                        <RotateCcw className="h-4 w-4" />

                        Restore Entry

                      </button>
                    ) : (
                      <button
                        disabled={submitting}
                        onClick={() =>
                          setShowDeleteModal(
                            true
                          )
                        }
                        className="
                          flex
                          flex-1
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

                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      >

                        <Trash2 className="h-4 w-4" />

                        Archive Entry

                      </button>
                    )}

                  </div>
                ) : (
                  <div className="flex gap-3">

                    <button
                      disabled={submitting}
                      onClick={handleCancel}
                      className="
                        flex-1

                        rounded-2xl

                        border
                        theme-border

                        bg-[color:var(--panel-light)]

                        py-4

                        font-medium

                        text-[color:var(--text-primary)]

                        transition-all

                        hover:bg-[color:var(--hover)]
                      "
                    >

                      Cancel

                    </button>

                    <button
                      disabled={submitting}
                      onClick={handleSave}
                      className="
                        flex
                        flex-1
                        items-center
                        justify-center
                        gap-2

                        rounded-2xl

                        border
                        border-[color:var(--accent-green)]/20

                        bg-[color:var(--accent-green)]/10

                        py-4

                        text-sm
                        font-semibold

                        text-[color:var(--accent-green)]

                        transition-all

                        hover:bg-[color:var(--accent-green)]/20

                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >

                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}

                      Save Changes

                    </button>

                  </div>
                )}

              </div>

            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* ========================================
         CATEGORY MODAL
      ======================================== */}

      <AnimatePresence>

        {showCategoryModal && (
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
              z-[130]

              flex
              items-center
              justify-center

              bg-[color:var(--modal-overlay)]

              p-4

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
                modal-surface

                flex
                max-h-[85vh]
                w-full
                max-w-xl
                flex-col

                overflow-hidden

                rounded-[32px]

                border
                theme-border
              "
            >

              <div
                className="
                  shrink-0

                  border-b
                  theme-border

                  px-6
                  py-5
                "
              >

                <h2
                  className="
                    text-2xl
                    font-bold
                    text-[color:var(--text-primary)]
                  "
                >
                  Select Category
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[color:var(--text-secondary)]
                  "
                >
                  Choose the best category for this manual knowledge entry.
                </p>

              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

                <div className="space-y-2">

                  {categoryOptions.map(
                    (category, index) => {

                      const selected =
                        form.category ===
                        category

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() =>
                            handleSelectCategory(
                              category
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                            selected
                              ? `
                                border-[color:var(--accent-green)]/40

                                bg-[color:var(--accent-green)]/10

                                text-[color:var(--accent-green)]
                              `
                              : `
                                border-[color:var(--border)]

                                bg-[color:var(--panel)]

                                text-[color:var(--text-primary)]

                                hover:border-[color:var(--border)]
                                hover:bg-[color:var(--hover)]
                              `
                          }`}
                          style={{
                            animationDelay:
                              `${index * 25}ms`,
                          }}
                        >
                          <span className="font-medium">
                            {category}
                          </span>

                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 ${
                              selected
                                ? `
                                  scale-100

                                  bg-[color:var(--accent-green)]

                                  text-[color:var(--background)]
                                `
                                : `
                                  scale-0
                                  opacity-0
                                `
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </div>

                        </button>
                      )
                    }
                  )}

                </div>

              </div>

              <div
                className="
                  shrink-0

                  border-t
                  theme-border

                  px-6
                  py-4
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowCategoryModal(false)
                  }
                  className="
                    w-full

                    rounded-2xl

                    border
                    theme-border

                    bg-[color:var(--panel-light)]

                    px-5
                    py-3

                    text-sm
                    font-medium

                    text-[color:var(--text-primary)]

                    transition-all
                    duration-200

                    hover:bg-[color:var(--hover)]
                  "
                >

                  Close

                </button>

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
                modal-surface

                relative

                w-full
                max-w-md

                overflow-hidden

                rounded-[32px]

                border
                border-red-500/20

                p-6
              "
            >

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

              <h2
                className="
                  text-2xl
                  font-bold
                  text-[color:var(--text-primary)]
                "
              >
                Archive Manual Entry?
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  leading-relaxed
                  text-[color:var(--text-secondary)]
                "
              >

                This removes the manual knowledge entry from active retrieval
                while preserving the data for future restoration.

              </p>

              <div className="mt-6 flex gap-3">

                <button
                  disabled={submitting}
                  onClick={() =>
                    setShowDeleteModal(false)
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

                    disabled:opacity-60
                  "
                >

                  Cancel

                </button>

                <button
                  disabled={submitting}
                  onClick={handleDelete}
                  className="
                    flex
                    flex-1
                    items-center
                    justify-center

                    rounded-2xl

                    bg-red-500

                    py-3

                    font-semibold
                    text-white

                    transition-all

                    hover:bg-red-400

                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Archive"
                  )}

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
  ManualEntryCard
)