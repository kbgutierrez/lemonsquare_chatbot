import { motion } from "framer-motion"

import bubblePillIcon from "../../assets/bubble-pill-icon.png"
import expandedPillIcon from "../../assets/expanded-pill-icon.png"

const buttonAnimation = {
  whileHover: {
    y: -5,
    rotate: 1.2,
    transition: {
      duration: 0.18,
      ease: "easeOut",
    },
  },

  whileTap: {
    y: 1,
    rotate: -1,
    transition: {
      duration: 0.08,
    },
  },

  transition: {
    type: "spring",
    stiffness: 340,
    damping: 22,
  },
}

const imageAnimation = {
  initial: {
    opacity: 0,
    scale: 0.92,
  },

  animate: {
    opacity: 1,
    scale: 1,
  },

  transition: {
    duration: 0.18,
    ease: "easeOut",
  },
}

const glowAnimation = {
  initial: {
    opacity: 0,
  },

  whileHover: {
    opacity: 1,
  },

  transition: {
    duration: 0.2,
  },
}

const ChatBubble = ({
  isOpen,
  onPointerDown,
}) => {

  const icon =
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

        className="
          relative

          flex
          h-16
          w-16
          items-center
          justify-center

          bg-transparent

          focus:outline-none

          pointer-events-auto
        "

        // CRITICAL MOBILE FIXES:
        // - onPointerDown passes to drag hook
        // - touch-action: none prevents browser scroll takeover
        // - user-select: none prevents text selection
        onPointerDown={onPointerDown}

        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitUserDrag: 'none',
          WebkitTouchCallout: 'none',
        }}

        {...buttonAnimation}
      >

        {/* GLOW */}
        <motion.div
          className="
            absolute
            inset-0

            rounded-full


            blur-xl
          "

        />

        {/* ICON */}
        <motion.img
          key={icon}

          src={icon}

          alt="LemonSquare Chat Bubble"

          draggable={false}

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

          {...imageAnimation}
        />

      </motion.button>

    </div>
  )
}

export default ChatBubble