import {
  AnimatePresence,
  motion,
} from "framer-motion"

import {
  Menu,
  X,
} from "lucide-react"

import SidebarMenu
  from "./SidebarMenu.jsx"

const MobileSidebar = ({
  open = false,
  setOpen,
  activeView,
  setActiveView,
  onLogout,
}) => {

  /* ========================================
     HANDLE SELECT
  ======================================== */

  const handleSelect =
    (view) => {

      setActiveView(view)

      setOpen(false)
    }

  /* ========================================
     RENDER
  ======================================== */

  return (
    <>
      {/* MOBILE TOGGLE BUTTON */}
      <button
        type="button"
        aria-label="Open Navigation"
        onClick={() =>
          setOpen(true)
        }
        className="
          fixed
          left-4
          top-4
          z-[80]

          flex
          h-12
          w-12
          items-center
          justify-center

          rounded-2xl

          border
          border-white/10

          bg-[#111917]/90

          text-white

          shadow-[0_10px_40px_rgba(0,0,0,0.35)]

          backdrop-blur-xl

          transition-all
          duration-300

          hover:scale-[1.03]
          hover:bg-[#161f1d]

          active:scale-[0.98]

          lg:hidden
        "
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* DRAWER */}
      <AnimatePresence>
        {open && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={() =>
                setOpen(false)
              }
              className="
                fixed
                inset-0
                z-[90]

                bg-black/50
                backdrop-blur-sm

                lg:hidden
              "
            />

            {/* SIDEBAR PANEL */}
            <motion.div
              initial={{
                x: -320,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              exit={{
                x: -320,
                opacity: 0,
              }}
              transition={{
                type: "spring",
                damping: 24,
                stiffness: 240,
              }}
              className="
                fixed
                left-0
                top-0
                z-[100]

                h-full
                w-[88vw]
                max-w-[340px]

                p-4

                lg:hidden
              "
            >
              <div className="relative h-full">
                {/* CLOSE BUTTON */}
                <button
                  type="button"
                  aria-label="Close Navigation"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="
                    absolute
                    right-4
                    top-4
                    z-20

                    flex
                    h-10
                    w-10
                    items-center
                    justify-center

                    rounded-xl

                    bg-[#1b2421]

                    text-[#b6c3bd]

                    transition-all
                    duration-200

                    hover:bg-[#232f2a]
                    hover:text-white
                  "
                >
                  <X className="h-5 w-5" />
                </button>

                {/* SIDEBAR */}
                <SidebarMenu
                  activeView={
                    activeView
                  }

                  setActiveView={
                    handleSelect
                  }

                  onLogout={
                    onLogout
                  }
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default MobileSidebar