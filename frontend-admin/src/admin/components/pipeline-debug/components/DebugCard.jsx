const DebugCard = ({
  icon: Icon,
  title,
  content,
}) => {

  return (
    <div
      className="
        rounded-3xl

        border
        border-[#25332d]

        bg-[#151d1b]

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

            text-[#f5d547]
          "
        />

        <h2
          className="
            text-sm
            font-semibold

            text-white
          "
        >
          {title}
        </h2>
      </div>

      <pre
        className="
          whitespace-pre-wrap
          break-words

          text-sm

          text-[#b6c3bd]
        "
      >
        {content}
      </pre>
    </div>
  )
}

export default DebugCard