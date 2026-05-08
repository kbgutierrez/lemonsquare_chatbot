import { useState } from 'react'
import { categories } from '../data/categories.js'
import { mockFiles } from '../data/mockFiles.js'
import CategoryList from './CategoryList.jsx'
import FileTable from './FileTable.jsx'

const KnowledgeFilesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('sales')

  const activeCategory = categories.find(
    (item) => item.id === selectedCategory
  )

  return (
    <div className="flex h-full flex-col gap-4">

      {/* HEADER */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
          Knowledge Files
        </p>

        <h2 className="mt-1 text-xl font-bold text-violet-900">
          {activeCategory?.name}
        </h2>
      </div>

      {/* MAIN */}
      <div className="grid flex-1 gap-4 overflow-hidden lg:grid-cols-[220px_1fr]">

        {/* CATEGORIES */}
        <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white">
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* FILES */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-violet-100 bg-white">

          <div className="flex items-center justify-between border-b border-violet-100 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-violet-900">
                Files
              </h3>

              <p className="text-xs text-violet-500">
                {mockFiles.length} files available
              </p>
            </div>

            <button className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-100">
              Delete Category
            </button>
          </div>

          <div className="flex-1 overflow-auto p-3">
            <FileTable files={mockFiles} />
          </div>

          <div className="flex items-center justify-between border-t border-violet-100 px-4 py-3 text-xs text-violet-500">
            <p>Showing 1-3 items</p>

            <div className="flex gap-2">
              <button className="rounded-lg border border-violet-200 px-2 py-1 hover:bg-violet-50">
                Prev
              </button>

              <button className="rounded-lg border border-violet-200 px-2 py-1 hover:bg-violet-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeFilesSection