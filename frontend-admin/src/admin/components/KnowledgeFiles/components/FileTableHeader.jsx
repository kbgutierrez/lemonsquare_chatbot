const FileTableHeader =
  () => {

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

              text-center
              text-[11px]
              font-semibold
              uppercase

              tracking-[0.18em]

              text-[#70847b]
            "
          >
            Actions
          </th>
        </tr>
      </thead>
    )
  }

export default FileTableHeader