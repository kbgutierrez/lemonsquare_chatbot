import { Inbox } from "lucide-react"

const EmptyState = ({
  title = "No data found",
  message = "Nothing to display yet.",
  icon = null,
  action = null,
  className = "",
}) => {
  return (
    <div
      className={`flex min-h-[320px] items-center justify-center px-6 py-14 md:px-8 md:py-16 ${className}`}
    >
      <div className="flex w-full max-w-md flex-col items-center justify-center text-center">
        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-[#2b3933] bg-[#18211f] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          {icon || (
            <Inbox className="h-8 w-8 text-[#f5d547]" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold tracking-tight text-white">
          {title}
        </h3>

        {/* Message */}
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#81958c] md:text-[15px]">
          {message}
        </p>

        {/* Action */}
        {action && (
          <div className="mt-7 flex items-center justify-center">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

export default EmptyState