const CategoryBadge = ({ category }) => {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
      {category}
    </span>
  )
}

export default CategoryBadge