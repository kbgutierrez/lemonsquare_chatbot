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
        {/* ICON */}
        <div
          className="
            mb-4

            flex
            h-16
            w-16
            items-center
            justify-center

            rounded-3xl

            border
            border-[#2b3933]

            bg-[#18211f]
          "
        >
          {icon || (
            <div
              className="
                h-3
                w-3

                rounded-full

                bg-[#f5d547]
              "
            />
          )}
        </div>

        {/* TITLE */}
        <h3
          className="
            text-sm
            font-semibold

            text-white
          "
        >
          {title}
        </h3>

        {/* MESSAGE */}
        <p
          className="
            mt-2

            max-w-sm

            text-sm

            text-[#81958c]
          "
        >
          {message}
        </p>

        {/* ACTION */}
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