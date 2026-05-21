import AdminDashboard from "../pages/AdminDashboard.jsx"

const App = () => {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden isolation-isolate bg-[#08110f]">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 90%)',
        }}
      />
      <main className="relative z-[2] h-[100dvh]">
        <AdminDashboard />
      </main>
    </div>
  )
}

export default App
