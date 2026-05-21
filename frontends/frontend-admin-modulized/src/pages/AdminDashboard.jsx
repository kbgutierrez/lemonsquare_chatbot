import { useState, Suspense, lazy } from "react"
import { useAuth } from "../shared/hooks/useAuth.js"
import Sidebar from "../components/layout/Sidebar.jsx"
import TopBar from "../components/layout/TopBar.jsx"
import LoadingSpinner from "../shared/components/LoadingSpinner.jsx"
import LoginPage from "../modules/auth/LoginPage.jsx"

const AnalyticsSection = lazy(() =>
  import("../modules/analytics/AnalyticsSection.jsx")
)
const UploadSection = lazy(() =>
  import("../modules/upload/UploadSection.jsx")
)
const TicketsSection = lazy(() =>
  import("../modules/tickets/TicketsSection.jsx")
)
const KnowledgeFilesSection = lazy(() =>
  import("../modules/knowledge-files/KnowledgeFilesSection.jsx")
)
const ManualEntriesSection = lazy(() =>
  import("../modules/manual-entries/ManualEntriesSection.jsx")
)
const ResolvedChatsSection = lazy(() =>
  import("../modules/resolved-chats/ResolvedChatsSection.jsx")
)
const AISettingsPanel = lazy(() =>
  import("../modules/ai-settings/AISettingsPanel.jsx")
)
const PipelineDebugSection = lazy(() =>
  import("../modules/pipeline-debug/PipelineDebugSection.jsx")
)
const SettingsSection = lazy(() =>
  import("../modules/ai-settings/SettingsSection.jsx")
)

const SECTIONS = {
  analytics: {
    title: "Analytics Overview",
    component: AnalyticsSection,
  },

  upload: {
    title: "Upload Files",
    component: UploadSection,
  },

  tickets: {
    title: "Ticket Management",
    component: TicketsSection,
  },

  knowledge: {
    title: "Knowledge Files",
    component: KnowledgeFilesSection,
  },

  manual: {
    title: "Manual Entries",
    component: ManualEntriesSection,
  },

  resolved: {
    title: "Resolved Chats",
    component: ResolvedChatsSection,
  },

  "ai-settings": {
    title: "AI Settings",
    component: AISettingsPanel,
  },

  pipeline: {
    title: "Pipeline Debug",
    component: PipelineDebugSection,
  },

  settings: {
    title: "Settings",
    component: SettingsSection,
  },
}

const AdminDashboard = () => {
  const { isAuthenticated, adminUser, login } = useAuth()

  const [activeSection, setActiveSection] = useState("analytics")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentSection =
    SECTIONS[activeSection] || SECTIONS.analytics

  const SectionComponent = currentSection.component

  const handleLogin = (userData) => {
    login(userData)
  }

  const handleRefresh = () => {
    window.dispatchEvent(
      new CustomEvent("admin:refresh", {
        detail: { section: activeSection },
      })
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#08110f]">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userName={
          adminUser?.name ||
          adminUser?.username ||
          "Admin"
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          sectionTitle={currentSection.title}
          onRefresh={handleRefresh}
          refreshTooltip={`Refresh ${currentSection.title}`}
        />

        <section className="flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-[1700px] flex-col px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-7">
            <Suspense
              fallback={
                <div className="flex flex-1 items-center justify-center py-20">
                  <LoadingSpinner
                    label={`Loading ${currentSection.title.toLowerCase()}...`}
                  />
                </div>
              }
            >
              <SectionComponent />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminDashboard