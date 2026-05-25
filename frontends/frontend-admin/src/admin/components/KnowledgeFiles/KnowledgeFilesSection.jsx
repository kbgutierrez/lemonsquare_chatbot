import {
  useMemo,
  useRef,
} from "react"

import {
  ChevronLeft,
  ChevronRight,
  Database,
  Search,
} from "lucide-react"

import FileTable
  from "./FileTable"

import {
  useKnowledgeFiles,
} from "./hooks/useKnowledgeFiles"

import {
  useHorizontalDragScroll,
} from "../../../shared/hooks/useHorizontalDragScroll"

import LoadingSpinner
  from "../../../shared/components/LoadingSpinner"

const STATUS_TABS = [
  {
    id: "active",
    label: "Active",
  },
  {
    id: "inactive",
    label: "Inactive",
  },
]

const KnowledgeFilesSection = () => {

  const {
    loading,

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

  /* ========================================
     REFS
  ======================================== */

  const tabsRef =
    useRef(null)

  const statusTabsRef =
    useRef(null)

  useHorizontalDragScroll(
    tabsRef
  )

  useHorizontalDragScroll(
    statusTabsRef
  )

  /* ========================================
     CATEGORY TABS
  ======================================== */

  const categories =
    useMemo(() => {

      return [
        {
          id: "all",
          name: "All Files",
        },

        ...dynamicCategories,
      ]

    }, [dynamicCategories])

  /* ========================================
     SCROLL HELPERS
  ======================================== */

  const scrollTabs =
    (direction) => {

      if (!tabsRef.current) {
        return
      }

      tabsRef.current.scrollBy({
        left:
          direction === "left"
            ? -220
            : 220,

        behavior: "smooth",
      })
    }

  const scrollStatusTabs =
    (direction) => {

      if (!statusTabsRef.current) {
        return
      }

      statusTabsRef.current.scrollBy({
        left:
          direction === "left"
            ? -180
            : 180,

        behavior: "smooth",
      })
    }

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
      {/* ========================================
                  STATUS TABS
      ======================================== */}

      <div
        className="
          panel-base

          rounded-[30px]

          p-2
        "
      >
        <div
          className="
            grid
            grid-cols-2
            gap-2
          "
        >
          {STATUS_TABS.map((tab) => {

            const active =
              selectedStatus ===
              tab.id

            return (
              <button
                key={tab.id}

                onClick={() =>
                  setSelectedStatus(
                    tab.id
                  )
                }

                className={`
                  group

                  relative

                  overflow-hidden

                  rounded-[22px]

                  border

                  px-5
                  py-3

                  transition-all
                  duration-300

                  ${
                    active

                      ? `
                        theme-border

                        muted-card

                        shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                      `

                      : `
                        border-transparent

                        bg-transparent

                        hover-surface
                      `
                  }
                `}
              >
                {/* ACTIVE GLOW */}
                {active && (
                  <div
                    className="
                      absolute
                      inset-0

                      bg-[radial-gradient(circle_at_top,rgba(149,193,31,0.08),transparent_70%)]
                    "
                  />
                )}

                {/* ACTIVE INDICATOR */}
                <div
                  className={`
                    absolute

                    bottom-0
                    left-1/2

                    h-[3px]
                    w-[55%]

                    -translate-x-1/2

                    rounded-full

                    bg-[var(--accent)]

                    transition-all
                    duration-300

                    ${
                      active
                        ? "opacity-100"
                        : "opacity-0"
                    }
                  `}
                />

                {/* CONTENT */}
                <div
                  className="
                    relative
                    z-10

                    flex
                    items-center
                    justify-center
                    gap-2.5
                  "
                >
                  <div
                    className={`
                      flex
                      h-6
                      w-6
                      items-center
                      justify-center

                      rounded-xl

                      border

                      transition-all
                      duration-300

                      ${
                        active

                          ? `
                            border-[var(--accent-green)]

                            bg-[color:rgba(149,193,31,0.10)]

                            text-[var(--text-primary)]
                          `

                          : `
                            theme-border

                            theme-panel-light

                            text-[var(--text-secondary)]

                            group-hover:text-[var(--text-primary)]
                          `
                      }
                    `}
                  >
                    <Database
                      className="
                        h-4
                        w-4
                      "
                    />
                  </div>

                  <div
                    className="
                      flex
                      flex-col
                      items-start
                    "
                  >
                    <span
                      className={`
                        text-sm
                        font-semibold

                        transition-colors
                        duration-300

                        ${
                          active
                            ? "text-[var(--text-primary)]"
                            : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                        }
                      `}
                    >
                      {tab.label}
                    </span>

                    <span
                      className={`
                        text-[11px]

                        transition-colors
                        duration-300

                        ${
                          active
                            ? "text-[var(--text-secondary)]"
                            : "text-[var(--text-muted)]"
                        }
                      `}
                    >

                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================
          CATEGORY TABS
      ======================================== */}

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
            from-[var(--background)]
            via-[var(--background)]
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
            from-[var(--background)]
            via-[var(--background)]
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

            theme-panel-light

            text-[var(--text-secondary)]

            backdrop-blur-sm

            transition-all
            duration-200

            hover:bg-[var(--hover)]
            hover:text-[var(--text-primary)]
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

            theme-panel-light

            text-[var(--text-secondary)]

            backdrop-blur-sm

            transition-all
            duration-200

            hover:bg-[var(--hover)]
            hover:text-[var(--text-primary)]
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

            active:cursor-grabbing

            select-none

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
                  selectedCategory ===
                  category.id

                return (
                  <button
                    key={category.id}

                    onClick={() =>
                      setSelectedCategory(
                        category.id
                      )
                    }

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

                            theme-panel-light

                            text-[var(--text-primary)]
                          `

                          : `
                            text-[var(--text-secondary)]

                            hover:text-[var(--text-primary)]
                          `
                      }
                    `}
                  >
                    {category.name}

                    {active && (
                      <div
                        className="
                          absolute
                          bottom-0
                          left-0

                          h-[2px]
                          w-full

                          bg-[var(--accent)]
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

      {/* ========================================
          TABLE CONTAINER
      ======================================== */}

      <div
        className="
          panel-base

          flex
          min-h-0
          flex-1
          flex-col

          overflow-hidden

          rounded-[24px]
        "
      >
        {/* TOP BAR */}
        <div
          className="
            flex
            shrink-0
            flex-wrap
            items-center
            justify-between
            gap-3

            border-b
            theme-border

            px-4
            py-3
          "
        >
          <div>
            <h2
              className="
                text-lg
                font-semibold
                tracking-tight

                text-[var(--text-primary)]
              "
            >
              Knowledge Files
            </h2>

            <p
              className="
                mt-0.5

                text-xs

                text-[var(--text-secondary)]
              "
            >
              {filteredFiles.length} document(s)
              in{" "}
              <span
                className="
                  capitalize

                  text-[var(--accent)]
                "
              >
                {selectedStatus}
              </span>
            </p>
          </div>

          {/* SEARCH */}
          <div
            className="
              theme-panel-light

              flex
              h-11
              w-full
              items-center
              gap-2.5

              rounded-xl

              border
              theme-border

              px-3.5

              sm:w-[300px]
            "
          >
            <Search
              className="
                h-4
                w-4
                shrink-0

                text-[var(--text-muted)]
              "
            />

            <input
              value={search}

              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }

              placeholder={`
Search ${selectedStatus} files...
              `}

              className="
                w-full

                bg-transparent

                text-sm

                text-[var(--text-primary)]

                outline-none

                placeholder:text-[var(--placeholder)]
              "
            />
          </div>
        </div>

        {/* CONTENT */}
        <div
          className="
            min-h-0
            flex-1

            overflow-auto

            p-4

            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {loading ? (
            <div
              className="
                flex
                h-full
                items-center
                justify-center
              "
            >
              <LoadingSpinner
                label="Loading files..."
              />
            </div>
          ) : (
            <FileTable
              files={filteredFiles}

              categories={
                allCategories
              }

              onDelete={
                handleDelete
              }

              onRestore={
                handleRestore
              }

              onUpdate={
                handleUpdate
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default KnowledgeFilesSection