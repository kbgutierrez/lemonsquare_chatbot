import { AlertTriangle, RefreshCw } from "lucide-react"

const ErrorState = ({ title = "Something went wrong", message = "An unexpected error occurred.", onRetry = null, className = "" }) => {
  return (
    <div className={`flex items-center justify-center px-6 py-12 ${className}`}>
      <div className="flex max-w-md flex-col items-center text-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10">
          <AlertTriangle className="h-6 w-6 text-red-300" />
        </div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-sm text-[#81958c]">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary mt-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorState
