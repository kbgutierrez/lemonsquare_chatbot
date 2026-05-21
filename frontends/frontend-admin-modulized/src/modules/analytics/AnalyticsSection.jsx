import { useMemo } from "react"
import {
  Users,
  Clock,
  ThumbsUp,
  Headphones,
  FileText,
  HardDrive,
  MessageSquare,
} from "lucide-react"

import { useAnalytics } from "./useAnalytics.js"
import StatCard from "./StatCard.jsx"
import LoadingSpinner from "../../shared/components/LoadingSpinner.jsx"
import ErrorState from "../../shared/components/ErrorState.jsx"

const STATUS_LABELS = {
  new: "New",
  escalated: "Escalated",
  resolved: "Resolved",
  in_progress: "In Progress",
}

const AnalyticsSection = () => {
  const {
    data: stats,
    loading,
    error,
    refresh,
  } = useAnalytics()

  const gridItems = useMemo(() => {
    const s = stats || {}

    const totalTickets = s.total_tickets || 0

    const sats = (
      typeof s.customer_satisfaction_average === "number"
        ? s.customer_satisfaction_average
        : 0
    ).toFixed(1)

    const reviewPercent = s.total_file_entries
      ? Math.round(
          (s.documents_in_review / s.total_file_entries) * 100
        )
      : 0

    return [
      {
        label: "Total Tickets",
        value: totalTickets,
        icon: Headphones,
        color: "green",
        sub: `${s.new_tickets || 0} new, ${
          s.resolved_tickets || 0
        } resolved`,
      },

      {
        label: "Sessions",
        value: s.total_sessions ?? 0,
        icon: MessageSquare,
        color: "yellow",
        sub: `${s.total_users ?? 0} users`,
      },

      {
        label: "Avg Duration",
        value: `${(
          s.average_chat_duration_minutes || 0
        ).toFixed(1)}m`,
        icon: Clock,
        color: null,
        sub: null,
      },

      {
        label: "Satisfaction",
        value: `${sats}/5`,
        icon: ThumbsUp,
        color: "green",
        sub: null,
      },

      {
        label: "In Progress",
        value: s.tickets_in_progress ?? 0,
        icon: HardDrive,
        color: "yellow",
        sub: null,
      },

      {
        label: "Files",
        value: s.total_uploaded_files ?? 0,
        icon: FileText,
        color: null,
        sub: `${reviewPercent}% in review`,
      },

      {
        label: "Unique Users",
        value: s.unique_users ?? 0,
        icon: Users,
        color: "green",
        sub: null,
      },

      {
        label: "Self-Knowledge",
        value: s.total_self_knowledge ?? 0,
        icon: FileText,
        color: "yellow",
        sub: null,
      },
    ]
  }, [stats])

  if (loading && !stats) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-[#26332d] bg-[#101816]/60">
        <LoadingSpinner label="Loading analytics..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-[#26332d] bg-[#101816]/60 p-6">
        <ErrorState
          title="Failed to load analytics"
          message={error}
          onRetry={refresh}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Analytics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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

      {/* Ticket Distribution */}
      {stats?.status_percentages &&
        Object.keys(stats.status_percentages).length > 0 && (
          <div className="card-surface p-5 md:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-label">
                  Ticket Status Distribution
                </span>

                <p className="text-sm text-[#74877f]">
                  Overview of ticket lifecycle distribution.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {Object.entries(STATUS_LABELS).map(
                ([key, label]) => {
                  const count =
                    stats.status_counts?.[key] || 0

                  const pct =
                    stats.status_percentages?.[key] || 0

                  return (
                    <div
                      key={key}
                      className="flex items-center gap-4"
                    >
                      <div className="w-28 shrink-0">
                        <span className="text-sm font-medium text-[#c7d4cf]">
                          {label}
                        </span>
                      </div>

                      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-[#0b1110]">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-[#95c11f] transition-all duration-700"
                          style={{
                            width: `${Math.max(4, pct)}%`,
                          }}
                        />
                      </div>

                      <div className="w-14 shrink-0 text-right">
                        <span className="text-sm font-bold tabular-nums text-white">
                          {count}
                        </span>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        )}
    </div>
  )
}

export default AnalyticsSection