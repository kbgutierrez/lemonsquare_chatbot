import { useState } from 'react'
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { categories } from '../data/categories.js'
import { mockFiles } from '../data/mockFiles.js'
import FileTable from './FileTable.jsx'

const CategoriesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('sales')
  const activeCategory = categories.find((item) => item.id === selectedCategory)

  return (
    <div className="grid gap-3 lg:grid-cols-[180px_1fr]">
      <aside className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase text-slate-600 tracking-wider">Categories</p>
        <div className="mt-2 space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`block w-full rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition ${
                selectedCategory === category.id ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </aside>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col items-start justify-between gap-2 border-b border-slate-200 px-4 py-2 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase text-slate-500 font-medium tracking-wider">Category</p>
            <h2 className="text-sm font-semibold text-slate-900">{activeCategory?.name}</h2>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="rounded-md border border-slate-100 bg-slate-50 p-2">
            <p className="text-xs text-slate-600">This category contains {mockFiles.length} files. Use pagination to browse.</p>
          </div>

          <div className="overflow-x-auto">
            <FileTable files={mockFiles} />
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-2">
            <p className="text-xs text-slate-600">Showing 3 of 12 items</p>
            <div className="flex items-center gap-1">
              <button className="rounded-md border border-slate-200 bg-white p-1 hover:bg-slate-50 transition">
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <button className="rounded-md border border-slate-200 bg-white p-1 hover:bg-slate-50 transition">
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoriesSection
