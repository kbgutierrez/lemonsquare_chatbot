import { useMemo } from "react"
import {
  Activity,
  Brain,
  FileText,
  MessageSquareMore,
  ShieldAlert,
  Ticket,
} from "lucide-react"

import { useAnalytics } from "./useAnalytics.js"
import StatCard from "./StatCard.jsx"

import LoadingSpinner from "../../shared/components/LoadingSpinner.jsx"
import ErrorState from "../../shared/components/ErrorState.jsx"

const AnalyticsSection = () => {
  const {
    data: analytics,
    loading,
    error,
    refresh,
  } = useAnalytics()

  const gridItems = useMemo(() => {
    const chats =
      analytics?.chats || {}

    const knowledge =
      analytics?.knowledge_base || {}

    return [
      {
        label: "Active Chats",
        value:
          chats.total_active || 0,
        icon:
          MessageSquareMore,
        color:
          "yellow",
        sub: null,
      },

      {
        label:
          "Escalated Chats",
        value:
          chats.escalated || 0,
        icon:
          ShieldAlert,
        color:
          null,
        sub: null,
      },

      {
        label:
          "Knowledge PDFs",
        value:
          knowledge.pdfs || 0,
        icon:
          FileText,
        color:
          null,
        sub: null,
      },

      {
        label:
          "Manual Rules",
        value:
          knowledge.manual_rules || 0,
        icon:
          Brain,
        color:
          "green",
        sub: null,
      },

      {
        label:
          "AI Learned Chats",
        value:
          knowledge.ai_learned_chats || 0,
        icon:
          Activity,
        color:
          null,
        sub: null,
      },

      {
        label:
          "Synced Tickets",
        value:
          knowledge.synced_tickets || 0,
        icon:
          Ticket,
        color:
          "yellow",
        sub: null,
      },
    ]
  }, [analytics])

  if (
    loading &&
    !analytics
  ) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-[#26332d] bg-[#101816]/60">
        <LoadingSpinner label="Loading analytics..." />
      </div>
    )
  }

  if (
    error &&
    !analytics
  ) {
    return (
      <div className="rounded-3xl border border-[#26332d] bg-[#101816]/60 p-6">
        <ErrorState
          title="Analytics Error"
          message={error}
          onRetry={refresh}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-7">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Analytics Overview
          </h1>

          <p className="mt-2 text-sm text-[#7f948b]">
            Real-time AI knowledge base and support system metrics.
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {gridItems.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            sub={item.sub}
            icon={item.icon}
            accentColor={item.color}
          />
        ))}
      </div>
    </div>
  )
}

export default AnalyticsSection