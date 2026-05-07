const tabs = ['Knowledge Files', 'Categories']

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveTab(tab)}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === tab
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

export default NavigationTabs
