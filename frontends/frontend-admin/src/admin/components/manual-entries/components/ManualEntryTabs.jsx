import { useRef } from "react"

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const ManualEntryTabs = ({
  categories,
  activeCategory,
  setActiveCategory,
  setPage,
}) => {

  const tabsRef = useRef(null)

  /* ========================================
     SCROLL HANDLER
  ======================================== */

  const scrollTabs = (direction) => {

    if (!tabsRef.current) return

    const amount = 260

    tabsRef.current.scrollBy({
      left:
        direction === "left"
          ? -amount
          : amount,
      behavior: "smooth",
    })
  }

  return (
    <div className="relative">

      {/* LEFT SHADOW */}
      <div
        className="
          pointer-events-none

          absolute
          bottom-0
          left-0
          top-0

          z-10
          w-12

          bg-gradient-to-r
          from-[color:var(--background)]
          via-[color:var(--background)]
          to-transparent
        "
      />

      {/* RIGHT SHADOW */}
      <div
        className="
          pointer-events-none

          absolute
          bottom-0
          right-0
          top-0

          z-10
          w-12

          bg-gradient-to-l
          from-[color:var(--background)]
          via-[color:var(--background)]
          to-transparent
        "
      />

      {/* LEFT BUTTON */}
      <button
        onClick={() =>
          scrollTabs("left")
        }
        className="
          absolute
          left-1
          top-1/2
          z-20

          flex
          h-8
          w-8
          -translate-y-1/2
          items-center
          justify-center

          rounded-full

          border
          theme-border

          bg-[color:var(--panel)]/95

          text-[color:var(--text-secondary)]

          backdrop-blur-sm

          transition-all
          duration-200

          hover:bg-[color:var(--hover)]
          hover:text-[color:var(--text-primary)]
        "
      >
        <ChevronLeft
          className="h-4 w-4"
        />
      </button>

      {/* RIGHT BUTTON */}
      <button
        onClick={() =>
          scrollTabs("right")
        }
        className="
          absolute
          right-1
          top-1/2
          z-20

          flex
          h-8
          w-8
          -translate-y-1/2
          items-center
          justify-center

          rounded-full

          border
          theme-border

          bg-[color:var(--panel)]/95

          text-[color:var(--text-secondary)]

          backdrop-blur-sm

          transition-all
          duration-200

          hover:bg-[color:var(--hover)]
          hover:text-[color:var(--text-primary)]
        "
      >
        <ChevronRight
          className="h-4 w-4"
        />
      </button>

      {/* CATEGORY SCROLLER */}
      <div
        ref={tabsRef}
        className="
          cursor-grab

          overflow-x-auto

          border-b
          theme-border

          px-12
          pb-2

          select-none

          active:cursor-grabbing

          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        <div
          className="
            flex
            min-w-max
            items-center
            gap-2
            pr-6
          "
        >
          {categories.map(
            (category) => {

              const active =
                activeCategory ===
                category

              return (
                <button
                  key={category}
                  onClick={() => {

                    setActiveCategory(
                      category
                    )

                    setPage(1)
                  }}
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

                          theme-border

                          bg-[color:var(--panel-light)]

                          text-[color:var(--text-primary)]
                        `
                        : `
                          text-[color:var(--text-muted)]

                          hover:text-[color:var(--text-primary)]
                        `
                    }
                  `}
                >
                  {category}

                  {active && (
                    <div
                      className="
                        absolute
                        bottom-0
                        left-0

                        h-[2px]
                        w-full

                        bg-[color:var(--accent)]
                      "
                    />
                  )}
                </button>
              )
            }
          )}
        </div>
      </div>
    </div>
  )
}

export default ManualEntryTabs