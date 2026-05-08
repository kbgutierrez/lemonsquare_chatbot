import { useEffect, useState } from 'react'
import HeaderCard from './components/HeaderCard.jsx'
import SidebarMenu from './components/SidebarMenu.jsx'
import AIModelDropdown from './components/AIModelDropdown.jsx'
import UploadSection from './components/UploadSection.jsx'
import KnowledgeFilesSection from './components/KnowledgeFilesSection.jsx'

const AdminPage = () => {
  const [activeView, setActiveView] = useState('upload')

  const [sidebarWidth, setSidebarWidth] = useState(280)

  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!isResizing) return

      const newWidth = event.clientX

      if (newWidth >= 240 && newWidth <= 500) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <section className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">

      {/* HEADER */}
      <HeaderCard />

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden p-4">

        {/* LEFT SIDEBAR */}
        <aside
          style={{ width: `${sidebarWidth}px` }}
          className="flex flex-col gap-4 overflow-hidden"
        >
          <SidebarMenu
            activeView={activeView}
            setActiveView={setActiveView}
          />

          <AIModelDropdown />
        </aside>

        {/* DRAG HANDLE */}
        <div
          onMouseDown={() => setIsResizing(true)}
          className="group mx-2 hidden w-1 cursor-col-resize rounded-full bg-transparent transition-all duration-200 hover:bg-violet-300 lg:block"
        >
          <div className="h-full w-full rounded-full group-hover:bg-violet-400" />
        </div>

        {/* CONTENT */}
        <main className="flex-1 overflow-hidden rounded-2xl border border-violet-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm">

          <div className="h-full overflow-auto pr-1">

            {activeView === 'upload' ? (
              <UploadSection />
            ) : (
              <KnowledgeFilesSection />
            )}

          </div>

        </main>
      </div>
    </section>
  )
}

export default AdminPage