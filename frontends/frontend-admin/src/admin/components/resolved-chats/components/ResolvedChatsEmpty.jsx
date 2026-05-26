import { MessagesSquare } from "lucide-react"

const ResolvedChatsEmpty = ({ title, message }) => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <MessagesSquare className="mx-auto mb-4 h-12 w-12 text-[var(--accent)] opacity-40" />
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          {title || "No resolved chats"}
        </h2>
        {message && (
          <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">{message}</p>
        )}
      </div>
    </div>
  )
}

export default ResolvedChatsEmpty