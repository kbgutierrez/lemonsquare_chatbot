// FILE:
// frontends/frontend-admin/src/admin/components/manual-entries/components/modal/form/ManualEntryContentTextarea.jsx

const ManualEntryContentTextarea = ({
  value,
  onChange,
}) => {
  return (
    <textarea
      rows={8}
      placeholder="Knowledge content..."
      value={value}
      onChange={onChange}
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
  )
}

export default ManualEntryContentTextarea