import {
  useRef,
} from "react"

import {
  ChevronDown,
  Sparkles,
} from "lucide-react"

import useHorizontalDragScroll
  from "../../hooks/useHorizontalDragScroll"

const quickQuestions = [
  "How do I reset my account?",
  "Where can I find guides?",
  "How do I submit a ticket?",
  "Talk to an agent",
]

const chip = `
  shrink-0

  rounded-full

  border
  border-violet-200/80

  bg-white/80

  backdrop-blur-sm

  transition-all
  duration-300

  hover:bg-violet-100
`

const ChatFooterFAQ = ({
  loading,
  showQuestions,
  setShowQuestions,
  onQuestionClick,
}) => {

  const faqScrollRef =
    useHorizontalDragScroll()

  /*
    PREVENT BUTTON CLICK
    AFTER DRAGGING
  */

  const dragStarted =
    useRef(false)

  const startX =
    useRef(0)

  const startY =
    useRef(0)

  const handlePointerDown =
    (event) => {

      dragStarted.current =
        false

      startX.current =
        event.clientX

      startY.current =
        event.clientY
    }

  const handlePointerMove =
    (event) => {

      const dx =
        Math.abs(
          event.clientX -
          startX.current
        )

      const dy =
        Math.abs(
          event.clientY -
          startY.current
        )

      /*
        DETECT REAL DRAG
      */

      if (
        dx > 6 ||
        dy > 6
      ) {

        dragStarted.current =
          true
      }
    }

  const handleQuestionClick =
    (
      event,
      question
    ) => {

      /*
        BLOCK CLICK
        IF DRAGGING
      */

      if (
        dragStarted.current
      ) {

        event.preventDefault()

        event.stopPropagation()

        return
      }

      onQuestionClick(
        question
      )
    }

  return (
    <div className="mb-3">

      {!showQuestions && (
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Open FAQ"
            onClick={() =>
              setShowQuestions(
                true
              )
            }
            className={`
              ${chip}

              flex
              items-center
              gap-1.5

              px-2.5
              py-1

              text-[9px]
              font-semibold

              uppercase
              tracking-[0.12em]

              text-violet-600
            `}
          >
            <Sparkles className="h-3 w-3" />

            FAQ

            <ChevronDown
              className="
                h-3.5
                w-3.5

                -rotate-90
              "
            />
          </button>
        </div>
      )}

      <div
        className={`
          overflow-hidden

          transition-all
          duration-300
          ease-in-out

          ${
            showQuestions
              ? `
                max-h-[240px]
                opacity-100
              `
              : `
                max-h-0
                opacity-0
              `
          }
        `}
      >
        {/* TOP */}
        <div
          className="
            mb-2

            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
            "
          >
            <Sparkles
              className="
                h-3.5
                w-3.5
                text-violet-500
              "
            />

            <p
              className="
                text-[9px]
                font-semibold
                uppercase

                tracking-[0.14em]

                text-violet-500
              "
            >
              Frequently Asked
            </p>
          </div>

          <div
            className="
              h-px
              flex-1

              bg-gradient-to-r
              from-violet-200
              to-transparent
            "
          />

          <button
            type="button"
            aria-label="Hide FAQ"
            onClick={() =>
              setShowQuestions(
                false
              )
            }
            className={`
              ${chip}

              flex
              h-6
              w-6
              items-center
              justify-center

              text-violet-500
            `}
          >
            <ChevronDown
              className="
                h-3.5
                w-3.5
              "
            />
          </button>
        </div>

        {/* QUESTIONS */}
        <div
          ref={faqScrollRef}
          onPointerDown={
            handlePointerDown
          }
          onPointerMove={
            handlePointerMove
          }
          className="
            flex
            gap-2

            overflow-x-auto

            cursor-grab
            active:cursor-grabbing

            select-none

            pb-1

            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {quickQuestions.map(
            (
              question
            ) => (
              <button
                key={
                  question
                }
                type="button"
                disabled={
                  loading
                }
                onClick={(
                  event
                ) =>
                  handleQuestionClick(
                    event,
                    question
                  )
                }
                className={`
                  ${chip}

                  px-3
                  py-1.5

                  text-[11px]
                  font-medium

                  text-violet-700

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                `}
              >
                {question}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatFooterFAQ