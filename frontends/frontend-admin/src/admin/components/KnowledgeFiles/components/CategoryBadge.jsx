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
        border-[#2d3b35]

        bg-[#18211f]

        px-2.5
        py-1

        text-[11px]
        font-medium

        leading-none

        text-[#d4dfdb]
      "
    >
      {category}
    </span>
  )
}

export default CategoryBadge