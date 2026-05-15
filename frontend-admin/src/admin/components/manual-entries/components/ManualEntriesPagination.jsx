const ManualEntriesPagination =
  ({
    page,
    setPage,
    totalPages,
  }) => {

    /* ========================================
       GUARDS
    ======================================== */

    if (
      !totalPages ||
      totalPages <= 1
    ) {

      return null
    }

    const safeTotalPages =
      Math.max(
        1,
        totalPages
      )

    const handlePageChange =
      (number) => {

        if (
          number < 1 ||
          number >
            safeTotalPages
        ) {

          return
        }

        console.log(
          "CHANGE_PAGE",
          number
        )

        setPage(
          number
        )
      }

    return (
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-center
          gap-2
        "
      >

        {Array.from(
          {
            length:
              safeTotalPages,
          },
          (_, i) =>
            i + 1
        ).map((number) => {

          const isActive =
            page ===
            number

          return (
            <button
              key={number}

              type="button"

              disabled={
                isActive
              }

              onClick={() =>
                handlePageChange(
                  number
                )
              }

              className={`
                h-10
                w-10
                rounded-xl
                text-sm
                font-semibold
                transition-all
                duration-200

                ${
                  isActive
                    ? `
                      cursor-default
                      bg-[#f5d547]
                      text-[#111917]
                    `
                    : `
                      bg-[#18211f]
                      text-white
                      hover:scale-105
                      hover:bg-[#202b27]
                    `
                }
              `}
            >
              {number}
            </button>
          )
        })}
      </div>
    )
  }

export default ManualEntriesPagination