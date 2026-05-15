const CategoryBadge = ({
  category,
}) => {

  return (
    <span
      className="
        inline-flex
        items-center

        rounded-2xl

        border
        border-[#2d3b35]

        bg-[#18211f]

        px-3
        py-1.5

        text-xs
        font-medium

        text-[#d4dfdb]
      "
    >
      {category}
    </span>
  )
}

export default CategoryBadge