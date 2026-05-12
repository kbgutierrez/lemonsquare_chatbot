import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Search,
} from "lucide-react"

import {
  API_CONFIG,
} from "../../../config/sqlVariables"

import {
  categories,
} from "../../data/categories.js"

import FileTable from "./FileTable.jsx"

const API_URL =
  `${API_CONFIG.BASE_URL}/documents`

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

          setFiles(
            (prev) =>
              prev.filter(
                (file) =>
                  file.document_id !==
                  documentId
              )
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

          gap-5
        "
      >
        {/* TOP CATEGORY TABS */}
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2

            border-b
            border-[#24312b]

            pb-3
          "
        >
          {[
            {
              id: "all",
              name:
                "All Files",
            },

            ...categories,
          ].map((category) => {

            const active =
              selectedCategory ===
              category.id

            return (
              <button
                key={
                  category.id
                }

                onClick={() =>
                  setSelectedCategory(
                    category.id
                  )
                }

                className={`
                  relative

                  rounded-t-2xl

                  px-5
                  py-3

                  text-sm
                  font-medium

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
          })}
        </div>

        {/* TABLE CONTAINER */}
        <div
          className="
            flex
            min-h-0
            flex-1
            flex-col

            overflow-hidden

            rounded-[28px]

            border
            border-[#26332d]

            bg-[#121a18]

            shadow-[0_10px_40px_rgba(0,0,0,0.28)]
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

              gap-4

              border-b
              border-[#24312b]

              px-5
              py-4
            "
          >
            {/* LEFT */}
            <div>
              <h2
                className="
                  text-xl
                  font-semibold

                  tracking-tight

                  text-white
                "
              >
                Knowledge Files
              </h2>

              <p
                className="
                  mt-1

                  text-sm

                  text-[#7f948b]
                "
              >
                {
                  filteredFiles.length
                }{" "}
                document(s)
                available
              </p>
            </div>

            {/* SEARCH */}
            <div
              className="
                flex
                w-full
                items-center
                gap-3

                rounded-2xl

                border
                border-[#2d3b35]

                bg-[#18211f]

                px-4
                py-3

                sm:w-[340px]
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
                <div className="text-center">
                  <div
                    className="
                      mx-auto
                      mb-4

                      h-10
                      w-10

                      rounded-full

                      border-2
                      border-[#f5d547]/20
                      border-t-[#f5d547]

                      animate-spin
                    "
                  />

                  <p
                    className="
                      text-sm

                      text-[#8ea59b]
                    "
                  >
                    Loading files...
                  </p>
                </div>
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
    )
  }

export default KnowledgeFilesSection