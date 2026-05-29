import {
  useEffect,
  useState,
} from "react"

import {
  Download,
  X,
} from "lucide-react"

import LoadingSpinner
  from "../../../../shared/components/LoadingSpinner"

import {
  API_ENDPOINTS,
} from "../../../../shared/api/endpoints"

import {
  buildApiUrl,
} from "../../../../shared/api/client"

const ExportResolvedChatsModal = ({
  onClose,
}) => {

  const [loading, setLoading] =
    useState(true)

  const [downloadUrl, setDownloadUrl] =
    useState(null)

  const [error, setError] =
    useState(null)

  useEffect(() => {

    const generateExport =
      async () => {

        try {

          const endpoint =
            buildApiUrl(
              API_ENDPOINTS.KNOWLEDGE_EXPORT_LEARNED_CHATS
            )

          const token =
            localStorage.getItem(
              "admin_user_token"
            )

          const response =
            await fetch(
              endpoint,
              {
                headers:
                  token
                    ? {
                        Authorization:
                          `Bearer ${token}`,
                      }
                    : {},
              }
            )

          if (
            !response.ok
          ) {

            throw new Error(
              "Failed to generate export."
            )
          }

          const blob =
            await response.blob()

          const url =
            window.URL.createObjectURL(
              blob
            )

          setDownloadUrl(
            url
          )

        } catch (err) {

          console.error(
            "EXPORT_ERROR",
            err
          )

          setError(
            err.message
          )

        } finally {

          setLoading(
            false
          )
        }
      }

    generateExport()

    return () => {

    setDownloadUrl(
        (currentUrl) => {

        if (
            currentUrl
        ) {

            window.URL.revokeObjectURL(
            currentUrl
            )
        }

        return null
        }
    )
    }

  }, [])

  return (
    <div
      className="
        fixed
        inset-0
        z-50

        flex
        items-center
        justify-center

        bg-black/40
        backdrop-blur-sm
      "
    >

      <div
        className="
          w-full
          max-w-lg

          overflow-hidden

          rounded-2xl

          border
          theme-border

          bg-[var(--panel)]
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-start
            justify-between

            border-b
            theme-border

            px-5
            py-5
          "
        >

          <div>

            <h3
              className="
                text-lg
                font-bold
                text-[color:var(--text-primary)]
              "
            >
              Export Learned Chats
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-[color:var(--text-secondary)]
              "
            >
              Generate and download a CSV export.
            </p>

          </div>

          <button
            disabled={loading}
            onClick={onClose}
            className="
              flex
              disabled:cursor-not-allowed
              disabled:opacity-50
              h-10
              w-10
              items-center
              justify-center

              rounded-xl

              border
              theme-border

              bg-[color:var(--panel)]
            "
          >
            <X className="h-4 w-4" />
          </button>

        </div>

        {/* BODY */}

        <div
          className="
            p-6
          "
        >

          {loading && (
            <LoadingSpinner
              size="sm"
              label="Generating export..."
            />
          )}

          {!loading &&
            error && (
              <div
                className="
                  text-sm
                  text-red-500
                "
              >
                {error}
              </div>
            )}

          {!loading &&
            !error &&
            downloadUrl && (

              <div
                className="
                  flex
                  flex-col
                  gap-4
                "
              >

                <p
                  className="
                    text-sm
                    text-[color:var(--text-secondary)]
                  "
                >
                  Export generated successfully.
                </p>

                <a
                  href={downloadUrl}
                  download="resolved_chats_export.csv"
                  className="
                    inline-flex
                    items-center
                    gap-2

                    rounded-xl

                    bg-[var(--accent)]

                    px-4
                    py-3

                    text-white
                  "
                >
                  <Download className="h-4 w-4" />
                  Download CSV
                </a>

              </div>
            )}

        </div>

      </div>

    </div>
  )
}

export default ExportResolvedChatsModal