import AdminPage from './admin/AdminPage.jsx'
import BubbleChat from './bubble-chat/BubbleChat.jsx'

const App = () => {
  return (
    <div className="app-shell">
      {/* GLOBAL BACKGROUND */}
      <div className="app-background" />

      {/* MAIN CONTENT */}
      <main className="app-layout">
        <AdminPage />
      </main>

      {/* FLOATING CHAT */}
      <BubbleChat />
    </div>
  )
}

export default App