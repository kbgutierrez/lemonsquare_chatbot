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
              rounded-[30px]

              border
              border-[#24312b]

              bg-[#101715]

              p-2

              shadow-[0_10px_30px_rgba(0,0,0,0.22)]
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
                      py-5

                      transition-all
                      duration-300

                      ${
                        active

                          ? `
                            border-[#314136]

                            bg-[#16211d]

                            shadow-[0_10px_30px_rgba(0,0,0,0.28)]
                          `

                          : `
                            border-transparent

                            bg-transparent

                            hover:bg-[#141c19]
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

                        bg-[#f5d547]

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
                          h-9
                          w-9
                          items-center
                          justify-center

                          rounded-xl

                          border

                          transition-all
                          duration-300

                          ${
                            active

                              ? `
                                border-[#95c11f]/20

                                bg-[#95c11f]/10

                                text-[#dff7a3]
                              `

                              : `
                                border-[#26332d]

                                bg-[#141c19]

                                text-[#7f948b]

                                group-hover:text-white
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
                                ? "text-white"
                                : "text-[#8ca29a] group-hover:text-white"
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
                                ? "text-[#c8d6d0]"
                                : "text-[#5f746c]"
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
            from-[#0f1614]
            via-[#0f1614]
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
            from-[#0f1614]
            via-[#0f1614]
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
            border-[#2d3b35]

            bg-[#18211f]/95

            text-[#8ca097]

            backdrop-blur-sm

            transition-all
            duration-200

            hover:text-white
            hover:bg-[#202b27]
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
            border-[#2d3b35]

            bg-[#18211f]/95

            text-[#8ca097]

            backdrop-blur-sm

            transition-all
            duration-200

            hover:text-white
            hover:bg-[#202b27]
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
            border-[#24312b]

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
                      <div
                        className="
                          absolute
                          bottom-0
                          left-0

                          h-[2px]
                          w-full

                          bg-[#f5d547]
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
        <div
          className="
            flex
            shrink-0
            flex-wrap
            items-center
            justify-between
            gap-3

            border-b
            border-[#24312b]

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
                text-white
              "
            >
              Knowledge Files
            </h2>

            <p
              className="
                mt-0.5

                text-xs

                text-[#7f948b]
              "
            >
              {filteredFiles.length} document(s)
              in{" "}
              <span
                className="
                  capitalize
                  text-[#f5d547]
                "
              >
                {selectedStatus}
              </span>
            </p>
          </div>

          {/* SEARCH */}
          <div
            className="
              flex
              h-11
              w-full
              items-center
              gap-2.5

              rounded-xl

              border
              border-[#2d3b35]

              bg-[#18211f]

              px-3.5

              sm:w-[300px]
            "
          >
            <Search
              className="
                h-4
                w-4
                shrink-0

                text-[#70847b]
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
                text-white

                outline-none

                placeholder:text-[#70847b]
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