const ContextItem = ({
  title,
  score,
  content,
}) => {

  return (
    <div
      className="
        muted-card

        rounded-2xl

        p-4
      "
    >
      <div
        className="
          mb-3

          flex
          items-center
          justify-between
          gap-3
        "
      >
        <span
          className="
            text-sm
            font-semibold

            text-[var(--text-primary)]
          "
        >
          {title}
        </span>

        {score && (
          <span
            className="
              rounded-xl

              border
              border-[var(--border)]

              bg-[var(--hover)]

              px-2.5
              py-1

              text-xs
              font-medium

              text-[var(--text-secondary)]
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

          font-mono
          text-xs
          leading-relaxed

          text-[var(--text-secondary)]
        "
      >
        {content}
      </pre>
    </div>
  )
}

export default ContextItem