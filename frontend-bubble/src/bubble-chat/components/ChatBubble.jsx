import {
  motion,
} from "framer-motion"

import bubblePillIcon
  from "../../assets/bubble-pill-icon.png"

import expandedPillIcon
  from "../../assets/expanded-pill-icon.png"

const ChatBubble = ({
  isOpen,
}) => {

  const currentIcon =
    isOpen
      ? expandedPillIcon
      : bubblePillIcon

  return (
    <div
      className="
        relative

        h-16
        w-16

        pointer-events-none
      "
    >
      <motion.button
        type="button"

        aria-label={
          isOpen
            ? "Close chat"
            : "Open chat"
        }

        initial={false}

        whileHover={{
          y: -5,

          rotate: 1.2,

          transition: {
            duration: 0.18,
            ease: "easeOut",
          },
        }}

        whileTap={{
          y: 1,

          rotate: -1,

          transition: {
            duration: 0.08,
          },
        }}

        transition={{
          type: "spring",
          stiffness: 340,
          damping: 22,
        }}

        className="
          relative

          flex
          items-center
          justify-center

          h-16
          w-16

          bg-transparent

          focus:outline-none

          pointer-events-auto
        "
      >

        {/* GLOW */}

        <motion.div
          className="
            absolute
            inset-0

            rounded-full

            bg-violet-500/20

            blur-xl
          "

          initial={{
            opacity: 0,
          }}

          whileHover={{
            opacity: 1,
          }}

          transition={{
            duration: 0.2,
          }}
        />

        {/* ICON */}

        <motion.img
          key={currentIcon}

          src={currentIcon}

          alt="LemonSquare Chat Bubble"

          draggable={false}

          initial={{
            opacity: 0,
            scale: 0.92,
          }}

          animate={{
            opacity: 1,
            scale: 1,
          }}

          transition={{
            duration: 0.18,
            ease: "easeOut",
          }}

          className="
            relative
            z-10

            h-16
            w-16

            object-contain

            select-none
            pointer-events-none

            drop-shadow-[0_10px_25px_rgba(139,92,246,0.28)]
          "
        />

      </motion.button>
    </div>
  )
}

export default ChatBubble