import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  motion,
  AnimatePresence,
} from "framer-motion"

import {
  Sparkles,
  Check,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react"

import lemonLogo
  from "../../assets/Lemon_Logo_small.jpg"

import ModalShell from "../components/ModalShell.jsx"
import { useTheme } from "../context/ThemeContext.jsx"

/* ========================================
   PREVIEW COMPONENTS
======================================== */

const PreviewBox = ({
  type,
  color,
  borderColor,
  textColor,
  gradient,
}) => {

  if (
    type === "text"
  ) {

    return (
      <span
        className="text-[11px] font-bold"
        style={{
          color,
        }}
      >
        123Az
      </span>
    )
  }

  if (
    type === "bubble"
  ) {

    return (
      <div
        className="h-5 w-8 rounded-lg"
        style={{
          backgroundColor: color,
          border:
            `1px solid ${borderColor || color}`,
        }}
      />
    )
  }

  if (
    type === "rect"
  ) {

    return (
      <div
        className="h-5 w-8 rounded-md"
        style={{
          backgroundColor: color,
        }}
      />
    )
  }

  if (
    type === "button"
  ) {

    return (
      <div
        className="flex h-5 w-6 items-center justify-center rounded-md"
        style={{
          backgroundColor: color,
        }}
      >
        <div
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor:
              textColor ||
              "#ffffff",
          }}
        />
      </div>
    )
  }

  if (
    type === "input"
  ) {

    return (
      <div
        className="h-5 w-8 rounded-md border border-black/10"
        style={{
          backgroundColor: color,
        }}
      />
    )
  }

  if (
    type === "circle"
  ) {

    return (
      <div
        className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold"
        style={{
          backgroundColor: color,
          color:
            textColor ||
            "#ffffff",
        }}
      >
        A
      </div>
    )
  }

  if (
    type === "gradient"
  ) {

    return (
      <div
        className="h-5 w-8 rounded-md"
        style={{
          background: gradient || color,
        }}
      />
    )
  }

  return (
    <div
      className="h-5 w-5 rounded"
      style={{
        backgroundColor: color,
      }}
    />
  )
}

/* ========================================
   TOGGLE
======================================== */

