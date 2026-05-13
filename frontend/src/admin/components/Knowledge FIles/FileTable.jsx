import {
  ShieldCheck,
  ShieldOff,
  FileText,
} from "lucide-react"

const FileTable = ({
  files = [],
  onToggleFile,
}) => {

  const formatDate =
    (date) => {

      if (!date)
        return "-"

      return new Date(
        date
      ).toLocaleString()
    }

  return (
    <div
      className="
        h-full
        overflow-auto

        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      <table
        className="
          w-full
          min-w-[900px]

          border-separate
          border-spacing-0
        "
      >
        {/* HEADER */}
        <thead
          className="
            sticky
            top-0
            z-10

            bg-[#121a18]/95

            backdrop-blur-xl
          "
        >
          <tr>

            <th
              className="
                border-b
                border-[#24312b]

                px-6
                py-4

                text-left
                text-[11px]
                font-semibold
                uppercase

                tracking-[0.18em]

                text-[#70847b]
              "
            >
              File
            </th>

            <th
              className="
                border-b
                border-[#24312b]

                px-6
                py-4

                text-left
                text-[11px]
                font-semibold
                uppercase

                tracking-[0.18em]

                text-[#70847b]
              "
            >
              Category
            </th>

            <th
              className="
                border-b
                border-[#24312b]

                px-6
                py-4

                text-left
                text-[11px]
                font-semibold
                uppercase

                tracking-[0.18em]

                text-[#70847b]
              "
            >
              Chunks
            </th>

            <th
              className="
                border-b
                border-[#24312b]

                px-6
                py-4

                text-left
                text-[11px]
                font-semibold
                uppercase

                tracking-[0.18em]

                text-[#70847b]
              "
            >
              Uploaded
            </th>

            <th
              className="
                border-b
                border-[#24312b]

                px-6
                py-4

                text-left
                text-[11px]
                font-semibold
                uppercase

                tracking-[0.18em]

                text-[#70847b]
              "
            >
              AI Status
            </th>

            <th
              className="
                border-b
                border-[#24312b]

                px-6
                py-4

                text-center
                text-[11px]
                font-semibold
                uppercase

                tracking-[0.18em]

                text-[#70847b]
              "
            >
              AI Control
            </th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {files.length ===
            0 && (
            <tr>
              <td
                colSpan={6}
                className="
                  px-6
                  py-24

                  text-center
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center
                  "
                >
                  <div
                    className="
                      mb-5

                      flex
                      h-20
                      w-20
                      items-center
                      justify-center

                      rounded-3xl

                      border
                      border-[#2a3732]

                      bg-[#18211f]
                    "
                  >
                    <FileText
                      className="
                        h-8
                        w-8

                        text-[#f5d547]
                      "
                    />
                  </div>

                  <h3
                    className="
                      text-lg
                      font-semibold

                      text-white
                    "
                  >
                    No documents found
                  </h3>

                  <p
                    className="
                      mt-2

                      max-w-sm

                      text-sm
                      leading-relaxed

                      text-[#80958b]
                    "
                  >
                    Uploaded knowledge
                    documents will appear
                    here once added into
                    the AI system.
                  </p>
                </div>
              </td>
            </tr>
          )}

          {files.map((file) => {

            const isActive =
              file.is_active !==
              false

            return (
              <tr
                key={
                  file.document_id
                }
                className="
                  group

                  transition-all
                  duration-200

                  hover:bg-[#18211f]/70
                "
              >
                {/* FILE */}
                <td
                  className="
                    border-b
                    border-[#202b27]

                    px-6
                    py-5
                  "
                >
                  <div className="flex items-center gap-4">

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center

                        rounded-2xl

                        border
                        border-[#2a3732]

                        bg-[#18211f]
                      "
                    >
                      <FileText
                        className="
                          h-5
                          w-5

                          text-[#f5d547]
                        "
                      />
                    </div>

                    <div className="min-w-0">

                      <p
                        className="
                          truncate

                          text-sm
                          font-medium

                          text-white
                        "
                      >
                        {
                          file.file_name
                        }
                      </p>

                      <p
                        className="
                          mt-1

                          text-xs

                          text-[#70847b]
                        "
                      >
                        PDF Document
                      </p>
                    </div>
                  </div>
                </td>

                {/* CATEGORY */}
                <td
                  className="
                    border-b
                    border-[#202b27]

                    px-6
                    py-5
                  "
                >
                  <span
                    className="
                      inline-flex
                      items-center

                      rounded-2xl

                      border
                      border-[#2d3b35]

                      bg-[#18211f]

                      px-3
                      py-1.5

                      text-xs
                      font-medium

                      text-[#d4dfdb]
                    "
                  >
                    {file.category}
                  </span>
                </td>

                {/* CHUNKS */}
                <td
                  className="
                    border-b
                    border-[#202b27]

                    px-6
                    py-5

                    text-sm
                    font-medium

                    text-white
                  "
                >
                  {
                    file.chunk_count
                  }
                </td>

                {/* DATE */}
                <td
                  className="
                    border-b
                    border-[#202b27]

                    px-6
                    py-5

                    text-sm

                    text-[#8ca097]
                  "
                >
                  {formatDate(
                    file.uploaded_at
                  )}
                </td>

                {/* STATUS */}
                <td
                  className="
                    border-b
                    border-[#202b27]

                    px-6
                    py-5
                  "
                >
                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-2

                      rounded-2xl

                      border

                      px-3
                      py-1.5

                      text-xs
                      font-semibold

                      ${
                        isActive
                          ? `
                            border-emerald-500/20
                            bg-emerald-500/10
                            text-emerald-400
                          `
                          : `
                            border-red-500/20
                            bg-red-500/10
                            text-red-400
                          `
                      }
                    `}
                  >
                    <div
                      className={`
                        h-2
                        w-2

                        rounded-full

                        ${
                          isActive
                            ? `
                              bg-emerald-400
                            `
                            : `
                              bg-red-400
                            `
                        }
                      `}
                    />

                    {isActive
                      ? "Whitelisted"
                      : "Blocked"}
                  </span>
                </td>

                {/* ACTION */}
                <td
                  className="
                    border-b
                    border-[#202b27]

                    px-6
                    py-5
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <button
                      onClick={() =>
                        onToggleFile?.(
                          file.document_id,
                          isActive
                        )
                      }
                      className={`
                        flex
                        items-center
                        gap-2

                        rounded-xl

                        border

                        px-4
                        py-2.5

                        text-sm
                        font-medium

                        transition-all
                        duration-200

                        ${
                          isActive
                            ? `
                              border-red-500/20
                              bg-red-500/10
                              text-red-400

                              hover:bg-red-500/20
                            `
                            : `
                              border-emerald-500/20
                              bg-emerald-500/10
                              text-emerald-400

                              hover:bg-emerald-500/20
                            `
                        }
                      `}
                    >
                      {isActive ? (
                        <>
                          <ShieldOff className="h-4 w-4" />
                          Block File
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          Whitelist File
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default FileTable