const ContextItem = ({
  title,
  score,
  content,
}) => {

  return (
    <div
      className="
        rounded-2xl

        border
        border-[#25332d]

        bg-[#101816]

        p-4
      "
    >
      <div
        className="
          mb-3

          flex
          items-center
          justify-between
        "
      >
        <span
          className="
            text-sm
            font-semibold

            text-white
          "
        >
          {title}
        </span>

        {score && (
          <span
            className="
              rounded-xl

              bg-[#1d2925]

              px-2
              py-1

              text-xs

              text-[#8ea59b]
            "
          >
            Score:
            {" "}
            {Number(
              score
            ).toFixed(3)}
          </span>
        )}
      </div>

      <pre
        className="
          whitespace-pre-wrap
          break-words

          text-xs

          text-[#b6c3bd]
        "
      >
        {content}
      </pre>
    </div>
  )
}

export default ContextItem