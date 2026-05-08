import ChatMenu from './ChatMenu.jsx'

const ChatHeader = ({
  onClose,
  onOpenModal
}) => {
  return (
    <div
      className="
        flex
        items-center
        justify-between

        border-b
        border-violet-200

        bg-gradient-to-r
        from-violet-600
        to-purple-500

        px-4
        py-3

        text-white
      "
    >

      {/* LEFT */}
      <div className="min-w-0">
        <p
          className="
            text-[10px]
            uppercase
            tracking-[0.22em]
            text-violet-100
          "
        >
          Help Desk AI
        </p>

        <div className="mt-1 flex items-center gap-2">
          
          {/* STATUS */}
          <div
            className="
              h-2
              w-2
              rounded-full
              bg-emerald-300
            "
          />

          <h2
            className="
              truncate
              text-sm
              font-semibold
            "
          >
            Virtual Support Assistant
          </h2>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">

        {/* MENU */}
        <ChatMenu onSelect={onOpenModal} />

        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center

            rounded-xl

            bg-white/10

            transition-all
            duration-200

            hover:bg-white/20
          "
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default ChatHeader