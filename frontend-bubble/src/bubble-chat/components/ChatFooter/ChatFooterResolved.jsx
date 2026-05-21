import { Lock } from "lucide-react"

const ChatFooterResolved = () => (
  <div
    className="
      mb-3

      flex
      items-start
      gap-3

      rounded-2xl

      border
      border-emerald-200

      bg-emerald-50/90

      px-4
      py-3

      backdrop-blur-sm
    "
  >

    <div
      className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center

        rounded-xl

        bg-emerald-100
      "
    >
      <Lock
        className="
          h-5
          w-5
          text-emerald-700
        "
      />
    </div>

    <div>
      <p
        className="
          text-sm
          font-semibold
          text-emerald-800
        "
      >
        Conversation Resolved
      </p>

      <p
        className="
          mt-1
          text-xs
          text-emerald-700
        "
      >
        This chat is now read-only.
      </p>
    </div>

  </div>
)

export default ChatFooterResolved