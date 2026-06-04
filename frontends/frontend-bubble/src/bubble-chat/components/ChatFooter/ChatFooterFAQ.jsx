// frontends/frontend-bubble/src/bubble-chat/components/ChatFooter/ChatFooterFAQ.jsx
import {
  ChevronDown,
  Sparkles,
} from "lucide-react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import useHorizontalDragScroll
  from "../../hooks/useHorizontalDragScroll"

const quickQuestions = [
  "How do I submit a ticket",
  "Who are you?",

]

const animation = {
  initial: {
    opacity: 0,
  },

  animate: {
    opacity: 1,
  },

  exit: {
    opacity: 0,
  },
}

const chipClass = `
  shrink-0

  rounded-[10px]

  border
  border-white/40

  bg-white/70

  bg-black/[0.03]

  shadow-[0_2px_10px_rgba(16,185,129,0.08)]

  transition-all
  duration-200

  hover:bg-white
  hover:border-white
  hover:scale-[1.02]
`

const faqButtonClass = `
  group

  flex
  items-center
  gap-1

  rounded-[10px]

  border
  border-white/60

  bg-white/75

  px-2.5
  py-[4px]

  text-[9px]
  font-bold

  uppercase
  tracking-[0.12em]

  text-[#1f5c2e]

  shadow-[0_3px_10px_rgba(34,197,94,0.10)]

  bg-black/[0.03]

  transition-all
  duration-200

  hover:bg-white
  hover:scale-[1.04]
`

const collapseButtonClass = `
  flex
  h-5.5
  w-5.5
  items-center
  justify-center

  rounded-[10px]

  border
  border-white/60

  bg-white/70

  text-[#256537]

  bg-black/[0.03]

  transition-all
  duration-200

  hover:bg-white
  hover:rotate-180
  hover:scale-[1.05]
`

const ChatFooterFAQ = ({
  loading,
  showQuestions,
  setShowQuestions,
  onQuestionClick,
}) => {

  const faqScrollRef =
    useHorizontalDragScroll()

  return (
    <div className="mb-1">

      <AnimatePresence mode="wait">

        {/* COLLAPSED */}
        {!showQuestions && (
          <motion.div
            key="faq-collapsed"

            initial={{
              ...animation.initial,
              x: 6,
              scale: 0.95,
            }}

            animate={{
              ...animation.animate,
              x: 0,
              scale: 1,
            }}

            exit={{
              ...animation.exit,
              x: 6,
              scale: 0.95,
            }}

            transition={{
              duration: 0.18,
              ease: "easeOut",
            }}

            className="
              flex
              justify-end
            "
          >

            <button
              type="button"

              aria-label="Open FAQ"

              onClick={() =>
                setShowQuestions(true)
              }

              className={faqButtonClass}
            >

              <Sparkles
                className="
                  h-3
                  w-3

                  text-[#2c7a3d]

                  transition-transform
                  duration-200

                  group-hover:rotate-12
                "
              />

              <span>
                FAQ
              </span>

              <ChevronDown
                className="
                  h-3
                  w-3

                  -rotate-90

                  text-[#2c7a3d]

                  transition-transform
                  duration-200

                  group-hover:translate-x-[1px]
                "
              />

            </button>

          </motion.div>
        )}

        {/* EXPANDED */}
        {showQuestions && (
          <motion.div
            key="faq-expanded"

            initial={{
              ...animation.initial,
              y: -6,
              scale: 0.97,
            }}

            animate={{
              ...animation.animate,
              y: 0,
              scale: 1,
            }}

            exit={{
              ...animation.exit,
              y: -6,
              scale: 0.97,
            }}

            transition={{
              duration: 0.18,
              ease: "easeOut",
            }}
          >

            {/* TOP */}
            <motion.div
              initial={{
                opacity: 0,
                y: -3,
              }}

              animate={{
                opacity: 1,
                y: 0,
              }}

              transition={{
                delay: 0.03,
                duration: 0.15,
              }}

              className="
                mb-1

                flex
                items-center
                justify-end
              "
            >

              <button
                type="button"

                aria-label="Hide FAQ"

                onClick={() =>
                  setShowQuestions(false)
                }

                className={collapseButtonClass}
              >

                <ChevronDown
                  className="
                    h-3.5
                    w-3.5
                  "
                />

              </button>

            </motion.div>

            {/* QUESTIONS */}
            <div
              ref={faqScrollRef}

              className="
                flex
                gap-1.5

                overflow-x-auto
                overflow-y-hidden

                cursor-grab
                active:cursor-grabbing

                select-none

                pb-1

                touch-pan-x

                whitespace-nowrap

                [scrollbar-width:none]
                [-ms-overflow-style:none]
                [&::-webkit-scrollbar]:hidden
              "
            >

              {quickQuestions.map(
                (
                  question,
                  index
                ) => (
                  <motion.button
                    key={question}

                    type="button"

                    draggable={false}

                    disabled={loading}

                    onClick={() =>
                      onQuestionClick(question)
                    }

                    initial={{
                      opacity: 0,
                      y: 6,
                      scale: 0.95,
                    }}

                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}

                    exit={{
                      opacity: 0,
                      y: 6,
                      scale: 0.95,
                    }}

                    transition={{
                      delay: index * 0.03,
                      duration: 0.18,
                    }}

                    className={`
                      ${chipClass}

                      px-2.5
                      py-1

                      text-[10px]
                      font-medium

                      text-[#245a33]

                      whitespace-nowrap

                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    `}
                  >
                    {question}
                  </motion.button>
                )
              )}

            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  )
}

export default ChatFooterFAQ