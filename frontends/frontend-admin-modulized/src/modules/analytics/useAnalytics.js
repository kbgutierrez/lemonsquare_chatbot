import useLiveQuery from "../../shared/hooks/useLiveQuery.js"
import { normalizeData } from "../../shared/utils/normalize.js"

const FALLBACK = { total_users: 0, total_sessions: 0, unique_users: 0, session_rate: "0.00", average_chat_duration_minutes: 0, total_tickets: 0, new_tickets: 0, resolved_tickets: 0, customer_satisfaction_average: 0, tickets_in_progress: 0, average_tickets_per_user: "0.00", total_uploaded_files: 0, total_self_knowledge: 0, total_resolved_chats: 0, total_file_entries: 0, total_manual_entries: 0, documents_in_review: 0, documents_approved: 0, documents_rejected: 0, status_counts: { new: 0, escalated: 0, resolved: 0, in_progress: 0 }, status_percentages: { new: 0, escalated: 0, resolved: 0, in_progress: 0 }, total_anonymous_sessions: 0, anonymous_user_ids: [], total_premium_users: 0, free_user_ids: [], total_casual_questions: 0, total_paid_questions: 0 }

export const useAnalytics = () => {
  return useLiveQuery({
    queryKey: "analytics_summary",
    queryFn: async () => {
      const res = await fetch("/api/analytics/summary", { headers: { "Accept": "application/json" } })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      return normalizeData(json, FALLBACK)
    },
    initialData: FALLBACK,
    staleWhileRevalidate: true,
  })
}

export default useAnalytics
