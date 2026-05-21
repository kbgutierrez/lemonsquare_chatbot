import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import {
  Check,
  FileText,
  LoaderCircle,
  UploadCloud,
  X,
} from "lucide-react"

import useFileUpload from "./useFileUpload.js"

const normalizeCategory = (
  value
) => {
  return String(
    value || ""
  ).trim()
}

const parseAllowedCategories = (
  value
) => {
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

const UploadSection = ({
  onRefreshDocs,
}) => {
  const fileInputRef =
    useRef(null)

  const dropdownRef =
    useRef(null)

  const [
    dropdownOpen,
    setDropdownOpen,
  ] = useState(false)

  const [
    category,
    setCategory,
  ] = useState(
    "__AUTO_DETECT__"
  )

  const [
    allowedCategories,
    setAllowedCategories,
  ] = useState([])

  const {
    uploadedFiles,
    paginatedFiles,

    dragged,
    setDragged,

    uploading,
    uploadProgress,

    addFiles,
    removeFile,
    clearFiles,
    confirmUpload,
    updateCategory,

    hasPendingUploads,
  } = useFileUpload({
    onRefreshDocs,
  })

  /* ========================================
     LOAD SETTINGS
  ======================================== */

  useEffect(() => {
    const loadSettings =
      async () => {
        try {
          const response =
            await fetch(
              "/api/settings",
              {
                headers: {
                  Accept:
                    "application/json",
                },
              }
            )

          if (
            !response.ok
          ) {
            throw new Error(
              "Failed to load categories."
            )
          }

          const data =
            await response.json()

          setAllowedCategories(
            parseAllowedCategories(
              data?.AllowedCategories
            )
          )
        } catch (error) {
          console.error(
            "LOAD_UPLOAD_CATEGORIES_ERROR",
            error
          )
        }
      }

    loadSettings()
  }, [])

  /* ========================================
     NORMALIZED CATEGORIES
  ======================================== */

  const normalizedCategories =
    useMemo(() => {
      return Array.from(
        new Set(
          allowedCategories.filter(
            Boolean
          )
        )
      )
    }, [allowedCategories])

  /* ========================================
     OUTSIDE CLICK
  ======================================== */

  useEffect(() => {
    const handleClickOutside =
      (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(
            event.target
          )
        ) {
          setDropdownOpen(
            false
          )
        }
      }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
  }, [])

  /* ========================================
     FILE HANDLERS
  ======================================== */

  const handleDrop = (
    e
  ) => {
    e.preventDefault()

    setDragged(false)

    const files =
      e.dataTransfer.files

    if (
      files?.length
    ) {
      addFiles(
        files,
        category
      )
    }
  }

  const handleFileChange = (
    e
  ) => {
    const files =
      e.target.files

    if (
      files?.length
    ) {
      addFiles(
        files,
        category
      )
    }

    e.target.value = ""
  }

  /* ========================================
     UPLOAD
  ======================================== */

  const handleUpload =
    async () => {
      await confirmUpload()
    }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {/* LEFT */}
        <div className="card-surface p-5 md:p-6">
          <div className="flex flex-col gap-6">
            {/* HEADER */}
            <div className="flex flex-col gap-2">
              <span className="text-label">
                Upload PDFs
              </span>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Upload to Knowledge
                  Base
                </h2>

                <p className="mt-1 text-sm text-[#74877f]">
                  Queue PDF
                  documents before
                  uploading to the AI
                  ingestion pipeline.
                </p>
              </div>
            </div>

            {/* DROPZONE */}
            <motion.div
              layout
              className={`relative flex min-h-[280px] flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed bg-[#141d1a] px-6 py-10 text-center transition-all duration-200 ${
                dragged
                  ? "border-[#f5d547] bg-[#f5d547]/5 scale-[1.01]"
                  : "border-[#2a3a33] hover:border-[#f5d547]/30"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) =>
                e.preventDefault()
              }
              onDragEnter={() =>
                setDragged(true)
              }
              onDragLeave={() =>
                setDragged(false)
              }
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={
                  handleFileChange
                }
              />

              <motion.button
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-[#2b3933] bg-[#18211f] text-[#f5d547] shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-all duration-200 hover:border-[#f5d547]/20 hover:bg-[#1f2a27]"
              >
                <UploadCloud className="h-10 w-10" />
              </motion.button>

              <div className="max-w-md">
                <p className="text-base font-semibold text-white">
                  Drag & drop PDF
                  files
                </p>

                <p className="mt-2 text-sm leading-relaxed text-[#81958c]">
                  Queue multiple PDF
                  documents before
                  uploading.
                </p>

                <p className="mt-4 text-xs text-[#627a71]">
                  Backend only
                  supports PDF
                  ingestion.
                </p>
              </div>
            </motion.div>

            {/* CATEGORY */}
            <div
              ref={dropdownRef}
              className="relative z-[120]"
            >
              <label className="mb-1.5 block text-sm text-[#8ea59b]">
                Default Category
              </label>

              <button
                type="button"
                onClick={() =>
                  setDropdownOpen(
                    true
                  )
                }
                className="flex w-full items-center justify-between rounded-2xl border border-[#2d3b35] bg-[#18211f] px-4 py-3 text-left text-white transition-colors hover:bg-[#202b27]"
              >
                <span>
                  {category ===
                    "__AUTO_DETECT__"
                    ? "Auto Detect Category"
                    : category}
                </span>

                <Check className="h-4 w-4 text-[#f5d547]" />
              </button>

              {/* DROPDOWN */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
                  >
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 16,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: 16,
                      }}
                      className="w-full max-w-[420px] overflow-hidden rounded-[28px] border border-[#2d3b35] bg-[#18211f] shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      {/* HEADER */}
                      <div className="flex items-center justify-between border-b border-[#2d3b35] px-5 py-4">
                        <div>
                          <p className="text-base font-semibold text-white">
                            Select Category
                          </p>

                          <p className="mt-0.5 text-xs text-[#74877f]">
                            Default category
                            for queued files.
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            setDropdownOpen(
                              false
                            )
                          }
                          className="rounded-xl p-2 text-[#8ea59b] transition-colors hover:bg-[#202b27] hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* LIST */}
                      <div className="max-h-[420px] overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {/* AUTO */}
                        <button
                          type="button"
                          onClick={() => {
                            setCategory(
                              "__AUTO_DETECT__"
                            )

                            setDropdownOpen(
                              false
                            )
                          }}
                          className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm transition-colors ${
                            category ===
                            "__AUTO_DETECT__"
                              ? "bg-[#202b27] text-white"
                              : "text-[#d5dfdb] hover:bg-[#202b27]"
                          }`}
                        >
                          <span>
                            Auto Detect
                            Category
                          </span>

                          {category ===
                            "__AUTO_DETECT__" && (
                            <Check className="h-4 w-4 shrink-0 text-[#f5d547]" />
                          )}
                        </button>

                        {/* CATEGORIES */}
                        {normalizedCategories.map(
                          (
                            item
                          ) => {
                            const active =
                              category ===
                              item

                            return (
                              <button
                                key={
                                  item
                                }
                                type="button"
                                onClick={() => {
                                  setCategory(
                                    item
                                  )

                                  setDropdownOpen(
                                    false
                                  )
                                }}
                                className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm transition-colors ${
                                  active
                                    ? "bg-[#202b27] text-white"
                                    : "text-[#d5dfdb] hover:bg-[#202b27]"
                                }`}
                              >
                                <span className="break-words">
                                  {
                                    item
                                  }
                                </span>

                                {active && (
                                  <Check className="h-4 w-4 shrink-0 text-[#f5d547]" />
                                )}
                              </button>
                            )
                          }
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-3 lg:flex-row">
              <motion.button
                whileHover={{
                  scale:
                    uploadedFiles.length >
                    0
                      ? 1.01
                      : 1,
                }}
                whileTap={{
                  scale:
                    uploadedFiles.length >
                    0
                      ? 0.98
                      : 1,
                }}
                onClick={
                  handleUpload
                }
                disabled={
                  !hasPendingUploads ||
                  uploading
                }
                className="btn-primary flex flex-1 items-center justify-center gap-2 px-6"
              >
                {uploading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />

                    Uploading{" "}
                    {
                      uploadProgress
                    }
                    %
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />

                    Upload Queue
                  </>
                )}
              </motion.button>

              <button
                onClick={
                  clearFiles
                }
                disabled={
                  uploading ||
                  uploadedFiles.length ===
                    0
                }
                className="rounded-2xl border border-[#2d3b35] bg-[#18211f] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#202b27] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel Queue
              </button>
            </div>

            {/* PROGRESS */}
            <AnimatePresence>
              {uploading && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                  }}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#74877f]">
                      Uploading queue...
                    </span>

                    <span className="font-semibold text-white">
                      {
                        uploadProgress
                      }
                      %
                    </span>
                  </div>

                  <div className="relative h-3 overflow-hidden rounded-full bg-[#0b1110]">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-[#95c11f]"
                      animate={{
                        width: `${uploadProgress}%`,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT */}
        <div className="card-surface flex min-h-[720px] flex-col overflow-hidden">
          <div className="border-b border-[#26332d] px-5 py-4 md:px-6">
            <div className="flex flex-col gap-1">
              <span className="text-label">
                Upload Queue
              </span>

              <p className="text-sm text-[#74877f]">
                Review queued files
                before uploading.
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto p-5 md:p-6">
            {paginatedFiles.length >
            0 ? (
              <motion.div
                layout
                className="flex flex-col gap-3"
              >
                <AnimatePresence>
                  {paginatedFiles.map(
                    (item) => {
                      const isUploading =
                        item.statusType ===
                        "loading"

                      const isSuccess =
                        item.statusType ===
                        "success"

                      return (
                        <motion.div
                          key={
                            item.id
                          }
                          layout
                          initial={{
                            opacity: 0,
                            y: 12,
                            scale: 0.98,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            y: -12,
                            scale: 0.98,
                          }}
                          className="rounded-2xl border border-[#26332d] bg-[#141d1a] p-4"
                        >
                          <div className="flex items-start gap-3">
                            {/* ICON */}
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#2d3b35] bg-[#111917]">
                              {isUploading ? (
                                <LoaderCircle className="h-5 w-5 animate-spin text-[#f5d547]" />
                              ) : (
                                <FileText className="h-5 w-5 text-[#f5d547]" />
                              )}
                            </div>

                            {/* CONTENT */}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-white">
                                {
                                  item.name
                                }
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-xl border px-2.5 py-1 text-xs ${
                                    isSuccess
                                      ? "border-[#294137] bg-[#17231f] text-[#8dd9a7]"
                                      : "border-[#2d3b35] bg-[#18211f] text-[#d5dfdb]"
                                  }`}
                                >
                                  {item.category ===
                                  "__AUTO_DETECT__"
                                    ? "Auto Detect"
                                    : item.category}
                                </span>

                                <span className="text-xs text-[#74877f]">
                                  {
                                    item.size
                                  }
                                </span>

                                <span
                                  className={`text-xs font-medium ${
                                    item.statusType ===
                                    "success"
                                      ? "text-[#8dd9a7]"
                                      : item.statusType ===
                                        "error"
                                      ? "text-[#ff8d8d]"
                                      : item.statusType ===
                                        "loading"
                                      ? "text-[#f5d547]"
                                      : "text-[#9aa9a3]"
                                  }`}
                                >
                                  {
                                    item.status
                                  }
                                </span>
                              </div>

                              {/* DETECTED CATEGORY */}
                              {item.detectedCategory && (
                                <div className="mt-3">
                                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#74877f]">
                                    Detected
                                    Category
                                  </p>

                                  <div className="mt-1 inline-flex rounded-xl border border-[#294137] bg-[#17231f] px-2.5 py-1 text-xs font-medium text-[#8dd9a7]">
                                    {
                                      item.detectedCategory
                                    }
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* REMOVE */}
                            <button
                              disabled={
                                isUploading
                              }
                              onClick={() =>
                                removeFile(
                                  item.id
                                )
                              }
                              className="rounded-lg p-2 text-[#74877f] transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      )
                    }
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-[#26332d] bg-[#111917]/40 p-8 text-center">
                <div className="max-w-sm">
                  <p className="text-sm font-medium text-white">
                    No queued files
                  </p>

                  <p className="mt-2 text-sm leading-relaxed text-[#74877f]">
                    Added PDF files
                    will appear here
                    before upload.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadSection