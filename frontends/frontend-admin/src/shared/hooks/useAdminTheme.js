import { useEffect, useState } from "react"

const STORAGE_KEY = "admin_theme"

const VALID_THEMES = [
  "dark",
  "light",
]

const getInitialTheme = () => {
  const storedTheme = localStorage.getItem(STORAGE_KEY)

  if (VALID_THEMES.includes(storedTheme)) {
    return storedTheme
  }

  return "dark"
}

const applyTheme = (theme) => {
  const root = document.documentElement

  root.setAttribute("data-theme", theme)

  if (theme === "light") {
    root.classList.add("light")
    root.classList.remove("dark")
    return
  }

  root.classList.add("dark")
  root.classList.remove("light")
}

export const useAdminTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)

    localStorage.setItem(
      STORAGE_KEY,
      theme
    )
  }, [theme])

  const toggleTheme = () => {
    setTheme((previousTheme) =>
      previousTheme === "dark"
        ? "light"
        : "dark"
    )
  }

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
  }
}