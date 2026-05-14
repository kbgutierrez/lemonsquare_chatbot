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
      ).map((number) => (
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

            text-sm
            font-semibold

            transition-all

            ${
              page ===
              number
                ? `
                  bg-[#f5d547]
                  text-[#111917]
                `
                : `
                  bg-[#18211f]
                  text-white
                  hover:bg-[#202b27]
                `
            }
          `}
        >
          {number}
        </button>
      ))}
    </div>
  )
}

export default ResolvedChatsPagination