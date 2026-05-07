import AdminPage from './admin/AdminPage.jsx'
import BubbleChat from './bubble-chat/BubbleChat.jsx'

const App = () => {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <header className="mb-4 rounded-lg bg-slate-900 p-4 text-white shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400">LemonSquare Admin Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold">Knowledge Management System</h1>
        </header>

        <AdminPage />
      </div>

      <BubbleChat />
    </main>
  )
}

export default App
