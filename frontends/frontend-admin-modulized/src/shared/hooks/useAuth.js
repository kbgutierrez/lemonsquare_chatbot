import { useCallback, useEffect, useState } from "react"

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState(null)

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth")
    const storedUser = localStorage.getItem("admin_user")
    if (auth === "true") {
      setIsAuthenticated(true)
      if (storedUser) { try { setAdminUser(JSON.parse(storedUser)) } catch { localStorage.removeItem("admin_user") } }
    }
  }, [])

  const login = useCallback((userData) => {
    setAdminUser(userData)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("admin_auth")
    localStorage.removeItem("admin_user")
    localStorage.removeItem("admin_user_token")
    setAdminUser(null)
    setIsAuthenticated(false)
  }, [])

  return { isAuthenticated, adminUser, login, logout }
}

export default useAuth
