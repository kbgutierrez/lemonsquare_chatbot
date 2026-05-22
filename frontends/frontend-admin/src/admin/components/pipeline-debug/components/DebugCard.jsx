const DebugCard = ({
  icon: Icon,
  title,
  content,
}) => {

  return (
    <div
      className="
        panel-base

        rounded-3xl

        p-5
      "
    >
      <div
        className="
          mb-3

          flex
          items-center
          gap-2
        "
      >
        <Icon
          className="
            h-4
            w-4

            text-[var(--accent)]
          "
        />

        <h2
          className="
            text-sm
            font-semibold

            text-[var(--text-primary)]
          "
        >
          {title}
        </h2>
      </div>

      <pre
        className="
          whitespace-pre-wrap
          break-words

          rounded-2xl

          bg-black/5

          p-4

          font-mono
          text-sm
          leading-relaxed

          text-[var(--text-secondary)]

          dark:bg-white/[0.03]
        "
      >
        {content}
      </pre>
    </div>
  )
}

export default DebugCard