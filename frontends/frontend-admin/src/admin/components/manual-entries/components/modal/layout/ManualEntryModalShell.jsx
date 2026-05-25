const ManualEntryModalShell = ({
  children,
}) => {

  return (
    <div
      className="
        relative
        z-10

        flex
        w-full
        max-w-[520px]
        flex-col

        overflow-hidden

        rounded-[28px]

        border
        theme-border

        glass-panel
      "
    >

      {children}

    </div>
  )
}

export default ManualEntryModalShell