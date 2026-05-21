import { CheckCircle2, MessageSquare, User, Clock } from "lucide-react"

const ResolvedChatCard = ({ chat }) => {
  return (
    <div className="rounded-2xl border border-[#2a3a33] bg-[#141d1a] p-4 transition-all hover:border-[#f5d547]/10">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#2d3b35] bg-[#18211f]">
            <MessageSquare className="h-4 w-4 text-[#f5d547]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{chat.topic || "Resolved Chat"}</p>
            <p className="text-xs text-[#74877f]">ID: {String(chat.session_id || "").slice(0, 24)}...</p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="h-3 w-3" /> Resolved
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#9cb0a8]">
        {chat.user_email && (
          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {chat.user_email}</span>
        )}
        {chat.resolved_at && (
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(chat.resolved_at).toLocaleString()}</span>
        )}
      </div>
      {chat.resolution && (
        <p className="mt-2 rounded-xl border border-[#2a3a33] bg-[#18211f] p-3 text-xs leading-relaxed text-[#d5dfdb]">
          {chat.resolution}
        </p>
      )}
    </div>
  )
}

export default ResolvedChatCard
