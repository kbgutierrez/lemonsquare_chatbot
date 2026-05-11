import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Search,
} from "lucide-react"

import {
  categories,
} from "../data/categories.js"

import CategoryList from "./CategoryList.jsx"
import FileTable from "./FileTable.jsx"

const API_URL =
  "http://localhost:8000/api/documents"

const KnowledgeFilesSection =
  () => {

    const [
      selectedCategory,
      setSelectedCategory,
    ] = useState("all")

    const [files, setFiles] =
      useState([])

    const [loading, setLoading] =
      useState(true)

    const [search, setSearch] =
      useState("")

    /* LOAD FILES */
    useEffect(() => {

      const loadFiles =
        async () => {

          try {

            setLoading(true)

            const response =
              await fetch(
                API_URL
              )

            if (
              !response.ok
            ) {

              throw new Error(
                "Failed to load documents"
              )
            }

            const data =
              await response.json()

            console.log(
              "DOCUMENTS",
              data
            )

            setFiles(data)

          } catch (error) {

            console.error(
              "LOAD_DOCUMENTS_ERROR",
              error
            )

          } finally {

            setLoading(false)
          }
        }

      loadFiles()

    }, [])

    /* TOGGLE ACTIVE */
    const toggleFile =
      async (
        documentId,
        currentState
      ) => {

        try {

          await fetch(
            `${API_URL}/${documentId}`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    is_active:
                      !currentState,
                  }
                ),
            }
          )

          setFiles(
            (prev) =>
              prev.map(
                (file) =>
                  file.document_id ===
                  documentId
                    ? {
                        ...file,
                        is_active:
                          !currentState,
                      }
                    : file
              )
          )

        } catch (error) {

          console.error(
            "TOGGLE_FILE_ERROR",
            error
          )
        }
      }

    /* DELETE */
    const deleteFile =
      async (
        documentId
      ) => {

        const confirmed =
          window.confirm(
            "Delete this document?"
          )

        if (!confirmed)
          return

        try {

          const response =
            await fetch(
              `${API_URL}/${documentId}`,
              {
                method:
                  "DELETE",
              }
            )

          if (
            !response.ok
          ) {

            throw new Error(
              "Failed to delete document"
            )
          }

          /* REMOVE FROM UI */
          setFiles(
            (prev) =>
              prev.filter(
                (file) =>
                  file.document_id !==
                  documentId
              )
          )

          console.log(
            "DOCUMENT_DELETED",
            documentId
          )

        } catch (error) {

          console.error(
            "DELETE_DOCUMENT_ERROR",
            error
          )
        }
      }

    /* FILTER */
    const filteredFiles =
      useMemo(
        () => {

          return files.filter(
            (file) => {

              const matchesCategory =
                selectedCategory ===
                  "all" ||
                file.category ===
                  selectedCategory

              const matchesSearch =
                file.file_name
                  ?.toLowerCase()
                  .includes(
                    search.toLowerCase()
                  )

              return (
                matchesCategory &&
                matchesSearch
              )
            }
          )
        },

        [
          files,
          selectedCategory,
          search,
        ]
      )

    const activeCategory =
      categories.find(
        (item) =>
          item.id ===
          selectedCategory
      )

    return (
      <div
        className="
          flex
          h-full
          flex-col
          gap-4
        "
      >
        {/* HEADER */}
        <div>
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.2em]
              text-violet-500
            "
          >
            Knowledge Files
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-bold
              text-violet-900
            "
          >
            {activeCategory
              ?.name ||
              "All Files"}
          </h2>
        </div>

        {/* MAIN */}
        <div
          className="
            grid
            flex-1
            gap-4
            overflow-hidden

            lg:grid-cols-[220px_1fr]
          "
        >
          {/* SIDEBAR */}
          <div
            className="
              overflow-hidden

              rounded-2xl

              border
              border-violet-100

              bg-white
            "
          >
            <CategoryList
              categories={[
                {
                  id: "all",
                  name:
                    "All Files",
                },

                ...categories,
              ]}

              selectedCategory={
                selectedCategory
              }

              onSelectCategory={
                setSelectedCategory
              }
            />
          </div>

          {/* TABLE */}
          <div
            className="
              flex
              flex-col
              overflow-hidden

              rounded-2xl

              border
              border-violet-100

              bg-white
            "
          >
            {/* TOP */}
            <div
              className="
                flex
                flex-wrap
                items-center
                justify-between
                gap-3

                border-b
                border-violet-100

                px-4
                py-3
              "
            >
              <div>
                <h3
                  className="
                    text-sm
                    font-semibold
                    text-violet-900
                  "
                >
                  Files
                </h3>

                <p
                  className="
                    text-xs
                    text-violet-500
                  "
                >
                  {
                    filteredFiles.length
                  }{" "}
                  files
                </p>
              </div>

              {/* SEARCH */}
              <div
                className="
                  flex
                  items-center
                  gap-2

                  rounded-xl

                  border
                  border-violet-200

                  bg-violet-50

                  px-3
                  py-2
                "
              >
                <Search
                  className="
                    h-4
                    w-4
                    text-violet-400
                  "
                />

                <input
                  value={search}

                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }

                  placeholder="Search files..."

                  className="
                    bg-transparent

                    text-sm

                    outline-none

                    placeholder:text-violet-400
                  "
                />
              </div>
            </div>

            {/* CONTENT */}
            <div
              className="
                flex-1
                overflow-auto

                p-3
              "
            >
              {loading ? (
                <div
                  className="
                    flex
                    h-full
                    items-center
                    justify-center

                    text-sm
                    text-violet-500
                  "
                >
                  Loading files...
                </div>
              ) : (
                <FileTable
                  files={
                    filteredFiles
                  }

                  onToggleFile={
                    toggleFile
                  }

                  onDeleteFile={
                    deleteFile
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

export default KnowledgeFilesSection