const EmptyState = ({
  title = "No data found",
  message = "Nothing to display yet.",
  icon = null,
  action = null,
  className = "",
}) => {

  return (
    <div
      className={`
        flex
        items-center
        justify-center

        px-6
        py-12

        ${className}
      `}
    >
      <div
        className="
          flex
          flex-col
          items-center
          justify-center

          text-center
        "
      >
        <div
          className="
            muted-card

            mb-4

            flex
            h-16
            w-16
            items-center
            justify-center

            rounded-3xl
          "
        >
          {icon || (
            <div
              className="
                h-3
                w-3

                rounded-full

                bg-[var(--accent)]
              "
            />
          )}
        </div>

        <h3
          className="
            text-sm
            font-semibold

            text-[var(--text-primary)]
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-2

            max-w-sm

            text-sm
            leading-relaxed

            text-[var(--text-secondary)]
          "
        >
          {message}
        </p>

        {action && (
          <div className="mt-5">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

export default EmptyState