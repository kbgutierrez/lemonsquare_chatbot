import { useMemo, useRef } from "react"

import { Search } from "lucide-react"

import FileTable from "./FileTable"

import { useKnowledgeFiles } from "./hooks/useKnowledgeFiles"

import { useHorizontalDragScroll } from "../../../shared/hooks/useHorizontalDragScroll"

import LoadingSpinner from "../../../shared/components/LoadingSpinner"

const KnowledgeFilesSection = () => {
  const {
    loading,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    dynamicCategories,
    allCategories,
    filteredFiles,
    handleDelete,
    handleUpdate,
  } = useKnowledgeFiles()

  const tabsRef = useRef(null)

  useHorizontalDragScroll(tabsRef)

  /* ========================================
     STABLE CATEGORIES (OPTIMIZED)
  ======================================== */
  const categories = useMemo(() => {
    return [
      { id: "all", name: "All Files" },
      ...dynamicCategories,
    ]
  }, [dynamicCategories])

  return (
    <div
      className="
        mx-auto
        flex
        h-full
        w-full
        max-w-[1500px]
        min-h-0
        flex-col
        gap-4
      "
    >
      {/* CATEGORY TABS */}
      <div className="relative">
        {/* LEFT FADE */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-10 bg-gradient-to-r from-[#0f1614] to-transparent" />

        {/* RIGHT FADE */}
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-10 bg-gradient-to-l from-[#0f1614] to-transparent" />

        {/* SCROLL CONTAINER */}
        <div
          ref={tabsRef}
          className="
            cursor-grab
            overflow-x-auto
            active:cursor-grabbing
            border-b
            border-[#24312b]
            pb-2
            select-none
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          <div className="flex min-w-max items-center gap-2 pr-6">
            {categories.map((category) => {
              const active = selectedCategory === category.id

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    relative
                    shrink-0
                    rounded-t-xl
                    px-4
                    py-2.5
                    text-[13px]
                    font-medium
                    whitespace-nowrap
                    transition-all
                    duration-200
                    ${
                      active
                        ? `
                          border
                          border-b-0
                          border-[#2d3b35]
                          bg-[#151d1b]
                          text-white
                        `
                        : `
                          text-[#7f948b]
                          hover:text-white
                        `
                    }
                  `}
                >
                  {category.name}

                  {active && (
                    <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#f5d547]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div
        className="
          flex
          min-h-0
          flex-1
          flex-col
          overflow-hidden
          rounded-[24px]
          border
          border-[#26332d]
          bg-[#121a18]
          shadow-[0_8px_32px_rgba(0,0,0,0.24)]
        "
      >
        {/* TOP BAR */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#24312b] px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Knowledge Files
            </h2>

            <p className="mt-0.5 text-xs text-[#7f948b]">
              {filteredFiles.length} document(s) available
            </p>
          </div>

          {/* SEARCH */}
          <div className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-[#2d3b35] bg-[#18211f] px-3.5 sm:w-[300px]">
            <Search className="h-4 w-4 shrink-0 text-[#70847b]" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#70847b]"
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="min-h-0 flex-1 overflow-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <LoadingSpinner label="Loading files..." />
            </div>
          ) : (
            <FileTable
              files={filteredFiles}
              categories={allCategories}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default KnowledgeFilesSection