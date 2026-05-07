import { useState } from 'react'
import Header from './components/Header.jsx'
import NavigationTabs from './components/NavigationTabs.jsx'
import ModelDropdown from './components/ModelDropdown.jsx'
import UploadSection from './components/UploadSection.jsx'
import CategoriesSection from './components/CategoriesSection.jsx'
import { aiModels } from './data/aiModels.js'

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('Knowledge Files')

  return (
    <section className="flex flex-col gap-3 p-4">
      <Header />
      
      <div className="flex flex-col items-start justify-between gap-3 rounded-lg bg-white border border-slate-200 p-4 sm:flex-row sm:items-center">
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <ModelDropdown models={aiModels} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="p-4">
          {activeTab === 'Knowledge Files' ? <UploadSection /> : <CategoriesSection />}
        </div>
      </div>
    </section>
  )
}

export default AdminPage
