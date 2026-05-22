// FILE:
// frontends/frontend-admin/src/admin/components/manual-entries/components/modal/layout/ManualEntryModalBackdrop.jsx

const ManualEntryModalBackdrop = ({
  onClose,
}) => {
  return (
    <div
      onClick={onClose}
      className="
        absolute
        inset-0

        bg-black/70
        backdrop-blur-md
      "
    />
  )
}

export default ManualEntryModalBackdrop