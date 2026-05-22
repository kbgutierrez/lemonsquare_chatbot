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
            panel-base

            mb-4

            rounded-3xl

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
              input-base

              h-32

              resize-none

              rounded-2xl

              p-4

              text-sm
              leading-relaxed
            "
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PipelinePromptBox