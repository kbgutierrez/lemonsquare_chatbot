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
        input-base
      "
    />
  )
}

export default ManualEntryTitleInput