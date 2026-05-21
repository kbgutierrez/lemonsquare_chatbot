const ManualEntryTabs =
  ({
    categories,
    activeCategory,
    setActiveCategory,
    setPage,
  }) => {

    return (
      <div
        className="
          flex
          flex-wrap
          gap-3
        "
      >
        {categories.map(
          (category) => {

            const active =
              activeCategory ===
              category

            return (
              <button
                key={category}
                onClick={() => {

                  setActiveCategory(
                    category
                  )

                  setPage(1)
                }}
                className={`
                  rounded-2xl
                  px-4
                  py-2

                  text-sm
                  font-medium

                  transition-all
                  duration-200

                  ${
                    active
                      ? `
                        bg-[#f5d547]
                        text-[#111917]
                      `
                      : `
                        border
                        border-[#2d3b35]

                        bg-[#18211f]

                        text-[#d7e0dc]

                        hover:bg-[#202b27]
                      `
                  }
                `}
              >
                {category}
              </button>
            )
          }
        )}
      </div>
    )
  }

export default ManualEntryTabs