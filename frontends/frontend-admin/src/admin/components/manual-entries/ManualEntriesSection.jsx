import {
  useState,
  useCallback,
  memo,
} from "react"

import {
  Database,
  DatabaseBackup,
} from "lucide-react"

import useManualEntries from "./hooks/useManualEntries"

import ManualEntriesHeader from "./components/ManualEntriesHeader"
import ManualEntryTabs from "./components/ManualEntryTabs"
import ManualEntryCard from "./components/ManualEntryCard"
import ManualEntriesPagination from "./components/ManualEntriesPagination"
import ManualEntryModal from "./components/ManualEntryModal"

import EmptyState from "../../../shared/components/EmptyState"
import ErrorState from "../../../shared/components/ErrorState"
import LoadingSpinner from "../../../shared/components/LoadingSpinner"

/* ========================================
   MAIN SECTION
======================================== */

const ManualEntriesSection = () => {

  const [
    showModal,
    setShowModal,
  ] = useState(false)

  const [
    editingEntry,
    setEditingEntry,
  ] = useState(null)

  const {
    items,

    loading,
    submitting,
    error,
    successMessage,

    search,
    setSearch,

    page,
    setPage,

    categories,
    allowedCategories,

    activeCategory,
    setActiveCategory,

    activityFilter,
    setActivityFilter,

    paginatedItems,
    totalPages,

    handleCreateEntry,
    handleUpdateEntry,
    handleDeleteEntry,
    handleRestoreEntry,
  } = useManualEntries()

  /* ========================================
     STATUS TABS
  ======================================== */

  const STATUS_TABS = [
    {
      id: "active",
      label: "Active",
      icon: Database,
    },
    {
      id: "inactive",
      label: "Inactive",
      icon: DatabaseBackup,
    },
  ]

  /* ========================================
     MODAL HANDLERS
  ======================================== */

  const openCreateModal =
    useCallback(() => {

      setEditingEntry(null)

      setShowModal(true)

    }, [])

  const openEditModal =
    useCallback((item) => {

      setEditingEntry(item)

      setShowModal(true)

    }, [])

  return (
    <div className="flex h-full flex-col gap-3">

      {/* HEADER */}
      <ManualEntriesHeader
        search={search}
        setSearch={setSearch}
        setShowModal={openCreateModal}
      />

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
              activityFilter ===
              tab.id

            const Icon =
              tab.icon

            return (
              <button
                key={tab.id}

                onClick={() =>
                  setActivityFilter(
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

                      ? tab.id ===
                        "active"

                        ? `
                          border-[#314136]

                          bg-[#16211d]

                          shadow-[0_10px_30px_rgba(0,0,0,0.28)]
                        `

                        : `
                          border-red-500/20

                          bg-[#241818]

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
                    className={`
                      absolute
                      inset-0

                      ${
                        tab.id ===
                        "active"

                          ? `
                            bg-[radial-gradient(circle_at_top,rgba(149,193,31,0.08),transparent_70%)]
                          `

                          : `
                            bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.08),transparent_70%)]
                          `
                      }
                    `}
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

                    transition-all
                    duration-300

                    ${
                      tab.id ===
                      "active"

                        ? "bg-[#f5d547]"

                        : "bg-red-400"
                    }

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

                          ? tab.id ===
                            "active"

                            ? `
                              border-[#95c11f]/20

                              bg-[#95c11f]/10

                              text-[#dff7a3]
                            `

                            : `
                              border-red-500/20

                              bg-red-500/10

                              text-red-300
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
                    <Icon
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
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* CATEGORY TABS */}
      <ManualEntryTabs
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        setPage={setPage}
      />

      {/* SUCCESS */}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {successMessage}
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <ErrorState
          title="Manual Entries Error"
          message={error}
        />
      )}

      {/* CONTENT */}
      <div className="flex-1 overflow-auto rounded-[28px] border border-[#26332d] bg-[#121a18] p-5">

        {loading ? (
          <LoadingSpinner label="Loading manual entries..." />
        ) : paginatedItems.length === 0 ? (
          <EmptyState
            title="No manual entries"
            message="No manual knowledge entries are currently available."
          />
        ) : (
          <div className="grid gap-4">

            {paginatedItems.map((item) => (
              <ManualEntryCard
                key={item.id}
                item={item}
                submitting={submitting}
                allowedCategories={allowedCategories}
                handleUpdateEntry={handleUpdateEntry}
                handleDeleteEntry={handleDeleteEntry}
                handleRestoreEntry={handleRestoreEntry}
                openEditModal={openEditModal}
              />
            ))}

          </div>
        )}
      </div>

      {/* PAGINATION */}
      <ManualEntriesPagination
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />

      {/* MODAL */}
      <ManualEntryModal
        showModal={showModal}
        setShowModal={setShowModal}
        categories={categories}
        submitting={submitting}
        error={error}
        handleCreateEntry={handleCreateEntry}
        handleUpdateEntry={handleUpdateEntry}
        handleDeleteEntry={handleDeleteEntry}
        editingEntry={editingEntry}
      />
    </div>
  )
}

export default memo(
  ManualEntriesSection
)