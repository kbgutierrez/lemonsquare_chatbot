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

                      bg-[color:var(--accent)]

                      text-[color:var(--background)]

                      shadow-[0_4px_18px_rgba(0,0,0,0.12)]
                    `
                    : `
                      border
                      theme-border

                      bg-[color:var(--panel)]

                      text-[color:var(--text-primary)]

                      hover:scale-105
                      hover:bg-[color:var(--hover)]
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