// FILE:
// frontends/frontend-admin/src/admin/components/manual-entries/components/modal/layout/ManualEntryModalShell.jsx

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
        border-[#2f3c36]

        bg-[#141c1a]

        shadow-[0_30px_80px_rgba(0,0,0,0.55)]
      "
    >
      {children}
    </div>
  )
}

export default ManualEntryModalShell