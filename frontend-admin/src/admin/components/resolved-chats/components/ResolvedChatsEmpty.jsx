import {
  MessagesSquare,
} from "lucide-react"

const ResolvedChatsEmpty =
  () => {

    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">

          <MessagesSquare
            className="
              mx-auto
              mb-4

              h-12
              w-12

              text-[#f5d547]
            "
          />

          <h2
            className="
              text-xl
              font-semibold
              text-white
            "
          >
            No resolved chats
          </h2>
        </div>
      </div>
    )
  }

export default ResolvedChatsEmpty