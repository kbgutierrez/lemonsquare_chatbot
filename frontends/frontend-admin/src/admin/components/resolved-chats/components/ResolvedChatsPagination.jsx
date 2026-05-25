const ResolvedChatsPagination = ({
  page,
  setPage,
  totalPages,
}) => {

  if (
    totalPages <= 1
  ) {
    return null
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
            totalPages,
        },
        (_, i) =>
          i + 1
      ).map((number) => {

        const isActive =
          page === number

        return (
          <button
            key={number}
            onClick={() =>
              setPage(
                number
              )
            }
            className={`
              h-10
              w-10

              rounded-xl
              border

              text-sm
              font-semibold

              transition-all
              duration-200

              ${
                isActive
                  ? `
                    border-[color:var(--accent)]
                    bg-[color:var(--accent)]

                    text-[#111917]

                    shadow-[0_10px_30px_rgba(245,213,71,0.16)]
                  `
                  : `
                    theme-border

                    bg-[color:var(--panel)]
                    text-[color:var(--text-primary)]

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

export default ResolvedChatsPagination