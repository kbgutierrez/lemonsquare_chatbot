import { useMemo, useRef } from "react"
import { ChevronLeft, ChevronRight, Database, Search } from "lucide-react"
import FileTable from "./FileTable"
import { useKnowledgeFiles } from "./hooks/useKnowledgeFiles"
import { useHorizontalDragScroll } from "../../../shared/hooks/useHorizontalDragScroll"
import LoadingSpinner from "../../../shared/components/LoadingSpinner"

const STATUS_TABS = [
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
]

const KnowledgeFilesSection = () => {
  const {
    loading,
    isStatusStale,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    dynamicCategories,
    allCategories,
    filteredFiles,
    handleDelete,
    handleRestore,
    handleUpdate,
  } = useKnowledgeFiles()

  const tabsRef = useRef(null)
  useHorizontalDragScroll(tabsRef)

  const categories = useMemo(() => {
    return [{ id: "all", name: "All Files" }, ...dynamicCategories]
  }, [dynamicCategories])

  const scrollTabs = (direction) => {
    if (!tabsRef.current) return
    tabsRef.current.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    })
  }

  const showSpinner = loading || isStatusStale

  return (
    <div className="mx-auto flex h-full w-full max-w-[1500px] min-h-0 flex-col gap-6">
      {/* STATUS TABS */}
      <div className="flex items-center gap-8 border-b theme-border px-4">
        {STATUS_TABS.map((tab) => {
          const active = selectedStatus === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`relative pb-3 text-sm font-medium transition-colors duration-200 ${
                active
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {tab.label}
              {active && (
                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[var(--accent)]" />
              )}
            </button>
          )
        })}
      </div>

      {/* CATEGORY TABS */}
      <div className="relative">
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-12 bg-gradient-to-r from-[var(--background)] via-[var(--background)] to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-gradient-to-l from-[var(--background)] via-[var(--background)] to-transparent" />

        <button
          onClick={() => scrollTabs("left")}
          className="absolute left-1 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => scrollTabs("right")}
          className="absolute right-1 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div
          ref={tabsRef}
          className="cursor-grab overflow-x-auto border-b theme-border px-12 pb-0 active:cursor-grabbing select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex min-w-max items-center gap-1 pr-6">
            {categories.map((category) => {
              const active = selectedCategory === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`relative shrink-0 px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-200 ${
                    active
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {category.name}
                  {active && (
                    <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[var(--accent)]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* TABLE AREA */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* TOP BAR */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              Knowledge Files
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              {showSpinner ? "—" : filteredFiles.length} document(s) in{" "}
              <span className="capitalize text-[var(--accent)]">{selectedStatus}</span>
            </p>
          </div>

          <div className="flex h-10 w-full items-center gap-2 border-b theme-border px-1 sm:w-[280px]">
            <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${selectedStatus} files...`}
              className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--placeholder)]"
            />
          </div>
        </div>

        {/* CONTENT — key forces remount + spinner blocks stale rows */}
        <div
          key={selectedStatus}
          className="min-h-0 flex-1 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {showSpinner ? (
            <div className="flex h-full items-center justify-center">
              <LoadingSpinner label="Loading files..." />
            </div>
          ) : (
            <FileTable
              files={filteredFiles}
              categories={allCategories}
              onDelete={handleDelete}
              onRestore={handleRestore}
              onUpdate={handleUpdate}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default KnowledgeFilesSection