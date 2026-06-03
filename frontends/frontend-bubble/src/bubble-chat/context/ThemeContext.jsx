import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import themeService from "../services/themeService"

/* ========================================
   THEME DEFINITIONS
======================================== */

const LEMON_SQUARE_THEME = {
  windowBg: "#f6fff7",
  windowWrapperBg: "#ffffff",
  windowOverlayStart: "rgba(243,255,244,0.90)",
  windowOverlayMiddle: "rgba(247,255,248,0.88)",
  windowOverlayEnd: "rgba(255,255,255,0.96)",
  windowBorder: "#e5e7eb",
  windowShadow: "rgba(139,92,246,0.22)",
  windowBgImageOpacity: 1,
  headerGradientStart: "#6FD27A",
  headerGradientEnd: "#6FD27A",
  headerText: "#ffffff",
  headerIcon: "#ffffff",
  headerBorder: "rgba(16,185,129,0.15)",
  headerBadgeBg: "rgba(255,255,255,0.15)",
  headerBadgeText: "#ffffff",
  headerBadgeBorder: "rgba(255,255,255,0.20)",
  agentBubbleBg: "rgba(255,255,255,0.85)",
  agentBubbleBorder: "rgba(16,185,129,0.15)",
  agentBubbleShadow: "rgba(16,185,129,0.06)",
  agentText: "#1e293b",
  agentTimestamp: "#94a3b8",
  agentAvatarBg: "#d1fae5",
  agentAvatarText: "#047857",
  agentAvatarRing: "rgba(16,185,129,0.08)",
  userBubbleBg: "rgba(255,255,255,0.70)",
  userBubbleBorder: "rgba(16,185,129,0.20)",
  userBubbleShadow: "rgba(16,185,129,0.08)",
  userText: "#1e293b",
  userTimestamp: "#94a3b8",
  userAvatarBg: "#22c55e",
  userAvatarText: "#ffffff",
  userAvatarRing: "rgba(16,185,129,0.12)",
  inputBg: "#ffffff",
  inputBorder: "#d1d5db",
  inputText: "#3c4a3f",
  inputPlaceholder: "#8ca193",
  inputFocusBorder: "#9be7a7",
  sendButtonBg: "#6FD27A",
  sendButtonIcon: "#ffffff",
  sendButtonHoverBg: "#5CC768",
  sendButtonBorder: "rgba(255,255,255,0.20)",
  menuBg: "#ffffff",
  menuText: "#064e3b",
  menuHoverBg: "rgba(255,255,255,0.20)",
  menuHeaderText: "#064e3b",
  accent: "#22c55e",
  typingDot: "#34d399",
  resolvedBannerBg: "#ecfdf5",
  resolvedBannerBorder: "#a7f3d0",
  resolvedBannerText: "#047857",
  glowTop: "rgba(34,197,94,0.14)",
  glowBottom: "rgba(16,185,129,0.08)",
  statusOnline: "#ffffff",
}

const LIGHT_THEME = {
  windowBg: "#ffffff",
  windowWrapperBg: "rgba(255,255,255,0.95)",
  windowOverlayStart: "rgba(248,250,252,0.95)",
  windowOverlayMiddle: "rgba(241,245,249,0.93)",
  windowOverlayEnd: "rgba(255,255,255,0.98)",
  windowBorder: "rgba(226,232,240,0.80)",
  windowShadow: "rgba(148,163,184,0.20)",
  windowBgImageOpacity: 0,
  headerGradientStart: "#f1f5f9",
  headerGradientEnd: "#e2e8f0",
  headerText: "#0f172a",
  headerIcon: "#475569",
  headerBorder: "rgba(148,163,184,0.20)",
  headerBadgeBg: "rgba(15,23,42,0.08)",
  headerBadgeText: "#0f172a",
  headerBadgeBorder: "rgba(15,23,42,0.12)",
  agentBubbleBg: "#f8fafc",
  agentBubbleBorder: "rgba(148,163,184,0.25)",
  agentBubbleShadow: "rgba(148,163,184,0.08)",
  agentText: "#334155",
  agentTimestamp: "#94a3b8",
  agentAvatarBg: "#e2e8f0",
  agentAvatarText: "#475569",
  agentAvatarRing: "rgba(148,163,184,0.15)",
  userBubbleBg: "#eff6ff",
  userBubbleBorder: "rgba(59,130,246,0.20)",
  userBubbleShadow: "rgba(59,130,246,0.10)",
  userText: "#1e40af",
  userTimestamp: "#94a3b8",
  userAvatarBg: "#3b82f6",
  userAvatarText: "#ffffff",
  userAvatarRing: "rgba(59,130,246,0.15)",
  inputBg: "#f8fafc",
  inputBorder: "#e2e8f0",
  inputText: "#334155",
  inputPlaceholder: "#94a3b8",
  inputFocusBorder: "#60a5fa",
  sendButtonBg: "#3b82f6",
  sendButtonIcon: "#ffffff",
  sendButtonHoverBg: "#2563eb",
  sendButtonBorder: "rgba(59,130,246,0.30)",
  menuBg: "rgba(241,245,249,0.95)",
  menuText: "#334155",
  menuHoverBg: "rgba(226,232,240,0.80)",
  menuHeaderText: "#64748b",
  accent: "#3b82f6",
  typingDot: "#60a5fa",
  resolvedBannerBg: "#f0fdf4",
  resolvedBannerBorder: "#bbf7d0",
  resolvedBannerText: "#15803d",
  glowTop: "rgba(59,130,246,0.10)",
  glowBottom: "rgba(59,130,246,0.06)",
  statusOnline: "#22c55e",
}

