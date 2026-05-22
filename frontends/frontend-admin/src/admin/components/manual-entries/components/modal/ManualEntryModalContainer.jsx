import ManualEntryModalHeader
  from "./ManualEntryModalHeader"

import ManualEntryModalActions
  from "./ManualEntryModalActions"

import ManualEntryTitleInput
  from "./form/ManualEntryTitleInput"

import ManualEntryContentTextarea
  from "./form/ManualEntryContentTextarea"

import ManualEntryCategoryTrigger
  from "./category-selector/ManualEntryCategoryTrigger"

const ManualEntryModalContainer = ({
  form,
  setForm,

  error,

  submitting,
  isEditMode,

  categoryModalOpen,
  setCategoryModalOpen,

  onClose,
  onDelete,
  onSubmit,
}) => {

  return (
    <div
      className="
        relative
        z-[130]

        w-full
        max-w-2xl

        rounded-[32px]

        border
        border-[#2a3a33]

        bg-[#111917]

        p-6

        shadow-[0_20px_80px_rgba(0,0,0,0.45)]
      "
    >
      {/* HEADER */}
      <ManualEntryModalHeader
        isEditMode={isEditMode}
        onClose={onClose}
      />

      {/* ERROR */}
      {error && (
        <div
          className="
            mb-4
            mt-4

            rounded-2xl

            border
            border-red-500/30

            bg-red-500/10

            px-4
            py-3

            text-sm
            text-red-300
          "
        >
          {error}
        </div>
      )}

      {/* FORM */}
      <div className="mt-5 space-y-4">
        {/* TITLE */}
        <ManualEntryTitleInput
          value={form.title}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              title:
                event.target.value,
            }))
          }
        />

        {/* CATEGORY */}
        <ManualEntryCategoryTrigger
          category={form.category}
          open={categoryModalOpen}
          onClick={() =>
            setCategoryModalOpen(
              true
            )
          }
        />

        {/* CONTENT */}
        <ManualEntryContentTextarea
          value={form.content}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              content:
                event.target.value,
            }))
          }
        />

        {/* ACTIONS */}
        <ManualEntryModalActions
          isEditMode={isEditMode}
          submitting={submitting}
          onDelete={onDelete}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  )
}

export default ManualEntryModalContainer