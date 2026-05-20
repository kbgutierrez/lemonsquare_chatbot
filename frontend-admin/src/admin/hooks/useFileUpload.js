import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { uploadDocument } from "../services/uploadService"
import aiSettingsService from "../services/aiSettingsService"

import {
  getCachedData,
  setCachedData,
  subscribeCache,
} from "../../shared/cache/liveQueryCache"

const ITEMS_PER_PAGE = 5
const UPLOAD_CACHE_KEY = "global_upload_queue"

/* ========================================
   SAFE UUID (FALLBACK READY)
======================================== */
const safeUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `id_${Date.now()}_${Math.random()}`
}

/* ========================================
   HOOK
======================================== */
export const useFileUpload = () => {
  const inputRef = useRef(null)
  const uploadLockRef = useRef(false)
  const mountedRef = useRef(true)
  const rawFilesRef = useRef(new Map())

  /* ========================================
     CACHE INIT
  ======================================== */
  const initialUploads = getCachedData(UPLOAD_CACHE_KEY) || []

  const [uploadedFiles, setUploadedFiles] = useState(initialUploads)
  const [currentPage, setCurrentPage] = useState(1)

  const [hasPendingUploads, setHasPendingUploads] = useState(() =>
    initialUploads.some((f) => f.statusType === "pending")
  )

  const [selectedCategory, setSelectedCategory] = useState("")
  const [categories, setCategories] = useState([])

  /* ========================================
     SAFE PENDING STATE
  ======================================== */
  const computePending = useCallback((files) => {
    return files.some((f) => f.statusType === "pending")
  }, [])

  const syncCache = useCallback((files) => {
    const safe = files.map(({ raw, ...rest }) => rest)
    setCachedData(UPLOAD_CACHE_KEY, safe)
  }, [])

  /* ========================================
     SUBSCRIPTION
  ======================================== */
  useEffect(() => {
    mountedRef.current = true

    const unsubscribe = subscribeCache(
      UPLOAD_CACHE_KEY,
      (updatedFiles) => {
        if (!mountedRef.current) return

        const safe = Array.isArray(updatedFiles) ? updatedFiles : []

        const hydrated = safe.map((file) => ({
          ...file,
          raw: rawFilesRef.current.get(file.id) || null,
        }))

        setUploadedFiles(hydrated)
        setHasPendingUploads(computePending(hydrated))
      }
    )

    return () => {
      mountedRef.current = false
      unsubscribe?.()
    }
  }, [computePending])

  /* ========================================
     LOAD CATEGORIES
  ======================================== */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const settings = await aiSettingsService.getSettings()

        const parsed =
          settings?.AllowedCategories?.split(",")
            ?.map((x) => x.trim())
            ?.filter(Boolean) || []

        setCategories(parsed)
      } catch (error) {
        console.error("LOAD_CATEGORIES_ERROR", error)
      }
    }

    loadCategories()
  }, [])

  /* ========================================
     FORMAT
  ======================================== */
  const formatSize = useCallback((size) => {
    return `${(size / 1024 / 1024).toFixed(2)} MB`
  }, [])

  /* ========================================
     UPDATE FILE
  ======================================== */
  const updateFile = useCallback((id, updates) => {
    setUploadedFiles((prev) => {
      const updated = prev.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      )

      setHasPendingUploads(computePending(updated))
      syncCache(updated)

      return updated
    })
  }, [syncCache, computePending])

  /* ========================================
     CLEAR
  ======================================== */
  const clearFiles = useCallback(() => {
    rawFilesRef.current.clear()
    setUploadedFiles([])
    setHasPendingUploads(false)
    setCurrentPage(1)
    syncCache([])
  }, [syncCache])

  /* ========================================
     UPLOAD SINGLE FILE
  ======================================== */
  const uploadFile = useCallback(async (localId, file, category) => {
    try {
      if (!file) throw new Error("Missing file reference")

      const data = await uploadDocument(file, category)

      updateFile(localId, {
        status: "Uploaded",
        statusType: "success",
        response: data,
      })
    } catch (error) {
      const msg = String(error?.message || "").toLowerCase()

      const duplicate =
        msg.includes("already") ||
        msg.includes("exists") ||
        msg.includes("duplicate")

      updateFile(localId, {
        status: duplicate ? "Already Exists" : error.message || "Upload Failed",
        statusType: duplicate ? "warning" : "error",
      })
    }
  }, [updateFile])

  /* ========================================
     CONFIRM UPLOAD
  ======================================== */
  const confirmUpload = useCallback(async () => {
    if (uploadLockRef.current) return
    uploadLockRef.current = true

    try {
      const pending = uploadedFiles.filter((f) => f.statusType === "pending")
      if (!pending.length) return

      setHasPendingUploads(false)

      await Promise.all(
        pending.map(async (file) => {
          updateFile(file.id, {
            status: "Uploading...",
            statusType: "loading",
          })

          await uploadFile(
            file.id,
            rawFilesRef.current.get(file.id),
            file.category
          )
        })
      )
    } finally {
      uploadLockRef.current = false

      setUploadedFiles((prev) => {
        setHasPendingUploads(computePending(prev))
        syncCache(prev)
        return prev
      })
    }
  }, [uploadedFiles, uploadFile, updateFile, computePending, syncCache])

  /* ========================================
     FILE HANDLING
  ======================================== */
  const handleFiles = useCallback((files) => {
    const valid = Array.from(files).filter((f) =>
      f.name.toLowerCase().endsWith(".pdf")
    )

    if (!valid.length) return

    const mapped = valid.map((file) => {
      const id = safeUUID()

      rawFilesRef.current.set(id, file)

      return {
        id,
        raw: file,
        name: file.name,
        size: formatSize(file.size),
        type: file.name.split(".").pop()?.toUpperCase(),
        category: selectedCategory,
        status: "Pending",
        statusType: "pending",
        uploadedAt: new Date().toLocaleString(),
      }
    })

    setUploadedFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name))
      const filtered = mapped.filter((f) => !existing.has(f.name))

      const updated = [...filtered, ...prev]

      setHasPendingUploads(computePending(updated))
      syncCache(updated)

      return updated
    })
  }, [formatSize, selectedCategory, computePending, syncCache])

  const handleInputChange = useCallback((e) => {
    handleFiles(e.target.files)
    e.target.value = ""
  }, [handleFiles])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const removeFile = useCallback((id) => {
    rawFilesRef.current.delete(id)

    setUploadedFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id)

      setHasPendingUploads(computePending(updated))
      syncCache(updated)

      return updated
    })
  }, [computePending, syncCache])

  /* ========================================
     DERIVED
  ======================================== */
  const showTable = uploadedFiles.length > 0

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(uploadedFiles.length / ITEMS_PER_PAGE))
  }, [uploadedFiles])

  const paginatedFiles = useMemo(() => {
    return uploadedFiles.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    )
  }, [uploadedFiles, currentPage])

  /* ========================================
     RETURN
  ======================================== */
  return {
    inputRef,
    uploadedFiles,
    currentPage,
    totalPages,
    paginatedFiles,
    hasPendingUploads,
    showTable,
    categories,
    selectedCategory,
    setSelectedCategory,
    handleInputChange,
    handleDrop,
    removeFile,
    clearFiles,
    confirmUpload,
    setCurrentPage,
  }
}

export default useFileUpload