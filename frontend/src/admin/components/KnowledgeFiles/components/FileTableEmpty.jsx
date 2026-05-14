import {
  FileText,
} from "lucide-react"

const FileTableEmpty =
  () => {

    return (
      <tr>
        <td
          colSpan={5}
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
    )
  }

export default FileTableEmpty