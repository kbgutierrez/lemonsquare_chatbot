import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const ManualEntryTabs = ({
  categories,
  activeCategory,
  setActiveCategory,
  setPage,
}) => {
  const tabsRef = useRef(null)

  const scrollTabs = (direction) => {
    if (!tabsRef.current) return
    const amount = 260
    tabsRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    })
  }

  return (
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
        className="cursor-grab overflow-x-auto border-b theme-border px-12 pb-0 select-none active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex min-w-max items-center gap-1 pr-6">
          {categories.map((category) => {
            const active = activeCategory === category
            return (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category)
                  setPage(1)
                }}
                className={`relative shrink-0 px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-200 ${
                  active
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {category}
                {active && (
                  <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[var(--accent)]" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ManualEntryTabs