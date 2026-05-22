import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"

import SidebarMenu from "./SidebarMenu.jsx"

const MobileSidebar = ({
  open = false,
  setOpen,
  activeView,
  setActiveView,
  onLogout,
  adminUser,
}) => {
  /* ========================================
     HANDLE SELECT
  ======================================== */
  const handleSelect = (view) => {
    setActiveView(view)
    setOpen(false)
  }

  return (
    <>
      {/* MOBILE TOGGLE BUTTON */}
      <button
        type="button"
        aria-label="Open Navigation"
        onClick={() => setOpen(true)}
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
          backdrop-blur-xl
          transition-all
          duration-300
          hover:scale-[1.03]
          active:scale-[0.98]
          lg:hidden
        "
        style={{
          border: "1px solid var(--border)",
          background: "var(--glass-bg)",
          color: "var(--text-primary)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* DRAWER */}
      <AnimatePresence>
        {open && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
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
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
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
                  onClick={() => setOpen(false)}
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
                    transition-all
                    duration-200
                  "
                  style={{
                    background: "var(--panel)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <X className="h-5 w-5" />
                </button>

                {/* SIDEBAR */}
                <SidebarMenu
                  activeView={activeView}
                  setActiveView={handleSelect}
                  onLogout={onLogout}
                  adminUser={adminUser}
                  isMobile
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