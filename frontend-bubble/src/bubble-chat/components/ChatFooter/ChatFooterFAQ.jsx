import {
  ChevronDown,
  Sparkles,
} from "lucide-react"

import {
  motion,
  AnimatePresence,
} from "framer-motion"

import useHorizontalDragScroll
  from "../../hooks/useHorizontalDragScroll"

const quickQuestions = [
  "How do I reset my account?",
  "Where can I find guides?",
  "How do I submit a ticket?",
  "Talk to an agent",
  "Create new password",
  "Billing issue",
  "Update profile",
  "Network problem",
  "Forgot credentials",
  "Account locked",
]

const chip = `
  shrink-0

  rounded-full

  border
  border-white/40

  bg-white/70

  backdrop-blur-md

  shadow-[0_2px_10px_rgba(16,185,129,0.08)]

  transition-all
  duration-200

  hover:bg-white
  hover:border-white
  hover:scale-[1.02]
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

        {/* ====================================
            COLLAPSED BUTTON
        ==================================== */}

        {!showQuestions && (
          <motion.div
            key="faq-collapsed"

            initial={{
              opacity: 0,
              x: 6,
              scale: 0.95,
            }}

            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}

            exit={{
              opacity: 0,
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

              className="
                group

                flex
                items-center
                gap-1

                rounded-full

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

                backdrop-blur-md

                transition-all
                duration-200

                hover:bg-white
                hover:scale-[1.04]
              "
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

        {/* ====================================
            EXPANDED FAQ
        ==================================== */}

        {showQuestions && (
          <motion.div
            key="faq-expanded"

            initial={{
              opacity: 0,
              y: -6,
              scale: 0.97,
            }}

            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}

            exit={{
              opacity: 0,
              y: -6,
              scale: 0.97,
            }}

            transition={{
              duration: 0.18,
              ease: "easeOut",
            }}
          >

            {/* ====================================
                TOP BAR
            ==================================== */}

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

              {/* CLOSE ONLY (no label anymore) */}

              <button
                type="button"
                aria-label="Hide FAQ"

                onClick={() =>
                  setShowQuestions(false)
                }

                className="
                  flex
                  h-5.5
                  w-5.5
                  items-center
                  justify-center

                  rounded-full

                  border
                  border-white/60

                  bg-white/70

                  text-[#256537]

                  backdrop-blur-md

                  transition-all
                  duration-200

                  hover:bg-white
                  hover:rotate-180
                  hover:scale-[1.05]
                "
              >

                <ChevronDown
                  className="
                    h-3.5
                    w-3.5
                  "
                />

              </button>

            </motion.div>

            {/* ====================================
                QUESTIONS
            ==================================== */}

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
                (question, index) => (
                  <motion.button
                    key={question}

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

                    type="button"

                    draggable={false}

                    disabled={loading}

                    onClick={() =>
                      onQuestionClick(question)
                    }

                    className={`
                      ${chip}

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