const DARK_THEME = {
  windowBg: "#0f172a",
  windowWrapperBg: "rgba(15,23,42,0.95)",
  windowOverlayStart: "rgba(15,23,42,0.97)",
  windowOverlayMiddle: "rgba(30,41,59,0.95)",
  windowOverlayEnd: "rgba(15,23,42,0.98)",
  windowBorder: "rgba(51,65,85,0.50)",
  windowShadow: "rgba(0,0,0,0.50)",
  windowBgImageOpacity: 0,
  headerGradientStart: "#1e293b",
  headerGradientEnd: "#0f172a",
  headerText: "#f8fafc",
  headerIcon: "#cbd5e1",
  headerBorder: "rgba(51,65,85,0.30)",
  headerBadgeBg: "rgba(248,250,252,0.10)",
  headerBadgeText: "#f8fafc",
  headerBadgeBorder: "rgba(248,250,252,0.15)",
  agentBubbleBg: "#1e293b",
  agentBubbleBorder: "rgba(51,65,85,0.40)",
  agentBubbleShadow: "rgba(0,0,0,0.20)",
  agentText: "#e2e8f0",
  agentTimestamp: "#64748b",
  agentAvatarBg: "#334155",
  agentAvatarText: "#94a3b8",
  agentAvatarRing: "rgba(51,65,85,0.30)",
  userBubbleBg: "#1e3a8a",
  userBubbleBorder: "rgba(59,130,246,0.30)",
  userBubbleShadow: "rgba(59,130,246,0.15)",
  userText: "#dbeafe",
  userTimestamp: "#64748b",
  userAvatarBg: "#3b82f6",
  userAvatarText: "#ffffff",
  userAvatarRing: "rgba(59,130,246,0.25)",
  inputBg: "#1e293b",
  inputBorder: "#334155",
  inputText: "#e2e8f0",
  inputPlaceholder: "#64748b",
  inputFocusBorder: "#60a5fa",
  sendButtonBg: "#3b82f6",
  sendButtonIcon: "#ffffff",
  sendButtonHoverBg: "#2563eb",
  sendButtonBorder: "rgba(59,130,246,0.30)",
  menuBg: "rgba(30,41,59,0.95)",
  menuText: "#e2e8f0",
  menuHoverBg: "rgba(51,65,85,0.60)",
  menuHeaderText: "#94a3b8",
  accent: "#60a5fa",
  typingDot: "#60a5fa",
  resolvedBannerBg: "#064e3b",
  resolvedBannerBorder: "#059669",
  resolvedBannerText: "#6ee7b7",
  glowTop: "rgba(96,165,250,0.12)",
  glowBottom: "rgba(96,165,250,0.06)",
  statusOnline: "#22c55e",
}

const THEME_MAP = {
  "lemon-square": LEMON_SQUARE_THEME,
  "light": LIGHT_THEME,
  "dark": DARK_THEME,
}

const DEFAULT_CUSTOM_COLORS = { ...LEMON_SQUARE_THEME }

const STORAGE_KEY = "lemonsquare-theme"

/* ========================================
   SYNC LOCALSTORAGE HYDRATION
======================================== */

