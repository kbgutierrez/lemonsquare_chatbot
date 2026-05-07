import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const ModelDropdown = ({ models }) => {
  const [selectedModel, setSelectedModel] = useState(models[0]?.id)
  const activeModel = models.find((m) => m.id === selectedModel)

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase text-slate-500 tracking-wider">AI Model</p>
      <div className="relative">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  )
}

export default ModelDropdown
