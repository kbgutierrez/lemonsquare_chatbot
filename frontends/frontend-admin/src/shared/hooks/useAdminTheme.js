import {
  useEffect,
  useState,
} from "react"

const STORAGE_KEY =
  "admin_theme"

const VALID_THEMES = [
  "dark",
  "light",
]

const getInitialTheme = () => {

  const storedTheme =
    localStorage.getItem(
      STORAGE_KEY
    )

  if (
    VALID_THEMES.includes(
      storedTheme
    )
  ) {

    return storedTheme
  }

  return "dark"
}

const applyTheme = (
  theme
) => {

  const root =
    document.documentElement

  root.setAttribute(
    "data-theme",
    theme
  )

  /* ========================================
     DARK MODE
  ======================================== */

  if (theme === "dark") {

    root.classList.add(
      "dark"
    )

    root.classList.remove(
      "light"
    )

    /* FOUNDATION */
    root.style.setProperty(
      "--background",
      "#08110f"
    )

    /* PANELS */
    root.style.setProperty(
      "--panel",
      "#101816"
    )

    root.style.setProperty(
      "--panel-light",
      "#15211d"
    )

    /* BORDERS */
    root.style.setProperty(
      "--border",
      "#25332d"
    )

    root.style.setProperty(
      "--border-soft",
      "rgba(255,255,255,0.05)"
    )

    /* HOVER */
    root.style.setProperty(
      "--hover",
      "#1a2420"
    )

    root.style.setProperty(
      "--hover-light",
      "rgba(255,255,255,0.04)"
    )

    /* TEXT */
    root.style.setProperty(
      "--text-primary",
      "#ffffff"
    )

    root.style.setProperty(
      "--text-secondary",
      "#8ea59b"
    )

    root.style.setProperty(
      "--text-muted",
      "#6f837b"
    )

    root.style.setProperty(
      "--placeholder",
      "#6f837b"
    )

    /* BRAND */
    root.style.setProperty(
      "--accent",
      "#f5d547"
    )

    root.style.setProperty(
      "--accent-green",
      "#95c11f"
    )

    /* INPUTS */
    root.style.setProperty(
      "--input-bg",
      "rgba(21,33,29,0.82)"
    )

    root.style.setProperty(
      "--input-bg-focus",
      "rgba(24,38,33,0.92)"
    )

    /* MODAL */
    root.style.setProperty(
      "--modal-overlay",
      "rgba(0,0,0,0.58)"
    )

    /* SHADOWS */
    root.style.setProperty(
      "--shadow-lg",
      "0 20px 80px rgba(0,0,0,0.45)"
    )

    root.style.setProperty(
      "--shadow-soft",
      "0 10px 40px rgba(0,0,0,0.22)"
    )

    /* GLASS */
    root.style.setProperty(
      "--glass-bg",
      "rgba(16,24,22,0.78)"
    )

    root.style.setProperty(
      "--glass-border",
      "rgba(255,255,255,0.05)"
    )

    /* GLOWS */
    root.style.setProperty(
      "--bg-glow-primary",
      "rgba(245,213,71,0.08)"
    )

    root.style.setProperty(
      "--bg-glow-secondary",
      "rgba(149,193,31,0.08)"
    )

    /* GRID */
    root.style.setProperty(
      "--grid-line",
      "rgba(255,255,255,0.02)"
    )

    /* SCROLL */
    root.style.setProperty(
      "--scroll-track",
      "rgba(255,255,255,0.03)"
    )

    root.style.setProperty(
      "--scroll-thumb-start",
      "rgba(245,213,71,0.5)"
    )

    root.style.setProperty(
      "--scroll-thumb-end",
      "rgba(149,193,31,0.5)"
    )

    root.style.setProperty(
      "--scroll-thumb-hover-start",
      "rgba(245,213,71,0.8)"
    )

    root.style.setProperty(
      "--scroll-thumb-hover-end",
      "rgba(149,193,31,0.8)"
    )

    return
  }

  /* ========================================
     LEMON SQUARE LIGHT MODE
  ======================================== */

  root.classList.add(
    "light"
  )

  root.classList.remove(
    "dark"
  )

  /* ========================================
     FOUNDATION
  ======================================== */

  root.style.setProperty(
    "--background",
    "#f7f3df"
  )

  /* ========================================
     PANELS
  ======================================== */

  root.style.setProperty(
    "--panel",
    "#fff9e8"
  )

  root.style.setProperty(
    "--panel-light",
    "#fffdf4"
  )

  /* ========================================
     BORDERS
  ======================================== */

  root.style.setProperty(
    "--border",
    "#e3cf7a"
  )

  root.style.setProperty(
    "--border-soft",
    "rgba(0,128,55,0.08)"
  )

  /* ========================================
     HOVER
  ======================================== */

  root.style.setProperty(
    "--hover",
    "#fff4c7"
  )

  root.style.setProperty(
    "--hover-light",
    "rgba(255,196,0,0.08)"
  )

  /* ========================================
     TEXT
  ======================================== */

  root.style.setProperty(
    "--text-primary",
    "#0b7d33"
  )

  root.style.setProperty(
    "--text-secondary",
    "#567a4d"
  )

  root.style.setProperty(
    "--text-muted",
    "#7b8b6f"
  )

  root.style.setProperty(
    "--placeholder",
    "#8c977f"
  )

  /* ========================================
     BRAND COLORS
     Based on Lemon Square Logo
  ======================================== */

  root.style.setProperty(
    "--accent",
    "#f7c625"
  )

  root.style.setProperty(
    "--accent-green",
    "#008b3e"
  )

  /* ========================================
     INPUTS
  ======================================== */

  root.style.setProperty(
    "--input-bg",
    "rgba(255,249,232,0.96)"
  )

  root.style.setProperty(
    "--input-bg-focus",
    "rgba(255,255,245,1)"
  )

  /* ========================================
     MODALS
  ======================================== */

  root.style.setProperty(
    "--modal-overlay",
    "rgba(0,0,0,0.16)"
  )

  /* ========================================
     SHADOWS
  ======================================== */

  root.style.setProperty(
    "--shadow-lg",
    "0 20px 60px rgba(247,198,37,0.12)"
  )

  root.style.setProperty(
    "--shadow-soft",
    "0 10px 30px rgba(0,139,62,0.08)"
  )

  /* ========================================
     GLASS
  ======================================== */

  root.style.setProperty(
    "--glass-bg",
    "rgba(255,249,232,0.78)"
  )

  root.style.setProperty(
    "--glass-border",
    "rgba(227,207,122,0.4)"
  )

  /* ========================================
     GLOWS
  ======================================== */

  root.style.setProperty(
    "--bg-glow-primary",
    "rgba(247,198,37,0.14)"
  )

  root.style.setProperty(
    "--bg-glow-secondary",
    "rgba(0,139,62,0.10)"
  )

  /* ========================================
     GRID
  ======================================== */

  root.style.setProperty(
    "--grid-line",
    "rgba(0,139,62,0.04)"
  )

  /* ========================================
     SCROLLBAR
  ======================================== */

  root.style.setProperty(
    "--scroll-track",
    "rgba(247,198,37,0.08)"
  )

  root.style.setProperty(
    "--scroll-thumb-start",
    "rgba(247,198,37,0.65)"
  )

  root.style.setProperty(
    "--scroll-thumb-end",
    "rgba(0,139,62,0.55)"
  )

  root.style.setProperty(
    "--scroll-thumb-hover-start",
    "rgba(247,198,37,0.9)"
  )

  root.style.setProperty(
    "--scroll-thumb-hover-end",
    "rgba(0,139,62,0.8)"
  )
}

export const useAdminTheme =
  () => {

    const [theme, setTheme] =
      useState(
        getInitialTheme
      )

    useEffect(() => {

      applyTheme(theme)

      localStorage.setItem(
        STORAGE_KEY,
        theme
      )

    }, [theme])

    const toggleTheme =
      () => {

        setTheme(
          (previousTheme) =>
            previousTheme === "dark"
              ? "light"
              : "dark"
        )
      }

    return {
      theme,

      isDark:
        theme === "dark",

      toggleTheme,
    }
  }