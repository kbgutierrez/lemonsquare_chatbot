import {
  AlertTriangle,
} from "lucide-react"

const ErrorState = ({
  title = "Something went wrong",
  message = "An unexpected error occurred.",
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
          max-w-md
          flex-col
          items-center

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

            shadow-[var(--shadow-soft)]
          "
          style={{
            borderColor:
              "rgba(239,68,68,0.18)",

            background:
              "rgba(239,68,68,0.10)",
          }}
        >
          <AlertTriangle
            className="
              h-6
              w-6
            "
            style={{
              color:
                "#ef4444",
            }}
          />
        </div>

        {/* TITLE */}
        <h3
          className="
            text-sm
            font-semibold
          "
          style={{
            color:
              "var(--text-primary)",
          }}
        >
          {title}
        </h3>

        {/* MESSAGE */}
        <p
          className="
            mt-2

            text-sm
            leading-relaxed
          "
          style={{
            color:
              "var(--text-secondary)",
          }}
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

export default ErrorState