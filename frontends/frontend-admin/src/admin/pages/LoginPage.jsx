import { useState } from "react"
import { ShieldCheck, Loader2 } from "lucide-react"
import { apiClient } from "../../shared/api/client"
import API_ENDPOINTS from "../../shared/api/endpoints"

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()

    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()

    if (!trimmedUsername || !trimmedPassword) {
      setError("Username and password are required.")
      return
    }

    try {
      setLoading(true)
      setError("")

      const response = await apiClient.post(
        API_ENDPOINTS.LSBIZPORTAL_LOGIN,
        {
          username: trimmedUsername,
          password: trimmedPassword,
        }
      )

      if (!response || response?.success === false) {
        throw new Error(
          response?.message ||
          response?.error ||
          "Authentication failed."
        )
      }

      // ========================================
      // NORMALIZE USER PAYLOAD
      // ========================================

      const rawUser =
        response?.data?.response ||
        response?.data ||
        {}

      const normalizedUser = {
        success: true,

        id:
          rawUser?.id ||
          rawUser?.user_id ||
          null,

        name: [
          rawUser?.firstname,
          rawUser?.lastname,
        ]
          .filter(Boolean)
          .join(" ")
          .trim() || "Authenticated User",

        firstname:
          rawUser?.firstname || "",

        lastname:
          rawUser?.lastname || "",

        email:
          rawUser?.email || "",

        department:
          rawUser?.department ||
          rawUser?.department_acro ||
          "Admin Panel",

        department_acro:
          rawUser?.department_acro || "",

        company:
          rawUser?.company || "",

        raw_data: rawUser,
      }

      localStorage.setItem(
        "admin_auth",
        "true"
      )

      localStorage.setItem(
        "admin_user",
        JSON.stringify(normalizedUser)
      )

      onLogin(normalizedUser)

    } catch (err) {
      setError(
        err.message || "Login failed."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1311] p-4">

      <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#f5d547]/[0.05] blur-3xl" />
      <div className="absolute bottom-[-180px] right-[-140px] h-[420px] w-[420px] rounded-full bg-[#95c11f]/[0.06] blur-3xl" />

      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md rounded-[32px] border border-[#25332d] bg-[#101816]/95 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      >
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f5d547]">
            <ShieldCheck className="h-8 w-8 text-[#111917]" />
          </div>

          <h1 className="text-3xl font-bold text-white">
            Admin Access
          </h1>

          <p className="mt-2 text-sm text-[#8ea59b]">
            Enter your credentials
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-[#d1d5db]">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full rounded-2xl border border-[#2a3a33] bg-[#151d1b] px-4 py-3 text-sm text-white outline-none focus:border-[#f5d547]"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-[#d1d5db]">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-2xl border border-[#2a3a33] bg-[#151d1b] px-4 py-3 text-sm text-white outline-none focus:border-[#f5d547]"
          />

          {error && (
            <p className="mt-2 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f5d547] px-4 py-3 text-sm font-semibold text-[#111917] hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </form>
    </section>
  )
}

export default LoginPage