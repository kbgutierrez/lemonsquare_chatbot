import {
  useMemo,
  useState,
} from "react"

import {
  motion,
  AnimatePresence,
} from "framer-motion"

import {
  Palette,
  Check,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react"

import ModalShell from "../components/ModalShell.jsx"
import { useTheme } from "../context/ThemeContext.jsx"

import lemonLogo from "../../assets/Lemon_Logo_small.jpg"

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
      group relative flex flex-col items-center gap-2.5 rounded-2xl p-3 text-center transition-all duration-200
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

  const [
    hexValue,
    setHexValue,
  ] = useState(value)

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
          <input
            id={`picker-${label.replace(/\s+/g, "-")}`}
            type="color"
            value={value}
            onChange={handlePickerChange}
            className="sr-only"
          />

          <button
            type="button"
            onClick={() =>
              document
                .getElementById(
                  `picker-${label.replace(/\s+/g, "-")}`
                )
                ?.click()
            }
            className="h-8 w-8 rounded-lg border border-slate-200 shadow-sm overflow-hidden relative shrink-0"
            style={{
              backgroundColor: value,
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

  const isCustom =
    activeThemeId === "custom"

  const preview = useMemo(() => {

    if (
      isCustom
    ) {

      return headerGradientEnabled
        ? `linear-gradient(135deg, ${customColors.headerGradientStart}, ${customColors.headerGradientEnd})`
        : customColors.headerGradientStart
    }

    const found =
      {
        "lemon-square":
          "linear-gradient(135deg, #f7c625, #008b3e)",
        "light":
          "linear-gradient(135deg, #f8fafc, #e2e8f0)",
        "dark":
          "linear-gradient(135deg, #1e293b, #0f172a)",
      }[activeThemeId]

    return (
      found ||
      "linear-gradient(135deg, #f7c625, #008b3e)"
    )

  }, [
    activeThemeId,
    customColors,
    headerGradientEnabled,
    isCustom,
  ])

  return (
    <ModalShell
      open={isOpen}
      onClose={onClose}
      title="Theme Color"
      subtitle="Appearance"
      icon={
        <Palette
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
          value={headerGradientEnabled}
          onChange={toggleHeaderGradient}
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
              isImage
              active={
                activeThemeId ===
                "lemon-square"
              }
              onClick={() =>
                setTheme(
                  "lemon-square"
                )
              }
            />

            <ThemeCard
              name="Light"
              preview="linear-gradient(135deg, #f8fafc, #e2e8f0)"
              icon={Sun}
              active={
                activeThemeId ===
                "light"
              }
              onClick={() =>
                setTheme(
                  "light"
                )
              }
            />

            <ThemeCard
              name="Dark"
              preview="linear-gradient(135deg, #1e293b, #0f172a)"
              icon={Moon}
              active={
                activeThemeId ===
                "dark"
              }
              onClick={() =>
                setTheme(
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
                customColors.headerGradientStart
              }
              onChange={v =>
                setCustomColor(
                  "headerGradientStart",
                  v
                )
              }
              desc="Left side of header"
              previewType="gradient"
              previewProps={{
                gradient: `linear-gradient(90deg, ${customColors.headerGradientStart}, ${customColors.headerGradientEnd})`,
              }}
            />

            <ColorRow
              label="Gradient End"
              value={
                customColors.headerGradientEnd
              }
              onChange={v =>
                setCustomColor(
                  "headerGradientEnd",
                  v
                )
              }
              desc="Right side of header"
              previewType="gradient"
              previewProps={{
                gradient: `linear-gradient(90deg, ${customColors.headerGradientEnd}, ${customColors.headerGradientStart})`,
              }}
            />

            <ColorRow
              label="Header Text"
              value={
                customColors.headerText
              }
              onChange={v =>
                setCustomColor(
                  "headerText",
                  v
                )
              }
              desc="Title & icon color"
              previewType="text"
            />

            <ColorRow
              label="Header Icon"
              value={
                customColors.headerIcon
              }
              onChange={v =>
                setCustomColor(
                  "headerIcon",
                  v
                )
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
                customColors.agentBubbleBg
              }
              onChange={v =>
                setCustomColor(
                  "agentBubbleBg",
                  v
                )
              }
              desc="AI message background"
              previewType="bubble"
              previewProps={{
                borderColor: customColors.agentBubbleBorder,
              }}
            />

            <ColorRow
              label="Agent Bubble Border"
              value={
                customColors.agentBubbleBorder
              }
              onChange={v =>
                setCustomColor(
                  "agentBubbleBorder",
                  v
                )
              }
              desc="AI message border"
              previewType="bubble"
              previewProps={{
                borderColor: customColors.agentBubbleBorder,
                color: customColors.agentBubbleBg,
              }}
            />

            <ColorRow
              label="Agent Text"
              value={
                customColors.agentText
              }
              onChange={v =>
                setCustomColor(
                  "agentText",
                  v
                )
              }
              desc="AI message text"
              previewType="text"
            />

            <ColorRow
              label="Agent Timestamp"
              value={
                customColors.agentTimestamp
              }
              onChange={v =>
                setCustomColor(
                  "agentTimestamp",
                  v
                )
              }
              desc="AI message time"
              previewType="text"
            />

            <ColorRow
              label="User Bubble BG"
              value={
                customColors.userBubbleBg
              }
              onChange={v =>
                setCustomColor(
                  "userBubbleBg",
                  v
                )
              }
              desc="Your message background"
              previewType="bubble"
              previewProps={{
                borderColor: customColors.userBubbleBorder,
              }}
            />

            <ColorRow
              label="User Bubble Border"
              value={
                customColors.userBubbleBorder
              }
              onChange={v =>
                setCustomColor(
                  "userBubbleBorder",
                  v
                )
              }
              desc="Your message border"
              previewType="bubble"
              previewProps={{
                borderColor: customColors.userBubbleBorder,
                color: customColors.userBubbleBg,
              }}
            />

            <ColorRow
              label="User Text"
              value={
                customColors.userText
              }
              onChange={v =>
                setCustomColor(
                  "userText",
                  v
                )
              }
              desc="Your message text"
              previewType="text"
            />

            <ColorRow
              label="User Timestamp"
              value={
                customColors.userTimestamp
              }
              onChange={v =>
                setCustomColor(
                  "userTimestamp",
                  v
                )
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
                customColors.agentAvatarBg
              }
              onChange={v =>
                setCustomColor(
                  "agentAvatarBg",
                  v
                )
              }
              desc="AI avatar circle"
              previewType="circle"
            />

            <ColorRow
              label="Agent Avatar Text"
              value={
                customColors.agentAvatarText
              }
              onChange={v =>
                setCustomColor(
                  "agentAvatarText",
                  v
                )
              }
              desc="AI avatar icon"
              previewType="circle"
              previewProps={{
                textColor: customColors.agentAvatarText,
                color: customColors.agentAvatarBg,
              }}
            />

            <ColorRow
              label="User Avatar BG"
              value={
                customColors.userAvatarBg
              }
              onChange={v =>
                setCustomColor(
                  "userAvatarBg",
                  v
                )
              }
              desc="Your avatar circle"
              previewType="circle"
            />

            <ColorRow
              label="User Avatar Text"
              value={
                customColors.userAvatarText
              }
              onChange={v =>
                setCustomColor(
                  "userAvatarText",
                  v
                )
              }
              desc="Your avatar icon"
              previewType="circle"
              previewProps={{
                textColor: customColors.userAvatarText,
                color: customColors.userAvatarBg,
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
                customColors.inputBg
              }
              onChange={v =>
                setCustomColor(
                  "inputBg",
                  v
                )
              }
              desc="Text field background"
              previewType="input"
            />

            <ColorRow
              label="Input Text"
              value={
                customColors.inputText
              }
              onChange={v =>
                setCustomColor(
                  "inputText",
                  v
                )
              }
              desc="Typed text color"
              previewType="text"
            />

            <ColorRow
              label="Input Placeholder"
              value={
                customColors.inputPlaceholder
              }
              onChange={v =>
                setCustomColor(
                  "inputPlaceholder",
                  v
                )
              }
              desc="Hint text color"
              previewType="text"
            />

            <ColorRow
              label="Input Border"
              value={
                customColors.inputBorder
              }
              onChange={v =>
                setCustomColor(
                  "inputBorder",
                  v
                )
              }
              desc="Field outline color"
              previewType="input"
              previewProps={{
                color: customColors.inputBg,
                borderColor: customColors.inputBorder,
              }}
            />

            <ColorRow
              label="Send Button BG"
              value={
                customColors.sendButtonBg
              }
              onChange={v =>
                setCustomColor(
                  "sendButtonBg",
                  v
                )
              }
              desc="Submit button color"
              previewType="button"
            />

            <ColorRow
              label="Send Button Icon"
              value={
                customColors.sendButtonIcon
              }
              onChange={v =>
                setCustomColor(
                  "sendButtonIcon",
                  v
                )
              }
              desc="Arrow icon color"
              previewType="button"
              previewProps={{
                color: customColors.sendButtonBg,
                textColor: customColors.sendButtonIcon,
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
                customColors.windowBg
              }
              onChange={v =>
                setCustomColor(
                  "windowBg",
                  v
                )
              }
              desc="Chat window base"
              previewType="rect"
            />

            <ColorRow
              label="Accent"
              value={
                customColors.accent
              }
              onChange={v =>
                setCustomColor(
                  "accent",
                  v
                )
              }
              desc="Highlights & glows"
              previewType="circle"
            />

            <ColorRow
              label="Typing Dot"
              value={
                customColors.typingDot
              }
              onChange={v =>
                setCustomColor(
                  "typingDot",
                  v
                )
              }
              desc="Typing indicator"
              previewType="circle"
            />

            <ColorRow
              label="Online Status"
              value={
                customColors.statusOnline
              }
              onChange={v =>
                setCustomColor(
                  "statusOnline",
                  v
                )
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
                customColors.menuBg
              }
              onChange={v =>
                setCustomColor(
                  "menuBg",
                  v
                )
              }
              desc="Dropdown panel"
              previewType="rect"
            />

            <ColorRow
              label="Menu Text"
              value={
                customColors.menuText
              }
              onChange={v =>
                setCustomColor(
                  "menuText",
                  v
                )
              }
              desc="Option labels"
              previewType="text"
            />

            <ColorRow
              label="Menu Hover"
              value={
                customColors.menuHoverBg
              }
              onChange={v =>
                setCustomColor(
                  "menuHoverBg",
                  v
                )
              }
              desc="Hover state"
              previewType="rect"
            />

            <ColorRow
              label="Resolved Banner BG"
              value={
                customColors.resolvedBannerBg
              }
              onChange={v =>
                setCustomColor(
                  "resolvedBannerBg",
                  v
                )
              }
              desc="Resolved notice"
              previewType="rect"
            />

            <ColorRow
              label="Resolved Banner Text"
              value={
                customColors.resolvedBannerText
              }
              onChange={v =>
                setCustomColor(
                  "resolvedBannerText",
                  v
                )
              }
              desc="Notice text"
              previewType="text"
            />
          </Section>
        </div>
      </div>
    </ModalShell>
  )
}

export default ThemeModal