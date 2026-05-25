const FileTableHeader =
  () => {

    const headerClass =
      `
        border-b

        px-5
        py-3

        text-left
        text-[10px]
        font-semibold
        uppercase

        tracking-[0.14em]
      `

    return (
      <thead
        className="
          sticky
          top-0
          z-10

          backdrop-blur-xl
        "
        style={{
          background:
            "color-mix(in srgb, var(--panel) 95%, transparent)",

          borderColor:
            "var(--border)",
        }}
      >
        <tr>

          <th
            className={
              headerClass
            }
            style={{
              borderColor:
                "var(--border)",

              color:
                "var(--text-muted)",
            }}
          >
            File
          </th>

          <th
            className={
              headerClass
            }
            style={{
              borderColor:
                "var(--border)",

              color:
                "var(--text-muted)",
            }}
          >
            Category
          </th>

          <th
            className={
              headerClass
            }
            style={{
              borderColor:
                "var(--border)",

              color:
                "var(--text-muted)",
            }}
          >
            Chunks
          </th>

          <th
            className={
              headerClass
            }
            style={{
              borderColor:
                "var(--border)",

              color:
                "var(--text-muted)",
            }}
          >
            Uploaded
          </th>

          <th
            className={`
              ${headerClass}

              text-center
            `}
            style={{
              borderColor:
                "var(--border)",

              color:
                "var(--text-muted)",
            }}
          >
            Actions
          </th>
        </tr>
      </thead>
    )
  }

export default FileTableHeader