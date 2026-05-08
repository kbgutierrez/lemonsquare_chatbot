import {
  useState
} from 'react'

import {
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react'

const ClearConversationModal = ({
  onClose,

  /* CLEAR CHAT */
  onClearConversation
}) => {

  const [loading, setLoading] =
    useState(false)

  const [closing, setClosing] =
    useState(false)

  /* ===================================== */
  /* PLACEHOLDER VALUES */
  /* ===================================== */

  const USER_ID =
    'USER_ID_PLACEHOLDER'

  const CONVERSATION_ID =
    'CONVERSATION_ID_PLACEHOLDER'

  const API_ENDPOINT =
    'CLEAR_CONVERSATION_API_PLACEHOLDER'

  /* CLOSE */
  const handleClose = () => {

    setClosing(true)

    setTimeout(() => {
      onClose()
    }, 200)
  }

  /* CLEAR */
  const handleClear =
    async () => {

      try {

        setLoading(true)

        console.log(
          'CLEAR CONVERSATION:',
          {
            userId: USER_ID,

            conversationId:
              CONVERSATION_ID,

            endpoint:
              API_ENDPOINT
          }
        )

        /*
          FUTURE DATABASE/API FLOW

          await fetch(API_ENDPOINT, {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({
              userId: USER_ID,

              conversationId:
                CONVERSATION_ID
            })
          })
        */

        setTimeout(() => {

          /* CLEAR ACTIVE CHAT */
          if (
            onClearConversation
          ) {

            onClearConversation()
          }

          handleClose()

        }, 800)

      } catch (error) {

        console.error(error)

        setLoading(false)
      }
    }

  return (
    <div
      className={`
        fixed
        inset-0
        z-[100]

        flex
        items-center
        justify-center

        bg-black/30
        backdrop-blur-[4px]

        p-4

        transition-all
        duration-200

        ${
          closing
            ? 'opacity-0'
            : 'opacity-100'
        }
      `}
    >

      {/* MODAL */}
      <div
        className={`
          w-full
          max-w-sm

          overflow-hidden

          rounded-[28px]

          border
          border-violet-100

          bg-white

          shadow-[0_25px_80px_rgba(0,0,0,0.18)]

          transition-all
          duration-300

          ${
            closing
              ? `
                translate-y-4
                scale-95
                opacity-0
              `
              : `
                translate-y-0
                scale-100
                opacity-100
              `
          }
        `}
      >

        {/* HEADER */}
        <div
          className="
            flex
            items-start
            justify-between

            border-b
            border-violet-100

            bg-gradient-to-r
            from-red-50
            to-orange-50

            px-5
            py-5
          "
        >

          {/* LEFT */}
          <div
            className="
              flex
              items-start
              gap-3
            "
          >

            {/* ICON */}
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center

                rounded-2xl

                bg-red-100
              "
            >
              <AlertTriangle
                className="
                  h-5
                  w-5
                  text-red-600
                "
              />
            </div>

            {/* TEXT */}
            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-red-500
                "
              >
                Warning
              </p>

              <h2
                className="
                  mt-1
                  text-lg
                  font-semibold
                  text-slate-900
                "
              >
                Clear Conversation
              </h2>
            </div>
          </div>

          {/* CLOSE */}
          <button
            type="button"

            onClick={handleClose}

            className="
              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-xl

              border
              border-red-100

              bg-white

              transition-all
              duration-200

              hover:bg-red-50
            "
          >
            <X className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-5 py-5">

          <p
            className="
              text-sm
              leading-relaxed
              text-slate-600
            "
          >
            This will permanently remove
            the current conversation and
            start a brand new chat session.
          </p>

          {/* INFO BOX */}
          <div
            className="
              mt-4

              rounded-2xl

              border
              border-violet-100

              bg-violet-50/70

              p-4
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <Trash2
                className="
                  h-4
                  w-4
                  text-violet-600
                "
              />

              <p
                className="
                  text-xs
                  font-semibold
                  text-violet-700
                "
              >
                New conversation will begin
                immediately after clearing.
              </p>
            </div>
          </div>

          {/* BUTTONS */}
          <div
            className="
              mt-6
              flex
              justify-end
              gap-3
            "
          >

            {/* CANCEL */}
            <button
              type="button"

              onClick={handleClose}

              disabled={loading}

              className="
                rounded-2xl

                border
                border-slate-200

                bg-white

                px-4
                py-2.5

                text-sm
                font-medium
                text-slate-700

                transition-all
                duration-200

                hover:bg-slate-50
              "
            >
              Cancel
            </button>

            {/* CLEAR */}
            <button
              type="button"

              onClick={handleClear}

              disabled={loading}

              className="
                flex
                items-center
                gap-2

                rounded-2xl

                bg-gradient-to-r
                from-red-500
                to-orange-500

                px-4
                py-2.5

                text-sm
                font-medium
                text-white

                shadow-lg

                transition-all
                duration-200

                hover:scale-[1.02]
              "
            >

              {loading ? (
                <>
                  <div
                    className="
                      h-4
                      w-4

                      animate-spin

                      rounded-full

                      border-2
                      border-white/40
                      border-t-white
                    "
                  />

                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />

                  Clear Chat
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClearConversationModal