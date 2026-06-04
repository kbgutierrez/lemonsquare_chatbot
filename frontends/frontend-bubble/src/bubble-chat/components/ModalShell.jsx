// frontends/frontend-bubble/src/bubble-chat/components/ModalShell.jsx
import { useEffect, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { useTheme } from "../context/ThemeContext.jsx"

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
const modalVariants = { hidden: { opacity: 0, scale: 0.96, y: 20 }, visible: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.97, y: 12 } }
const SIZE_CLASSES = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-2xl", xl: "max-w-4xl" }

const ModalShell = ({ open = true, onClose, children, title, subtitle, icon, headerActions, size = "md", scrollable = true, bodyClassName }) => {
  const { theme } = useTheme()

  useEffect(() => {
    const handleKeyDown = e => { if (e.key === "Escape") onClose?.() }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const sizeClass = useMemo(() => SIZE_CLASSES[size] || SIZE_CLASSES.md, [size])

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial="hidden" animate="visible" exit="hidden" variants={backdropVariants} transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/40 p-3 sm:p-4">
          <button type="button" aria-label="Close modal overlay" onClick={onClose} className="absolute inset-0 cursor-default" />
          <motion.div initial="hidden" animate="visible" exit="exit" variants={modalVariants} transition={{ duration: 0.24, ease: "easeOut" }}
            className={`relative z-10 flex w-full flex-col overflow-hidden rounded-[16px] border ${sizeClass}`}
            style={{ backgroundColor: theme.windowWrapperBg, borderColor: theme.windowBorder, boxShadow: `0 12px 40px rgba(0,0,0,0.12)` }}>
            <div className="relative z-10 flex items-start justify-between gap-4 border-b px-4 py-4 sm:px-5"
              style={{ background: theme.headerGradient, borderColor: theme.headerBorder, color: theme.headerText }}>
              <div className="flex min-w-0 items-start gap-3">
                {icon && (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]"
                    style={{ backgroundColor: theme.headerBadgeBg, color: theme.headerText, WebkitTextFillColor: theme.headerText }}>
                    {icon}
                  </div>
                )}
                <div className="min-w-0">
                  {subtitle && <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: theme.headerText, WebkitTextFillColor: theme.headerText, opacity: 0.7 }}>{subtitle}</p>}
                  {title && <h2 className="mt-1 truncate text-lg font-semibold sm:text-xl" style={{ color: theme.headerText, WebkitTextFillColor: theme.headerText }}>{title}</h2>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {headerActions}
                <button type="button" onClick={onClose} aria-label="Close modal"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border transition-colors duration-150"
                  style={{ backgroundColor: theme.headerBadgeBg, borderColor: theme.headerBadgeBorder, color: theme.headerText, WebkitTextFillColor: theme.headerText }}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className={`relative z-10 ${scrollable ? "max-h-[75dvh] overflow-y-auto" : ""} ${bodyClassName || ""}`}
              style={{ backgroundColor: theme.windowWrapperBg }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ModalShell