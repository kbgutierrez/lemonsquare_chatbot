const SidebarMenu = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'upload', label: 'Upload' },
    { id: 'files', label: 'Knowledge Files' }
  ]

  return (
    <div className="rounded-2xl border border-violet-100 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
      
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-violet-500">
        Navigation
      </p>

      <div className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
              activeView === item.id
                ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-sm'
                : 'text-violet-700 hover:bg-violet-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SidebarMenu