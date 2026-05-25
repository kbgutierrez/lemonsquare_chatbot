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
        min-h-[220px]
        w-full

        resize-none

        rounded-2xl

        border
        theme-border

        bg-[color:var(--panel)]

        px-4
        py-3

        text-sm
        leading-relaxed

        text-[color:var(--text-primary)]

        outline-none

        transition-all
        duration-300

        placeholder:text-[color:var(--text-muted)]

        focus:border-[color:var(--accent)]
        focus:bg-[color:var(--hover)]
        focus:shadow-[0_0_0_4px_rgba(245,213,71,0.08)]
      "
    />
  )
}

export default ManualEntryContentTextarea