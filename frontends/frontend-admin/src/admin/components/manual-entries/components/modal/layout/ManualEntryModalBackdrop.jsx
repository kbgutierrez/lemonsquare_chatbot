const ManualEntryModalBackdrop = ({
  onClose,
}) => {

  return (
    <div
      onClick={onClose}

      className="
        absolute
        inset-0

        bg-[color:var(--modal-overlay)]

        backdrop-blur-md

        transition-all
        duration-300
      "
    />
  )
}

export default ManualEntryModalBackdrop