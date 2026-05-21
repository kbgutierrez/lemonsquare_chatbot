const FileTableHeader =
  () => {

    const headerClass =
      `
        border-b
        border-[#24312b]

        px-5
        py-3

        text-left
        text-[10px]
        font-semibold
        uppercase

        tracking-[0.14em]

        text-[#70847b]
      `

    return (
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
            className={
              headerClass
            }
          >
            File
          </th>

          <th
            className={
              headerClass
            }
          >
            Category
          </th>

          <th
            className={
              headerClass
            }
          >
            Chunks
          </th>

          <th
            className={
              headerClass
            }
          >
            Uploaded
          </th>

          <th
            className={`
              ${headerClass}

              text-center
            `}
          >
            Actions
          </th>
        </tr>
      </thead>
    )
  }

export default FileTableHeader