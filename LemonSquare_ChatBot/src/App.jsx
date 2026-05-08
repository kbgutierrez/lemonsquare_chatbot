import AdminPage from './admin/AdminPage.jsx'
import BubbleChat from './bubble-chat/BubbleChat.jsx'

const App = () => {
  return (
    <main className="h-screen overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <AdminPage />

      <BubbleChat />
    </main>
  )
}

export default App