// FILE:
// frontends/frontend-admin/src/admin/components/manual-entries/components/modal/form/ManualEntryTitleInput.jsx

const ManualEntryTitleInput = ({
  value,
  onChange,
}) => {
  return (
    <input
      placeholder="Title"
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

export default ManualEntryTitleInput