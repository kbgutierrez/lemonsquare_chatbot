import { useState } from 'react'
import {
  ChevronDown,
  BrainCircuit,
  CheckCircle2
} from 'lucide-react'

import { aiModels } from '../data/aiModels.js'

const AIModelDropdown = () => {
  const [isOpen, setIsOpen] = useState(true)

  const [selectedModel, setSelectedModel] = useState(aiModels[0])

  const [hoveredModel, setHoveredModel] = useState(null)

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">

      {/* HEADER */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between border-b border-violet-100 px-4 py-3 transition-all duration-200 hover:bg-violet-50"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
            AI Models
          </p>

          <p className="mt-1 text-sm font-medium text-violet-900">
            Active Model Configuration
          </p>
        </div>

        <ChevronDown
          className={`h-5 w-5 text-violet-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* ACTIVE MODEL */}
      <div className="border-b border-violet-100 bg-violet-50/60 p-4">

        <div className="flex items-start gap-3">

          <div className="rounded-xl bg-violet-100 p-2">
            <BrainCircuit className="h-5 w-5 text-violet-700" />
          </div>

          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-violet-900">
              {selectedModel.name}
            </p>

            <p className="mt-1 text-xs leading-relaxed text-violet-600">
              {selectedModel.description}
            </p>
          </div>
        </div>
      </div>

      {/* MODEL LIST */}
      {isOpen && (
        <div className="flex-1 overflow-auto">

          <div className="divide-y divide-violet-100">

            {aiModels.map((model) => {
              const isActive =
                selectedModel.id === model.id

              const isHovered =
                hoveredModel === model.id

              return (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  onMouseEnter={() =>
                    setHoveredModel(model.id)
                  }
                  onMouseLeave={() =>
                    setHoveredModel(null)
                  }
                  className={`w-full p-4 text-left transition-all duration-200 hover:bg-violet-50 ${
                    isActive
                      ? 'bg-violet-100/70'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3">

                    <div
                      className={`mt-0.5 rounded-lg p-2 transition-all duration-200 ${
                        isActive
                          ? 'bg-violet-200'
                          : 'bg-violet-100'
                      }`}
                    >
                      <BrainCircuit className="h-4 w-4 text-violet-700" />
                    </div>

                    <div className="min-w-0 flex-1">

                      {/* TITLE */}
                      <div className="flex items-start justify-between gap-2">

                        <p className="break-words text-sm font-semibold text-violet-900">
                          {model.name}
                        </p>

                        {isActive && (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        )}
                      </div>

                      {/* HOVER DESCRIPTION */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isHovered
                            ? 'mt-2 max-h-32 opacity-100'
                            : 'max-h-0 opacity-0'
                        }`}
                      >
                        <p className="text-xs leading-relaxed text-violet-600">
                          {model.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}

          </div>
        </div>
      )}
    </div>
  )
}

export default AIModelDropdown