import {
  useState,
} from "react"

import useManualEntries
  from "./hooks/useManualEntries"

import ManualEntriesHeader
  from "./components/ManualEntriesHeader"

import ManualEntryTabs
  from "./components/ManualEntryTabs"

import ManualEntryCard
  from "./components/ManualEntryCard"

import ManualEntriesPagination
  from "./components/ManualEntriesPagination"

import ManualEntryModal
  from "./components/ManualEntryModal"

import EmptyState
  from "../../../shared/components/EmptyState"

import ErrorState
  from "../../../shared/components/ErrorState"

import LoadingSpinner
  from "../../../shared/components/LoadingSpinner"

const ManualEntriesSection =
  () => {

    const [
      showModal,
      setShowModal,
    ] = useState(false)

    const [
      editingEntry,
      setEditingEntry,
    ] = useState(null)

    const {
      loading,
      submitting,
      error,
      successMessage,

      search,
      setSearch,

      page,
      setPage,

      categories,

      activeCategory,
      setActiveCategory,

      paginatedItems,

      totalPages,

      handleCreateEntry,
      handleUpdateEntry,
      handleDeleteEntry,
    } =
      useManualEntries()

    /* ========================================
       OPEN CREATE MODAL
    ======================================== */

    const openCreateModal =
      () => {

        setEditingEntry(
          null
        )

        setShowModal(
          true
        )
      }

    /* ========================================
       OPEN EDIT MODAL
    ======================================== */

    const openEditModal =
      (item) => {

        console.log(
          "OPEN_EDIT_MODAL_ITEM",
          item
        )

        setEditingEntry(
          item
        )

        setShowModal(
          true
        )
      }

    return (
      <div className="flex h-full flex-col gap-5">

        {/* HEADER */}
        <ManualEntriesHeader
          search={search}
          setSearch={
            setSearch
          }
          setShowModal={
            openCreateModal
          }
        />

        {/* CATEGORY TABS */}
        <ManualEntryTabs
          categories={
            categories
          }
          activeCategory={
            activeCategory
          }
          setActiveCategory={
            setActiveCategory
          }
          setPage={
            setPage
          }
        />

        {/* SUCCESS */}
        {successMessage && (
          <div
            className="
              rounded-2xl
              border
              border-emerald-500/20
              bg-emerald-500/10
              px-4
              py-3
              text-sm
              text-emerald-300
            "
          >
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
          className="
            flex-1
            overflow-auto
            rounded-[28px]
            border
            border-[#26332d]
            bg-[#121a18]
            p-5
          "
        >

          {loading ? (

            <LoadingSpinner
              label="Loading manual entries..."
            />

          ) : paginatedItems.length ===
            0 ? (

            <EmptyState
              title="No manual entries"
              message="
No manual knowledge entries are currently available.
              "
            />

          ) : (

            <div className="grid gap-4">

              {paginatedItems.map(
                (item) => (

                  <ManualEntryCard
                    key={
                      item.id
                    }

                    item={item}

                    submitting={
                      submitting
                    }

                    handleUpdateEntry={
                      handleUpdateEntry
                    }

                    handleDeleteEntry={
                      handleDeleteEntry
                    }

                    openEditModal={
                      openEditModal
                    }
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <ManualEntriesPagination
          page={page}
          setPage={
            setPage
          }
          totalPages={
            totalPages
          }
        />

        {/* MODAL */}
        <ManualEntryModal
          showModal={
            showModal
          }

          setShowModal={
            setShowModal
          }

          categories={
            categories
          }

          submitting={
            submitting
          }

          error={error}

          handleCreateEntry={
            handleCreateEntry
          }

          handleUpdateEntry={
            handleUpdateEntry
          }

          handleDeleteEntry={
            handleDeleteEntry
          }

          editingEntry={
            editingEntry
          }
        />
      </div>
    )
  }

export default ManualEntriesSection