import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { createPortal } from "react-dom"

import ManualEntryModalBackdrop
  from "./modal/layout/ManualEntryModalBackdrop"

import ManualEntryModalContainer
  from "./modal/ManualEntryModalContainer"

import ManualEntryCategoryModal
  from "./modal/category-selector/ManualEntryCategoryModal"

const ManualEntryModal = ({
  showModal,
  setShowModal,

  categories,

  submitting,
  error,

  handleCreateEntry,
  handleUpdateEntry,
  handleDeleteEntry,

  editingEntry = null,
}) => {

  /* ========================================
     REFS
  ======================================== */

  const modalCardRef =
    useRef(null)

  /* ========================================
     STATE
  ======================================== */

  const [
    categoryModalOpen,
    setCategoryModalOpen,
  ] = useState(false)

  const [
    form,
    setForm,
  ] = useState({
    title: "",
    category: "",
    content: "",
  })

  const isEditMode =
    Boolean(editingEntry)

  /* ========================================
     MEMOS
  ======================================== */

  const selectableCategories =
    useMemo(() => {

      return categories.filter(
        (category) =>
          category !== "All"
      )

    }, [categories])

  /* ========================================
     SYNC EDIT DATA
  ======================================== */

  useEffect(() => {

    if (!editingEntry) {

      setForm({
        title: "",
        category: "",
        content: "",
      })

      return
    }

    setForm({
      title:
        editingEntry.title || "",

      category:
        editingEntry.category || "",

      content:
        editingEntry.content || "",
    })

  }, [editingEntry])

  /* ========================================
     BODY LOCK
  ======================================== */

  useEffect(() => {

    if (!showModal) {
      return
    }

    const originalOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      "hidden"

    return () => {
      document.body.style.overflow =
        originalOverflow
    }

  }, [showModal])

  /* ========================================
     ESC CLOSE
  ======================================== */

  useEffect(() => {

    if (!showModal) {
      return
    }

    const handleEscape =
      (event) => {

        if (
          event.key ===
          "Escape"
        ) {

          if (
            categoryModalOpen
          ) {

            setCategoryModalOpen(
              false
            )

            return
          }

          closeModal()
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
    showModal,
    categoryModalOpen,
  ])

  /* ========================================
     CLICK OUTSIDE
  ======================================== */

  useEffect(() => {

    if (!showModal) {
      return
    }

    const handleClickOutside =
      (event) => {

        if (
          categoryModalOpen
        ) {
          return
        }

        if (
          modalCardRef.current &&
          !modalCardRef.current.contains(
            event.target
          )
        ) {
          closeModal()
        }
      }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }

  }, [
    showModal,
    categoryModalOpen,
  ])

  /* ========================================
     HELPERS
  ======================================== */

  const resetForm =
    () => {

      setForm({
        title: "",
        category: "",
        content: "",
      })
    }

  const closeModal =
    () => {

      resetForm()

      setCategoryModalOpen(false)

      setShowModal(false)
    }

  const handleSelectCategory =
    (category) => {

      setForm((prev) => ({
        ...prev,
        category,
      }))

      setCategoryModalOpen(false)
    }

  /* ========================================
     ACTIONS
  ======================================== */

  const handleSubmit =
    async () => {

      const payload = {
        ...form,

        category:
          form.category?.trim()
            || "",
      }

      if (isEditMode) {

        await handleUpdateEntry(
          editingEntry?.id,
          payload,
          closeModal
        )

      } else {

        await handleCreateEntry(
          payload,
          resetForm,
          closeModal
        )
      }
    }

  const handleDelete =
    async () => {

      await handleDeleteEntry(
        editingEntry?.id
      )

      closeModal()
    }

  /* ========================================
     CONDITIONAL RETURN
  ======================================== */

  if (!showModal) {
    return null
  }

  return createPortal(
    <>
      {/* MAIN MODAL */}
      <div
        className="
          fixed
          inset-0
          z-[9999]

          flex
          items-center
          justify-center

          p-4
        "
      >
        <ManualEntryModalBackdrop
          onClose={() => {

            if (
              categoryModalOpen
            ) {
              return
            }

            closeModal()
          }}
        />

        <div
          ref={modalCardRef}
          className="
            relative
            z-[10000]
          "
        >
          <ManualEntryModalContainer
            form={form}
            setForm={setForm}

            error={error}

            submitting={submitting}
            isEditMode={isEditMode}

            categoryModalOpen={categoryModalOpen}
            setCategoryModalOpen={setCategoryModalOpen}

            onClose={closeModal}
            onDelete={handleDelete}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      {/* CATEGORY MODAL */}
      <ManualEntryCategoryModal
        open={categoryModalOpen}
        categories={selectableCategories}
        selectedCategory={form.category}
        onClose={() =>
          setCategoryModalOpen(false)
        }
        onSelect={handleSelectCategory}
      />
    </>,
    document.body
  )
}

export default ManualEntryModal