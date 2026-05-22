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
     COUNTS
  ======================================== */

  const activeCount =
    items.filter(
      (item) =>
        item.is_active
    ).length

  const inactiveCount =
    items.filter(
      (item) =>
        !item.is_active
    ).length

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
    <div className="flex h-full flex-col gap-5">

      {/* HEADER */}
      <ManualEntriesHeader
        search={search}
        setSearch={setSearch}
        setShowModal={openCreateModal}
      />

      {/* ========================================
          ACTIVE / INACTIVE FILTER
      ======================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-4

          lg:grid-cols-2
        "
      >

        {/* ACTIVE */}
        <button
          onClick={() =>
            setActivityFilter(
              "active"
            )
          }
          className={`
            group
            relative

            overflow-hidden

            rounded-[28px]
            border

            p-5

            text-left

            transition-all
            duration-300

            ${
              activityFilter ===
              "active"

                ? `
                  border-[#95c11f]/30
                  bg-[#1b2418]
                `

                : `
                  border-[#26332d]
                  bg-[#151d1b]

                  hover:border-[#3a4a43]
                `
            }
          `}
        >

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
                activityFilter ===
                "active"

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
              justify-between
              gap-4
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className={`
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center

                  rounded-2xl

                  border

                  transition-all
                  duration-300

                  ${
                    activityFilter ===
                    "active"

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
                    h-5
                    w-5
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
                    text-base
                    font-semibold

                    transition-colors
                    duration-300

                    ${
                      activityFilter ===
                      "active"

                        ? "text-white"

                        : "text-[#8ca29a] group-hover:text-white"
                    }
                  `}
                >
                  Active Entries
                </span>

                <span
                  className={`
                    text-xs

                    transition-colors
                    duration-300

                    ${
                      activityFilter ===
                      "active"

                        ? "text-[#c8d6d0]"

                        : "text-[#5f746c]"
                    }
                  `}
                >
                  Currently indexed in Qdrant
                </span>

              </div>
            </div>

            <div
              className="
                rounded-2xl
                border
                border-[#95c11f]/20
                bg-[#95c11f]/10

                px-4
                py-2

                text-xl
                font-bold
                text-[#dff7a3]
              "
            >
              {activeCount}
            </div>

          </div>
        </button>

        {/* INACTIVE */}
        <button
          onClick={() =>
            setActivityFilter(
              "inactive"
            )
          }
          className={`
            group
            relative

            overflow-hidden

            rounded-[28px]
            border

            p-5

            text-left

            transition-all
            duration-300

            ${
              activityFilter ===
              "inactive"

                ? `
                  border-red-500/20
                  bg-[#241818]
                `

                : `
                  border-[#26332d]
                  bg-[#151d1b]

                  hover:border-[#3a4a43]
                `
            }
          `}
        >

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

              bg-red-400

              transition-all
              duration-300

              ${
                activityFilter ===
                "inactive"

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
              justify-between
              gap-4
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className={`
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center

                  rounded-2xl

                  border

                  transition-all
                  duration-300

                  ${
                    activityFilter ===
                    "inactive"

                      ? `
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
                <DatabaseBackup
                  className="
                    h-5
                    w-5
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
                    text-base
                    font-semibold

                    transition-colors
                    duration-300

                    ${
                      activityFilter ===
                      "inactive"

                        ? "text-white"

                        : "text-[#8ca29a] group-hover:text-white"
                    }
                  `}
                >
                  Inactive Entries
                </span>

                <span
                  className={`
                    text-xs

                    transition-colors
                    duration-300

                    ${
                      activityFilter ===
                      "inactive"

                        ? "text-[#d8bcbc]"

                        : "text-[#5f746c]"
                    }
                  `}
                >
                  Removed from Qdrant retrieval
                </span>

              </div>
            </div>

            <div
              className="
                rounded-2xl
                border
                border-red-500/20
                bg-red-500/10

                px-4
                py-2

                text-xl
                font-bold
                text-red-300
              "
            >
              {inactiveCount}
            </div>

          </div>
        </button>
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