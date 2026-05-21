import { LoaderCircle } from "lucide-react"

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
      ? "h-24 w-24"
      : "h-16 w-16"

  const iconSize =
    size === "sm"
      ? "h-5 w-5"
      : size === "lg"
      ? "h-10 w-10"
      : "h-7 w-7"

  const containerHeight = fullScreen
    ? "min-h-[420px]"
    : "min-h-[260px]"

  return (
    <div
      className={`flex items-center justify-center px-6 py-10 ${containerHeight} ${className}`}
    >
      <div className="flex flex-col items-center justify-center text-center">
        {/* Spinner */}
        <div
          className={`mb-5 flex items-center justify-center rounded-[28px] border border-[#2b3933] bg-[#18211f] shadow-[0_12px_30px_rgba(0,0,0,0.18)] ${spinnerSize}`}
        >
          <LoaderCircle
            className={`animate-spin text-[#f5d547] ${iconSize}`}
          />
        </div>

        {/* Label */}
        <p className="max-w-xs text-sm font-medium leading-relaxed text-[#c7d3ce] md:text-[15px]">
          {label}
        </p>
      </div>
    </div>
  )
}

export default LoadingSpinner