import {
  motion,
} from "framer-motion"

import {
  Pencil,
  Trash2,
} from "lucide-react"

import {
  parseResolvedChat,
} from "../utils/parseResolvedChat"

const ResolvedChatCard = ({
  item,
  index,
  onEdit,
  onDelete,
}) => {

  const parsed =
    parseResolvedChat(
      item.content
    )

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
      }}
      transition={{
        delay:
          index * 0.05,
      }}
      className="
        rounded-[28px]

        border
        border-[#26332d]

        bg-[#18211f]

        p-5

        transition-all
        duration-300

        hover:border-[#f5d547]/30
      "
    >
      <div
        className="
          mb-5

          flex
          flex-col
          gap-3

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <div
            className="
              mb-2

              flex
              flex-wrap
              items-center
              gap-3
            "
          >
            <span
              className="
                rounded-2xl

                bg-[#f5d547]/10

                px-3
                py-1

                text-xs
                font-semibold

                text-[#f5d547]
              "
            >
              Resolved Chat
            </span>

            <span
              className="
                text-xs
                text-[#8ea59b]
              "
            >
              {item.source}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={() =>
              onEdit(item)
            }
            className="
              flex
              items-center
              gap-2

              rounded-xl

              bg-[#202b27]

              px-3
              py-2

              text-sm
              text-white

              transition-all

              hover:bg-[#2b3934]
            "
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>

          <button
            onClick={() =>
              onDelete(
                item.id
              )
            }
            className="
              flex
              items-center
              gap-2

              rounded-xl

              bg-red-500/10

              px-3
              py-2

              text-sm
              text-red-300

              transition-all

              hover:bg-red-500/20
            "
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-4">

        <div>
          <h3
            className="
              mb-2
              text-sm
              font-semibold
              text-[#f5d547]
            "
          >
            Issue Reported
          </h3>

          <p
            className="
              text-sm
              leading-relaxed
              text-[#d7e0dc]
            "
          >
            {
              parsed[
                "Issue Reported"
              ]
            }
          </p>
        </div>

        <div>
          <h3
            className="
              mb-2
              text-sm
              font-semibold
              text-[#95c11f]
            "
          >
            Issue Found
          </h3>

          <p
            className="
              text-sm
              leading-relaxed
              text-[#d7e0dc]
            "
          >
            {
              parsed[
                "Issue Found"
              ]
            }
          </p>
        </div>

        <div>
          <h3
            className="
              mb-2
              text-sm
              font-semibold
              text-[#ffb347]
            "
          >
            Root Cause
          </h3>

          <p
            className="
              text-sm
              leading-relaxed
              text-[#d7e0dc]
            "
          >
            {
              parsed[
                "Root Cause"
              ]
            }
          </p>
        </div>

        <div>
          <h3
            className="
              mb-2
              text-sm
              font-semibold
              text-[#7dd3fc]
            "
          >
            Work Done
          </h3>

          <p
            className="
              text-sm
              leading-relaxed
              text-[#d7e0dc]
            "
          >
            {
              parsed[
                "Work Done"
              ]
            }
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default ResolvedChatCard