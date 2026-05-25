import {
  LoaderCircle,
} from "lucide-react"

const LoadingSpinner = ({
  label = "Loading...",
  fullScreen = false,
  className = "",
  size = "default",
}) => {

  const spinnerSize =
    size === "sm"
      ? "h-12 w-12"
      : size === "lg"
        ? "h-20 w-20"
        : "h-16 w-16"

  const iconSize =
    size === "sm"
      ? "h-5 w-5"
      : size === "lg"
        ? "h-8 w-8"
        : "h-6 w-6"

  return (
    <div
      className={`
        flex
        items-center
        justify-center

        ${
          fullScreen
            ? "min-h-screen"
            : "h-full min-h-[240px]"
        }

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

        {/* SPINNER */}
        <div
          className={`
            muted-card

            mb-4

            flex
            items-center
            justify-center

            rounded-3xl

            shadow-[var(--shadow-soft)]

            ${spinnerSize}
          `}
        >
          <LoaderCircle
            className={`
              animate-spin

              ${iconSize}
            `}
            style={{
              color:
                "var(--accent)",
            }}
          />
        </div>

        {/* LABEL */}
        <p
          className="
            text-sm
            font-medium
          "
          style={{
            color:
              "var(--text-secondary)",
          }}
        >
          {label}
        </p>

      </div>
    </div>
  )
}

export default LoadingSpinner