const loadLocalTheme = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)

    return {
      activeThemeId:
        typeof parsed.activeThemeId === "string"
          ? parsed.activeThemeId
          : "lemon-square",

      headerGradientEnabled:
        parsed.headerGradientEnabled !== false,

      customColors: {
        ...DEFAULT_CUSTOM_COLORS,
        ...(parsed.customColors || {}),
      },
    }
  } catch {
    return null
  }
}

/* ========================================
   CONTEXT
======================================== */

const ThemeContext = createContext(null)

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error(
      "useTheme must be used within a ThemeProvider"
    )
  }

  return context
}

/* ========================================
   PROVIDER
======================================== */

export const ThemeProvider = ({
  children,
}) => {

  /* ========================================
     SYNC HYDRATION FROM LOCALSTORAGE
     Instant first paint with saved theme.
  ======================================== */

  const localSnapshot = useMemo(
    () => loadLocalTheme(),
    []
  )

  const [
    activeThemeId,
    setActiveThemeId,
  ] = useState(
    localSnapshot?.activeThemeId ??
      "lemon-square"
  )

  const [
    headerGradientEnabled,
    setHeaderGradientEnabled,
  ] = useState(
    localSnapshot?.headerGradientEnabled ??
      false
  )

  const [
    customColors,
    setCustomColors,
  ] = useState(
    localSnapshot?.customColors ??
      { ...DEFAULT_CUSTOM_COLORS }
  )

  const [
    isHydrated,
    setIsHydrated,
  ] = useState(
    Boolean(localSnapshot)
  )

  /* ========================================
     REFS
  ======================================== */

  const stateRef = useRef({
    activeThemeId,
    headerGradientEnabled,
    customColors,
  })

  stateRef.current = {
    activeThemeId,
    headerGradientEnabled,
    customColors,
  }

  /* ========================================
     CRITICAL: Tracks whether user has
     explicitly changed the theme THIS session.
     Prevents stale backend reconciliation from
     overwriting an active user choice.
  ======================================== */

  const userHasChangedThemeThisSession =
    useRef(false)

  /* ========================================
     ASYNC BACKEND RECONCILIATION
     Fetches authoritative theme. If user has
     already changed theme this session, skip
     applying backend data to avoid race.
  ======================================== */

  useEffect(() => {

    let cancelled = false

    const reconcile = async () => {

      try {

        console.log(
          "[Theme] Starting backend reconciliation..."
        )

        const backendTheme =
          await themeService.getTheme()

        console.log(
          "[Theme] Backend response:",
          backendTheme
        )

        if (
          cancelled ||
          !backendTheme
        ) {
          console.log(
            "[Theme] Reconciliation cancelled or empty response"
          )
          return
        }

        /* ========================================
           RACE CONDITION GUARD
           If user already clicked a theme before
           the fetch completed, trust their choice.
        ======================================== */

        if (
          userHasChangedThemeThisSession.current
        ) {

          console.log(
            "[Theme] User changed theme this session — skipping backend reconciliation to prevent overwrite"
          )

          setIsHydrated(true)

          return
        }

        const {
          activeThemeId: currentId,
          headerGradientEnabled: currentGrad,
          customColors: currentCustom,
        } = stateRef.current

        /* ========================================
           PASCALCASE WIRE FORMAT
        ======================================== */

        const nextId =
          backendTheme.BubbleTheme ||
          "lemon-square"

        const nextGrad =
          backendTheme.HeaderGradientEnabled !==
            false

        const nextCustom = {
          ...currentCustom,
        }

        if (
          backendTheme.CustomHeaderGradientStart
        ) {
          nextCustom.headerGradientStart =
            backendTheme.CustomHeaderGradientStart
        }

        if (
          backendTheme.CustomHeaderGradientEnd
        ) {
          nextCustom.headerGradientEnd =
            backendTheme.CustomHeaderGradientEnd
        }

        if (
          backendTheme.CustomAccent
        ) {
          nextCustom.accent =
            backendTheme.CustomAccent
        }

        if (
          backendTheme.CustomWindowBg
        ) {
          nextCustom.windowBg =
            backendTheme.CustomWindowBg
        }

        console.log(
          "[Theme] Reconciling — current:",
          { currentId, currentGrad },
          "backend:",
          { nextId, nextGrad }
        )

        if (
          nextId !== currentId
        ) {
          setActiveThemeId(
            nextId
          )
        }

        if (
          nextGrad !==
          currentGrad
        ) {
          setHeaderGradientEnabled(
            nextGrad
          )
        }

        const customChanged =
          Object.keys(
            nextCustom
          ).some(
            key =>
              nextCustom[key] !==
              currentCustom[key]
          )

        if (
          customChanged
        ) {
          setCustomColors(
            nextCustom
          )
        }

      } catch (error) {

        console.error(
          "[Theme] Backend reconciliation failed:",
          error
        )

      } finally {

        if (
          !cancelled
        ) {

          setIsHydrated(
            true
          )

          console.log(
            "[Theme] Reconciliation complete. isHydrated = true"
          )
        }
      }
    }

    reconcile()

    return () => {
      cancelled = true
    }

  }, [])

  /* ========================================
     PERSISTENCE EFFECT
     Saves to localStorage + backend.
     CRITICAL FIX: Removed isFirstSaveEffectRun
     guard that was blocking the first real save.
  ======================================== */

  useEffect(() => {

    if (
      !isHydrated
    ) {
      return
    }

    const payload = {
      activeThemeId,
      headerGradientEnabled,
      customColors,
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(payload)
    )

    /* ========================================
       BACKEND PAYLOAD — PASCALCASE
       Matches ThemeSettingsUpdate schema.
    ======================================== */

    const backendPayload = {
      BubbleTheme: activeThemeId,
      HeaderGradientEnabled: headerGradientEnabled,
      CustomHeaderGradientStart:
        customColors.headerGradientStart,
      CustomHeaderGradientEnd:
        customColors.headerGradientEnd,
      CustomAccent:
        customColors.accent,
      CustomWindowBg:
        customColors.windowBg,
    }

    console.log(
      "[Theme] Saving to backend:",
      backendPayload
    )

    themeService
      .saveTheme(
        backendPayload
      )
      .then(
        response => {
          console.log(
            "[Theme] Backend save success:",
            response
          )
        }
      )
      .catch(
        error => {
          console.error(
            "[Theme] Backend save FAILED:",
            error
          )
        }
      )

  }, [
    activeThemeId,
    headerGradientEnabled,
    customColors,
    isHydrated,
  ])

  /* ========================================
     DERIVED THEME
  ======================================== */

  const theme = useMemo(() => {

    const base =
      activeThemeId === "custom"
        ? customColors
        : THEME_MAP[activeThemeId] ||
          THEME_MAP["lemon-square"]

    const headerGradient =
      headerGradientEnabled
        ? `linear-gradient(135deg, ${base.headerGradientStart}, ${base.headerGradientEnd})`
        : base.headerGradientStart

    return {
      ...base,
      id: activeThemeId,
      isCustom:
        activeThemeId === "custom",
      headerGradient,
    }

  }, [
    activeThemeId,
    customColors,
    headerGradientEnabled,
  ])

  /* ========================================
     ACTIONS
     CRITICAL: Set userHasChangedThemeThisSession
     so reconciliation knows not to overwrite.
  ======================================== */

  const setTheme =
    useCallback(
      id => {

        userHasChangedThemeThisSession.current =
          true

        console.log(
          "[Theme] User explicitly set theme:",
          id
        )

        setActiveThemeId(
          id
        )
      },
      []
    )

  const setCustomColor =
    useCallback(
      (key, value) => {

        userHasChangedThemeThisSession.current =
          true

        setCustomColors(
          prev => ({
            ...prev,
            [key]: value,
          })
        )

        if (
          activeThemeId !==
          "custom"
        ) {

          setActiveThemeId(
            "custom"
          )
        }
      },
      [activeThemeId]
    )

  const toggleHeaderGradient =
    useCallback(
      () => {
        setHeaderGradientEnabled(
          prev => !prev
        )
      },
      []
    )

  /* ========================================
     VALUE
  ======================================== */

  const value = useMemo(
    () => ({
      theme,
      activeThemeId,
      headerGradientEnabled,
      customColors,
      setTheme,
      setCustomColor,
      setCustomColors,
      toggleHeaderGradient,
      isHydrated,
    }),

    [
      theme,
      activeThemeId,
      headerGradientEnabled,
      customColors,
      setTheme,
      setCustomColor,
      setCustomColors,
      toggleHeaderGradient,
      isHydrated,
    ]
  )

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  )
}