import { useState } from "react"
import { ShieldCheck, LoaderCircle, Eye, EyeOff } from "lucide-react"

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!username.trim() || !password.trim()) { setError("Please enter both username and password."); return }
    setLoading(true)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.detail || data?.message || "Login failed")
      localStorage.setItem("admin_auth", "true")
      localStorage.setItem("admin_user", JSON.stringify(data.user || { name: username }))
      onLogin(data.user || { name: username })
    } catch (e) {
      setError(e.message || "Login failed")
    } finally { setLoading(false) }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-[#08110f] p-4">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 90%)',
        }}
      />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#2b3933] bg-[#18211f] shadow-lg">
            <ShieldCheck className="h-8 w-8 text-[#f5d547]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-[#74877f]">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="card-surface-light section-padding space-y-4">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-400">
              {error}
            </div>
          )}
          <div>
            <label className="text-label mb-1.5 block">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username"
              className="input-base" autoComplete="username" />
          </div>
          <div>
            <label className="text-label mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter password" className="input-base pr-10" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74877f] hover:text-white">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
