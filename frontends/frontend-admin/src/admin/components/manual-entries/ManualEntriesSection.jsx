import { useState, useCallback, memo } from "react"
import { Database, DatabaseBackup, RefreshCw } from "lucide-react"
import useManualEntries from "./hooks/useManualEntries"
import ManualEntriesHeader from "./components/ManualEntriesHeader"
import ManualEntryTabs from "./components/ManualEntryTabs"
import ManualEntryCard from "./components/ManualEntryCard"
import ManualEntriesPagination from "./components/ManualEntriesPagination"
import ManualEntryModal from "./components/ManualEntryModal"
import EmptyState from "../../../shared/components/EmptyState"
import ErrorState from "../../../shared/components/ErrorState"
import LoadingSpinner from "../../../shared/components/LoadingSpinner"

const STATUS_TABS = [
  { id: "active", label: "Active", icon: Database },
  { id: "inactive", label: "Inactive", icon: DatabaseBackup },
]

const ManualEntriesSection = () => {
  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

  const {
    items,
    loading,
    refreshing,
    submitting,
    error,
    successMessage,
    isStatusStale,
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
    handleHardDeleteEntry,
    handleRestoreEntry,
    reloadEntries,
    setEditingState,
  } = useManualEntries()

  const openCreateModal = useCallback(() => {
    setEditingState(true)
    setEditingEntry(null)
    setShowModal(true)
  }, [setEditingState])

  const openEditModal = useCallback((item) => {
    setEditingState(true)
    setEditingEntry(item)
    setShowModal(true)
  }, [setEditingState])

  const closeModal = useCallback(() => {
    setEditingState(false)
    setShowModal(false)
  }, [setEditingState])

  const handleRefresh = useCallback(async () => {
    await reloadEntries(true)
  }, [reloadEntries])

  const showSpinner = loading || isStatusStale

  return (
    <div className="flex h-full flex-col gap-5">
      {/* HEADER + REFRESH */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <ManualEntriesHeader
            search={search}
            setSearch={setSearch}
            setShowModal={openCreateModal}
          />
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="group flex w-full items-center justify-center gap-2 rounded-md border theme-border bg-[var(--panel)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-all duration-300 hover:bg-[var(--hover)] disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto lg:min-w-[170px]"
        >
          <RefreshCw
            className={`h-4 w-4 transition-transform duration-500 ${
              refreshing || loading ? "animate-spin" : "group-hover:rotate-180"
            }`}
          />
          <span>{refreshing || loading ? "Refreshing..." : "Refresh Entries"}</span>
        </button>
      </div>

      {/* STATUS TABS — flat text tabs, no card */}
      <div className="flex items-center gap-8 border-b theme-border px-4">
        {STATUS_TABS.map((tab) => {
          const active = activityFilter === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => setActivityFilter(tab.id)}
              className={`relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors duration-200 ${
                active
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  active
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-muted)]"
                }`}
              />

              {tab.label}

              {active && (
                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[var(--accent)]" />
              )}
            </button>
          )
        })}
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
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
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
      <div
        key={activityFilter}
        className="flex-1 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {showSpinner ? (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner label="Loading manual entries..." />
          </div>
        ) : paginatedItems.length === 0 ? (
          <EmptyState
            title="No manual entries"
            message="No manual knowledge entries are currently available."
          />
        ) : (
          <div className="flex flex-col">
            {paginatedItems.map((item) => (
              <ManualEntryCard
                key={item.id}
                item={item}
                submitting={submitting}
                allowedCategories={allowedCategories}
                handleUpdateEntry={handleUpdateEntry}
                handleDeleteEntry={handleDeleteEntry}
                handleHardDeleteEntry={handleHardDeleteEntry}
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
        setShowModal={closeModal}
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

export default memo(ManualEntriesSection)