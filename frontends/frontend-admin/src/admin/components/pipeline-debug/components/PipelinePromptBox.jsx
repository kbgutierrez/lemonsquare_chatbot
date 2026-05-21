import {
  AnimatePresence,
  motion,
} from "framer-motion"

const PipelinePromptBox = ({
  prompt,
  setPrompt,
  showConfig,
}) => {

  return (
    <AnimatePresence>
      {showConfig && (
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          exit={{
            opacity: 0,
            y: -10,
          }}

          transition={{
            duration: 0.2,
          }}

          className="
            mb-4

            rounded-3xl

            border
            border-[#25332d]

            bg-[#151d1b]

            p-4
          "
        >
          <textarea
            value={prompt}
            onChange={(e) =>
              setPrompt(
                e.target.value
              )
            }
            placeholder="Enter debug query..."
            className="
              h-32
              w-full

              resize-none

              rounded-2xl

              border
              border-[#2a3a33]

              bg-[#101816]

              p-4

              text-sm
              text-white

              outline-none
            "
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PipelinePromptBox