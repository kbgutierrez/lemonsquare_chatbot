import AdminDashboard
  from "./admin/pages/AdminDashboard.jsx"

import {
  useAdminTheme,
} from "./shared/hooks/useAdminTheme.js"

const App = () => {
  /* ========================================
     GLOBAL ADMIN THEME
  ======================================== */
  useAdminTheme()

  return (
    <div className="app-shell">
      {/* GLOBAL BACKGROUND */}
      <div className="app-background" />

      {/* MAIN CONTENT */}
      <main className="app-layout">
        <AdminDashboard />
      </main>
    </div>
  )
}

export default App