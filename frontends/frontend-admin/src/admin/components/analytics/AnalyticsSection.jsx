import {
  Activity,
  Brain,
  FileText,
  MessageSquareMore,
  ShieldAlert,
  Ticket,
} from "lucide-react"

import apiClient, {
  buildApiUrl,
} from "../../../shared/api/client"

import API_ENDPOINTS
  from "../../../shared/api/endpoints"

import LoadingSpinner
  from "../../../shared/components/LoadingSpinner"

import ErrorState
  from "../../../shared/components/ErrorState"

import useLiveQuery
  from "../../../shared/hooks/useLiveQuery"

const ANALYTICS_QUERY_KEY =
  "analytics_summary"

const ANALYTICS_REFRESH_INTERVAL =
  5000

const StatCard = ({
  title,
  value,
  icon: Icon,
  accent,
}) => {

  return (
    <div
      className="
        panel-base

        relative

        overflow-hidden

        rounded-[28px]

        p-6
      "
    >

      {/* GLOW */}
      <div
        className={`
          absolute
          right-[-30px]
          top-[-30px]

          h-32
          w-32

          rounded-full

          blur-3xl

          ${accent}
        `}
      />

      <div
        className="
          relative
          z-10

          flex
          items-start
          justify-between
          gap-4
        "
      >

        {/* TEXT */}
        <div>

          <p
            className="
              text-sm
            "
            style={{
              color:
                "var(--text-secondary)",
            }}
          >
            {title}
          </p>

          <h3
            className="
              mt-3

              text-4xl
              font-black

              tracking-tight
            "
            style={{
              color:
                "var(--text-primary)",
            }}
          >
            {value}
          </h3>

        </div>

        {/* ICON */}
        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center

            rounded-2xl
          "
          style={{
            background:
              "var(--panel-light)",
          }}
        >

          <Icon
            className="
              h-7
              w-7
            "
            style={{
              color:
                "var(--accent)",
            }}
          />

        </div>

      </div>

    </div>
  )
}

const fetchAnalytics =
  async () => {

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.ANALYTICS_SUMMARY
      )

    return apiClient.get(
      endpoint
    )
  }

const AnalyticsSection =
  () => {

    const {
      data: analytics,
      loading,
      error,
      refreshing,
    } = useLiveQuery({
      queryKey:
        ANALYTICS_QUERY_KEY,

      queryFn:
        fetchAnalytics,

      refetchInterval:
        ANALYTICS_REFRESH_INTERVAL,

      staleWhileRevalidate:
        true,
    })

    if (
      loading &&
      !analytics
    ) {

      return (
        <div
          className="
            flex
            h-full
            items-center
            justify-center
          "
        >
          <LoadingSpinner
            label="Loading analytics..."
          />
        </div>
      )
    }

    if (
      error &&
      !analytics
    ) {

      return (
        <ErrorState
          title="Analytics Error"
          message={error}
        />
      )
    }

    const chats =
      analytics?.chats || {}

    const knowledge =
      analytics?.knowledge_base || {}

    return (
      <div
        className="
          mx-auto

          flex
          h-full
          w-full
          max-w-[1600px]
          flex-col

          gap-6

          overflow-auto
        "
      >

        {/* HEADER */}
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >

          <div>

            <h1
              className="
                text-3xl
                font-black

                tracking-tight
              "
              style={{
                color:
                  "var(--text-primary)",
              }}
            >
              Analytics Overview
            </h1>

            <p
              className="
                mt-2

                text-sm
              "
              style={{
                color:
                  "var(--text-secondary)",
              }}
            >
              Real-time AI knowledge base
              and support system metrics.
            </p>

          </div>

          {refreshing && (
            <div
              className="
                rounded-xl

                border

                px-3
                py-2

                text-xs
              "
              style={{
                borderColor:
                  "var(--border)",

                background:
                  "var(--panel)",

                color:
                  "var(--text-secondary)",
              }}
            >
              Updating...
            </div>
          )}

        </div>

        {/* GRID */}
        <div
          className="
            grid
            grid-cols-1
            gap-5

            md:grid-cols-2

            xl:grid-cols-3
          "
        >

          <StatCard
            title="Active Chats"
            value={
              chats.total_active || 0
            }
            icon={MessageSquareMore}
            accent="bg-[var(--bg-glow-primary)]"
          />

          <StatCard
            title="Escalated Chats"
            value={
              chats.escalated || 0
            }
            icon={ShieldAlert}
            accent="bg-red-500/10"
          />

          <StatCard
            title="Knowledge PDFs"
            value={
              knowledge.pdfs || 0
            }
            icon={FileText}
            accent="bg-blue-500/10"
          />

          <StatCard
            title="Manual Rules"
            value={
              knowledge.manual_rules || 0
            }
            icon={Brain}
            accent="bg-emerald-500/10"
          />

          <StatCard
            title="Reoslved Chats"
            value={
              knowledge.ai_learned_chats || 0
            }
            icon={Activity}
            accent="bg-violet-500/10"
          />

          <StatCard
            title="Synced Tickets"
            value={
              knowledge.synced_tickets || 0
            }
            icon={Ticket}
            accent="bg-amber-500/10"
          />

        </div>

      </div>
    )
  }

export default AnalyticsSection