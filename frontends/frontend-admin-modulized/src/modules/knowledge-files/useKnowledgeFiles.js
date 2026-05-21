import {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react"

import useLiveQuery
  from "../../shared/hooks/useLiveQuery.js"

import {
  useDebounce,
} from "../../shared/hooks/useDebounce.js"

import {
  usePagination,
} from "../../shared/hooks/usePagination.js"

const normalizeCategory =
  (value) => {

    return String(
      value ||
      "Uncategorized"
    ).trim()
  }

const parseAllowedCategories =
  (value) => {

    if (!value) {

      return []
    }

    return String(value)
      .split(",")
      .map((category) =>
        normalizeCategory(
          category
        )
      )
      .filter(Boolean)
  }

const normalizeFile =
  (file) => {

    return {
      ...file,

      document_id:
        file.document_id ||
        file.id ||
        file.file_id ||
        "",

      file_name:
        file.file_name ||
        file.filename ||
        file.name ||
        file.title ||
        "Unnamed File",

      category:
        normalizeCategory(
          file.category
        ),
    }
  }

export const useKnowledgeFiles =
  () => {

    const [
      query,
      setQuery,
    ] = useState("")

    const [
      selectedCategory,
      setSelectedCategory,
    ] = useState("all")

    const [
      files,
      setFiles,
    ] = useState([])

    const debouncedQuery =
      useDebounce(
        query,
        300
      )

    const {
      data,
      loading,
      error,
      refresh,
    } = useLiveQuery({
      queryKey:
        "knowledge_files",

      queryFn:
        async () => {

          const [
            documentsRes,
            settingsRes,
          ] = await Promise.all([
            fetch(
              "/api/documents",
              {
                headers: {
                  Accept:
                    "application/json",
                },
              }
            ),

            fetch(
              "/api/settings",
              {
                headers: {
                  Accept:
                    "application/json",
                },
              }
            ),
          ])

          if (
            !documentsRes.ok
          ) {

            throw new Error(
              await documentsRes.text()
            )
          }

          if (
            !settingsRes.ok
          ) {

            throw new Error(
              await settingsRes.text()
            )
          }

          const documentsJson =
            await documentsRes.json()

          const settingsJson =
            await settingsRes.json()

          return {
            documents:
              Array.isArray(
                documentsJson
              )
                ? documentsJson
                : [],

            settings:
              settingsJson || {},
          }
        },

      initialData: {
        documents: [],
        settings: {},
      },
    })

    /* ========================================
       SYNC FILES FROM API
    ======================================== */

    useEffect(() => {

      const incoming =
        Array.isArray(
          data?.documents
        )
          ? data.documents
          : []

      setFiles(
        incoming.map(
          normalizeFile
        )
      )

    }, [data])

    /* ========================================
       SETTINGS CATEGORIES
    ======================================== */

    const allowedCategories =
      useMemo(() => {

        return parseAllowedCategories(
          data?.settings
            ?.AllowedCategories
        )

      }, [data])

    /* ========================================
       CATEGORIES
    ======================================== */

    const categories =
      useMemo(() => {

        const unique =
          new Map()

        allowedCategories.forEach(
          (category) => {

            const normalized =
              normalizeCategory(
                category
              )

            unique.set(
              normalized.toLowerCase(),
              {
                id: normalized,
                name: normalized,
              }
            )
          }
        )

        files.forEach(
          (file) => {

            const normalized =
              normalizeCategory(
                file.category
              )

            const key =
              normalized.toLowerCase()

            if (
              !unique.has(key)
            ) {

              unique.set(
                key,
                {
                  id: normalized,
                  name: normalized,
                }
              )
            }
          }
        )

        return [
          {
            id: "all",
            name: "All Files",
          },

          ...Array.from(
            unique.values()
          ).sort(
            (a, b) =>
              a.name.localeCompare(
                b.name
              )
          ),
        ]

      }, [
        files,
        allowedCategories,
      ])

    /* ========================================
       FILTERED FILES
    ======================================== */

    const filteredFiles =
      useMemo(() => {

        const q =
          debouncedQuery
            .trim()
            .toLowerCase()

        return files.filter(
          (file) => {

            const matchesSearch =
              !q ||

              file.file_name
                .toLowerCase()
                .includes(q) ||

              file.category
                .toLowerCase()
                .includes(q)

            const matchesCategory =
              selectedCategory ===
                "all" ||

              file.category
                .toLowerCase() ===
              selectedCategory
                .toLowerCase()

            return (
              matchesSearch &&
              matchesCategory
            )
          }
        )

      }, [
        files,
        debouncedQuery,
        selectedCategory,
      ])

    /* ========================================
       PAGINATION
    ======================================== */

    const pagination =
      usePagination({
        items:
          filteredFiles,

        itemsPerPage:
          10,

        resetDeps: [
          debouncedQuery,
          selectedCategory,
        ],
      })

    /* ========================================
       DELETE
    ======================================== */

    const deleteFile =
      useCallback(
        async (
          documentId
        ) => {

          if (
            !documentId
          ) {

            throw new Error(
              "Document ID is required."
            )
          }

          const previous =
            files

          setFiles(
            previous.filter(
              (file) =>
                file.document_id !==
                documentId
            )
          )

          const res =
            await fetch(
              `/api/documents/${documentId}`,
              {
                method:
                  "DELETE",
              }
            )

          if (!res.ok) {

            setFiles(
              previous
            )

            throw new Error(
              await res.text()
            )
          }

          refresh()

        },
        [
          files,
          refresh,
        ]
      )

    /* ========================================
       UPDATE
    ======================================== */

    const updateFile =
      useCallback(
        async (
          documentId,
          file_name,
          category
        ) => {

          if (
            !documentId
          ) {

            throw new Error(
              "Document ID is required."
            )
          }

          const normalizedCategory =
            normalizeCategory(
              category
            )

          const previous =
            files

          const updated =
            previous.map(
              (file) => {

                if (
                  file.document_id !==
                  documentId
                ) {

                  return file
                }

                return {
                  ...file,
                  file_name,
                  category:
                    normalizedCategory,
                }
              }
            )

          setFiles(
            updated
          )

          const res =
            await fetch(
              `/api/documents/${documentId}`,
              {
                method:
                  "PUT",

                headers: {
                  "Content-Type":
                    "application/json",

                  Accept:
                    "application/json",
                },

                body:
                  JSON.stringify({
                    file_name,
                    category:
                      normalizedCategory,
                  }),
              }
            )

          if (!res.ok) {

            setFiles(
              previous
            )

            throw new Error(
              await res.text()
            )
          }

          refresh()

        },
        [
          files,
          refresh,
        ]
      )

    return {
      allFiles:
        files,

      filteredFiles,

      categories,

      loading,
      error,
      refresh,

      deleteFile,
      updateFile,

      query,
      setQuery,

      selectedCategory,
      setSelectedCategory,

      ...pagination,
    }
  }

export default useKnowledgeFiles