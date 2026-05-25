const CategoryBadge = ({
  category,
}) => {

  return (
    <span
      className="
        inline-flex
        items-center

        rounded-xl

        border

        px-2.5
        py-1

        text-[11px]
        font-medium

        leading-none
      "
      style={{
        borderColor:
          "var(--border)",

        background:
          "var(--panel-light)",

        color:
          "var(--text-primary)",
      }}
    >
      {category}
    </span>
  )
}

export default CategoryBadge