const Toggle = ({
  value,
  onChange,
  activeColor,
  label,
}) => (
  <div
    className="flex items-center justify-between rounded-xl px-3 py-2.5"
    style={{
      background:
        "rgba(0,0,0,0.04)",
    }}
  >
    <span className="text-[12px] font-semibold text-slate-700">
      {label}
    </span>

    <button
      type="button"
      onClick={() =>
        onChange(!value)
      }
      className="relative flex h-5 w-9 items-center rounded-full transition-all duration-200"
      style={{
        background: value
          ? activeColor
          : "rgba(0,0,0,0.12)",
        border: value
          ? "none"
          : "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="absolute h-3.5 w-3.5 rounded-full shadow-sm transition-all duration-200"
        style={{
          left: value
            ? "18px"
            : "3px",
          background: value
            ? "#fff"
            : "rgba(0,0,0,0.35)",
        }}
      />
    </button>
  </div>
)

/* ========================================
   THEME CARD
======================================== */

const ThemeCard = ({
  name,
  preview,
  active,
  onClick,
  isImage,
  icon: Icon,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      group relative flex flex-col items-center gap-2.5 rounded-xl p-3 text-center transition-all duration-200
      ${active
        ? "bg-violet-50 ring-2 ring-violet-400 shadow-sm"
        : "bg-slate-50 hover:bg-slate-100 border border-slate-100"
      }
    `}
  >
    <div className="relative h-14 w-full overflow-hidden rounded-xl shadow-sm">
      {isImage ? (
        <img
          src={preview}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="h-full w-full"
          style={{
            background: preview,
          }}
        />
      )}

      {Icon && !active && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-5 w-5 text-white drop-shadow-md" />
        </div>
      )}

      {active && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg">
            <Check className="h-3.5 w-3.5 text-violet-600" />
          </div>
        </div>
      )}
    </div>

    <span className="text-[11px] font-semibold text-slate-700">
      {name}
    </span>
  </button>
)

/* ========================================
   COLOR ROW
======================================== */

const ColorRow = ({
  label,
  value,
  onChange,
  desc,
  previewType,
  previewProps,
}) => {

  const isHexColor =
    /^#[0-9A-Fa-f]{6}$/.test(
      value || ""
    )

  const [
    hexValue,
    setHexValue,
  ] = useState(
    isHexColor
      ? value
      : "#000000"
  )

  const [
    showMobileEditor,
    setShowMobileEditor,
  ] = useState(false)

  const isMobile =
    window.innerWidth < 768

  const handleHexChange =
    e => {

      const v =
        e.target.value

      setHexValue(v)

      if (
        /^#[0-9A-Fa-f]{6}$/.test(
          v
        )
      ) {
        onChange(v)
      }
    }

  const handlePickerChange =
    e => {

      const v =
        e.target.value

      setHexValue(v)
      onChange(v)
    }

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0">
          <PreviewBox
            type={previewType}
            color={value}
            {...previewProps}
          />
        </div>

        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-slate-700">
            {label}
          </p>

          {desc && (
            <p className="text-[10px] text-slate-400">
              {desc}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          {
            isHexColor && (
              <input
                id={`picker-${label.replace(/\s+/g, "-")}`}
                type="color"
                value={value}
                onChange={handlePickerChange}
                className="sr-only"
              />
            )
          }

          <button
            type="button"
            onClick={() => {

              if (isMobile) {

                setShowMobileEditor(
                  prev => !prev
                )

                return
              }

              if (!isHexColor) {
                return
              }

              document
                .getElementById(
                  `picker-${label.replace(/\s+/g, "-")}`
                )
                ?.click()
            }}
            className="h-8 w-8 rounded-lg border border-slate-200 shadow-sm overflow-hidden relative shrink-0"
            style={{
              backgroundColor: isHexColor ? value : "#e2e8f0",
            }}
            aria-label={`Change ${label} color`}
          >
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                boxShadow:
                  "inset 0 0 0 1px rgba(0,0,0,0.06)",
              }}
            />
            {!isHexColor && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] font-bold text-slate-400">N/A</span>
              </div>
            )}
          </button>
        </div>

        <input
          type="text"
          value={hexValue}
          onChange={handleHexChange}
          onBlur={() =>
            setHexValue(value)
          }
          className="w-[72px] rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-mono uppercase text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-300 transition-all"
        />
      </div>

      {showMobileEditor && isMobile && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">

          <label className="mb-2 block text-xs font-semibold text-slate-600">
            Enter HEX Color
          </label>

          <input
            type="text"
            value={hexValue}
            onChange={handleHexChange}
            placeholder="#7BE38E"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono uppercase"
          />

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() =>
                setShowMobileEditor(false)
              }
              className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white"
            >
              Done
            </button>
          </div>

        </div>
      )}
    </div>
  )
}

/* ========================================
   COLLAPSIBLE SECTION
======================================== */

const Section = ({
  title,
  children,
  defaultOpen = true,
}) => {

  const [
    open,
    setOpen,
  ] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden bg-white/60">
      <button
        type="button"
        onClick={() =>
          setOpen(!open)
        }
        className="flex w-full items-center justify-between px-4 py-3 bg-slate-50/60 hover:bg-slate-50 transition-colors"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
          {title}
        </span>

        <ChevronDown
          className={`
            h-4 w-4 text-slate-400 transition-transform duration-200
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ========================================
   THEME MODAL
======================================== */

const ThemeModal = ({
  isOpen,
  onClose,
}) => {

  const {
    theme,
    activeThemeId,
    headerGradientEnabled,
    toggleHeaderGradient,
    customColors,
    setCustomColor,
    setTheme,
  } = useTheme()

  const [
    draftThemeId,
    setDraftThemeId,
  ] = useState(activeThemeId)

  const [
    draftColors,
    setDraftColors,
  ] = useState(customColors)

  const [
    draftGradientEnabled,
    setDraftGradientEnabled,
  ] = useState(headerGradientEnabled)

  useEffect(() => {

    if (!isOpen) {
      return
    }

    setDraftThemeId(
      activeThemeId
    )

    setDraftColors(
      customColors
    )

    setDraftGradientEnabled(
      headerGradientEnabled
    )

  }, [
    isOpen,
    activeThemeId,
    customColors,
    headerGradientEnabled,
  ])

  const isCustom =
    draftThemeId === "custom"

  const handleSaveTheme = () => {

    if (
      draftThemeId !==
      activeThemeId
    ) {
      setTheme(
        draftThemeId
      )
    }

    Object.entries(
      draftColors
    ).forEach(
      ([key, value]) => {

        if (
          customColors[key] !==
          value
        ) {

          setCustomColor(
            key,
            value
          )
        }
      }
    )

    if (
      draftGradientEnabled !==
      headerGradientEnabled
    ) {
      toggleHeaderGradient()
    }

    onClose()
  }

  const preview = useMemo(() => {

    if (
      isCustom
    ) {

      return draftGradientEnabled
        ? `linear-gradient(135deg, ${draftColors.headerGradientStart}, ${draftColors.headerGradientEnd})`
        : draftColors.headerGradientStart
    }

    const found =
      {
        "lemon-square":
          "#6FD27A",
        "light":
          "linear-gradient(135deg, #f8fafc, #e2e8f0)",
        "dark":
          "linear-gradient(135deg, #1e293b, #0f172a)",
      }[draftThemeId]

    return (
      found ||
      "#6FD27A"
    )

  }, [
    draftThemeId,
    draftColors,
    draftGradientEnabled,
    isCustom,
  ])

  return (
    <ModalShell
      open={isOpen}
      onClose={onClose}
      title="Theme Color"
      icon={
        <Sparkles
          className="h-5 w-5"
          style={{
            color:
              theme.accent ||
              "#008b3e",
          }}
        />
      }
      size="md"
      scrollable={true}
      bodyClassName="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      headerActions={
        <div
          className="h-7 w-7 rounded-lg border border-black/5 shadow-sm"
          style={{
            background: preview,
          }}
        />
      }
    >
      <div className="space-y-4 p-4">
        {/* HEADER GRADIENT TOGGLE */}
        <Toggle
          label="Header Gradient"
          value={draftGradientEnabled}
          onChange={() =>
            setDraftGradientEnabled(
              prev => !prev
            )
          }
          activeColor={
            theme.accent ||
            "#008b3e"
          }
        />

        {/* DEFAULT THEMES */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Choose Theme
          </p>

          <div className="grid grid-cols-3 gap-3">
            <ThemeCard
              name="Lemon Square"
              preview={lemonLogo}
              isImage={true}
              active={
                draftThemeId ===
                "lemon-square"
              }
              onClick={() =>
                setDraftThemeId(
                  "lemon-square"
                )
              }
            />

            <ThemeCard
              name="Light"
              preview="linear-gradient(135deg, #f8fafc, #e2e8f0)"
              icon={Sun}
              active={
                draftThemeId ===
                "light"
              }
              onClick={() =>
                setDraftThemeId(
                  "light"
                )
              }
            />

            <ThemeCard
              name="Dark"
              preview="linear-gradient(135deg, #1e293b, #0f172a)"
              icon={Moon}
              active={
                draftThemeId ===
                "dark"
              }
              onClick={() =>
                setDraftThemeId(
                  "dark"
                )
              }
            />
          </div>
        </div>

        {/* CUSTOM COLORS */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Customize Colors
          </p>

          <Section
            title="Header"
            defaultOpen={true}
          >
            <ColorRow
              label="Gradient Start"
              value={
                draftColors.headerGradientStart
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  headerGradientStart: v,
                }))
              }
              desc="Left side of header"
              previewType="gradient"
              previewProps={{
                gradient: `linear-gradient(90deg, ${draftColors.headerGradientStart}, ${draftColors.headerGradientEnd})`,
              }}
            />

            <ColorRow
              label="Gradient End"
              value={
                draftColors.headerGradientEnd
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  headerGradientEnd: v,
                }))
              }
              desc="Right side of header"
              previewType="gradient"
              previewProps={{
                gradient: `linear-gradient(90deg, ${draftColors.headerGradientEnd}, ${draftColors.headerGradientStart})`,
              }}
            />

            <ColorRow
              label="Header Text"
              value={
                draftColors.headerText
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  headerText: v,
                }))
              }
              desc="Title & icon color"
              previewType="text"
            />

            <ColorRow
              label="Header Icon"
              value={
                draftColors.headerIcon
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  headerIcon: v,
                }))
              }
              desc="Status & menu icons"
              previewType="text"
            />
          </Section>

          <Section
            title="Chat Bubbles"
            defaultOpen={true}
          >
            <ColorRow
              label="Agent Bubble BG"
              value={
                draftColors.agentBubbleBg
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  agentBubbleBg: v,
                }))
              }
              desc="AI message background"
              previewType="bubble"
              previewProps={{
                borderColor: draftColors.agentBubbleBorder,
              }}
            />

            <ColorRow
              label="Agent Bubble Border"
              value={
                draftColors.agentBubbleBorder
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  agentBubbleBorder: v,
                }))
              }
              desc="AI message border"
              previewType="bubble"
              previewProps={{
                borderColor: draftColors.agentBubbleBorder,
                color: draftColors.agentBubbleBg,
              }}
            />

            <ColorRow
              label="Agent Text"
              value={
                draftColors.agentText
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  agentText: v,
                }))
              }
              desc="AI message text"
              previewType="text"
            />

            <ColorRow
              label="Agent Timestamp"
              value={
                draftColors.agentTimestamp
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  agentTimestamp: v,
                }))
              }
              desc="AI message time"
              previewType="text"
            />

            <ColorRow
              label="User Bubble BG"
              value={
                draftColors.userBubbleBg
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  userBubbleBg: v,
                }))
              }
              desc="Your message background"
              previewType="bubble"
              previewProps={{
                borderColor: draftColors.userBubbleBorder,
              }}
            />

            <ColorRow
              label="User Bubble Border"
              value={
                draftColors.userBubbleBorder
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  userBubbleBorder: v,
                }))
              }
              desc="Your message border"
              previewType="bubble"
              previewProps={{
                borderColor: draftColors.userBubbleBorder,
                color: draftColors.userBubbleBg,
              }}
            />

            <ColorRow
              label="User Text"
              value={
                draftColors.userText
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  userText: v,
                }))
              }
              desc="Your message text"
              previewType="text"
            />

            <ColorRow
              label="User Timestamp"
              value={
                draftColors.userTimestamp
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  userTimestamp: v,
                }))
              }
              desc="Your message time"
              previewType="text"
            />
          </Section>

          <Section
            title="Avatars"
            defaultOpen={false}
          >
            <ColorRow
              label="Agent Avatar BG"
              value={
                draftColors.agentAvatarBg
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  agentAvatarBg: v,
                }))
              }
              desc="AI avatar circle"
              previewType="circle"
            />

            <ColorRow
              label="Agent Avatar Text"
              value={
                draftColors.agentAvatarText
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  agentAvatarText: v,
                }))
              }
              desc="AI avatar icon"
              previewType="circle"
              previewProps={{
                textColor: draftColors.agentAvatarText,
                color: draftColors.agentAvatarBg,
              }}
            />

            <ColorRow
              label="User Avatar BG"
              value={
                draftColors.userAvatarBg
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  userAvatarBg: v,
                }))
              }
              desc="Your avatar circle"
              previewType="circle"
            />

            <ColorRow
              label="User Avatar Text"
              value={
                draftColors.userAvatarText
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  userAvatarText: v,
                }))
              }
              desc="Your avatar icon"
              previewType="circle"
              previewProps={{
                textColor: draftColors.userAvatarText,
                color: draftColors.userAvatarBg,
              }}
            />
          </Section>

          <Section
            title="Input & Footer"
            defaultOpen={false}
          >
            <ColorRow
              label="Input Background"
              value={
                draftColors.inputBg
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  inputBg: v,
                }))
              }
              desc="Text field background"
              previewType="input"
            />

            <ColorRow
              label="Input Text"
              value={
                draftColors.inputText
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  inputText: v,
                }))
              }
              desc="Typed text color"
              previewType="text"
            />

            <ColorRow
              label="Input Placeholder"
              value={
                draftColors.inputPlaceholder
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  inputPlaceholder: v,
                }))
              }
              desc="Hint text color"
              previewType="text"
            />

            <ColorRow
              label="Input Border"
              value={
                draftColors.inputBorder
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  inputBorder: v,
                }))
              }
              desc="Field outline color"
              previewType="input"
              previewProps={{
                color: draftColors.inputBg,
                borderColor: draftColors.inputBorder,
              }}
            />

            <ColorRow
              label="Send Button BG"
              value={
                draftColors.sendButtonBg
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  sendButtonBg: v,
                }))
              }
              desc="Submit button color"
              previewType="button"
            />

            <ColorRow
              label="Send Button Icon"
              value={
                draftColors.sendButtonIcon
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  sendButtonIcon: v,
                }))
              }
              desc="Arrow icon color"
              previewType="button"
              previewProps={{
                color: draftColors.sendButtonBg,
                textColor: draftColors.sendButtonIcon,
              }}
            />
          </Section>

          <Section
            title="Window & Effects"
            defaultOpen={false}
          >
            <ColorRow
              label="Window Background"
              value={
                draftColors.windowBg
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  windowBg: v,
                }))
              }
              desc="Chat window base"
              previewType="rect"
            />

            <ColorRow
              label="Accent"
              value={
                draftColors.accent
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  accent: v,
                }))
              }
              desc="Highlights & glows"
              previewType="circle"
            />

            <ColorRow
              label="Typing Dot"
              value={
                draftColors.typingDot
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  typingDot: v,
                }))
              }
              desc="Typing indicator"
              previewType="circle"
            />

            <ColorRow
              label="Online Status"
              value={
                draftColors.statusOnline
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  statusOnline: v,
                }))
              }
              desc="Header status dot"
              previewType="circle"
            />
          </Section>

          <Section
            title="Menu & Badges"
            defaultOpen={false}
          >
            <ColorRow
              label="Menu Background"
              value={
                draftColors.menuBg
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  menuBg: v,
                }))
              }
              desc="Dropdown panel"
              previewType="rect"
            />

            <ColorRow
              label="Menu Text"
              value={
                draftColors.menuText
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  menuText: v,
                }))
              }
              desc="Option labels"
              previewType="text"
            />

            <ColorRow
              label="Menu Hover"
              value={
                draftColors.menuHoverBg
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  menuHoverBg: v,
                }))
              }
              desc="Hover state"
              previewType="rect"
            />

            <ColorRow
              label="Resolved Banner BG"
              value={
                draftColors.resolvedBannerBg
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  resolvedBannerBg: v,
                }))
              }
              desc="Resolved notice"
              previewType="rect"
            />

            <ColorRow
              label="Resolved Banner Text"
              value={
                draftColors.resolvedBannerText
              }
              onChange={v =>
                setDraftColors(prev => ({
                  ...prev,
                  resolvedBannerText: v,
                }))
              }
              desc="Notice text"
              previewType="text"
            />
          </Section>
        </div>

        <div className="border-t border-slate-100 pt-4 mt-4">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveTheme}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Save Theme
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}

export default ThemeModal