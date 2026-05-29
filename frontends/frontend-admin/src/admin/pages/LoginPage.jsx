import { useState }
  from "react"

import {
  Loader2,
} from "lucide-react"

import { apiClient }
  from "../../shared/api/client"

import API_ENDPOINTS
  from "../../shared/api/endpoints"

import LemonLogo
  from "../../assets/Lemon_logo_With_CatchPhrase.jpg"

const LoginPage = ({
  onLogin,
}) => {

  const [username, setUsername] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  const handleLogin = async (e) => {

    e.preventDefault()

    const trimmedUsername =
      username.trim()

    const trimmedPassword =
      password.trim()

    if (
      !trimmedUsername ||
      !trimmedPassword
    ) {

      setError(
        "Username and password are required."
      )

      return
    }

    try {

      setLoading(true)
      setError("")

      const response =
        await apiClient.post(
          API_ENDPOINTS.LSBIZPORTAL_LOGIN,
          {
            username:
              trimmedUsername,

            password:
              trimmedPassword,
          }
        )

      if (
        !response ||
        response?.success === false
      ) {

        throw new Error(
          response?.message ||
          response?.error ||
          "Authentication failed."
        )
      }

      /* ========================================
         NORMALIZE USER PAYLOAD
      ======================================== */

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
          .trim() ||
          "Authenticated User",

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

        raw_data:
          rawUser,
      }

      localStorage.setItem(
        "admin_auth",
        "true"
      )

      localStorage.setItem(
        "admin_user",
        JSON.stringify(
          normalizedUser
        )
      )

      if (response?.token) {
        localStorage.setItem(
          "admin_user_token",
          String(response.token)
        )
      }

      onLogin(
        normalizedUser
      )

    } catch (err) {

      setError(
        err.message ||
        "Login failed."
      )

    } finally {

      setLoading(false)
    }
  }

  return (
    <section
      className="
        relative

        flex
        min-h-screen
        items-center
        justify-center

        overflow-hidden

        p-4
      "
      style={{
        background:
          `
            radial-gradient(
              circle at top left,
              var(--bg-glow-primary),
              transparent 28%
            ),
            radial-gradient(
              circle at bottom right,
              var(--bg-glow-secondary),
              transparent 30%
            ),
            var(--background)
          `,
      }}
    >

      {/* BACKGROUND GLOW */}
      <div
        className="
          absolute
          left-[-120px]
          top-[-120px]

          h-[420px]
          w-[420px]

          rounded-full

          blur-3xl
        "
        style={{
          background:
            "var(--bg-glow-primary)",
        }}
      />

      <div
        className="
          absolute
          bottom-[-180px]
          right-[-140px]

          h-[420px]
          w-[420px]

          rounded-full

          blur-3xl
        "
        style={{
          background:
            "var(--bg-glow-secondary)",
        }}
      />

      {/* GRID */}
      <div
        className="
          absolute
          inset-0

          opacity-40
        "
        style={{
          backgroundImage:
            `
              linear-gradient(
                var(--grid-line) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                var(--grid-line) 1px,
                transparent 1px
              )
            `,

          backgroundSize:
            "40px 40px",

          maskImage:
            `
              radial-gradient(
                circle at center,
                black,
                transparent 90%
              )
            `,
        }}
      />

      {/* LOGIN CARD */}
      <form
        onSubmit={handleLogin}
        className="
          glass-panel

          relative
          z-10

          w-full
          max-w-md

          overflow-hidden

          rounded-[32px]

          p-8
        "
      >

        {/* TOP LIGHT */}
        <div
          className="
            absolute
            inset-x-0
            top-0

            h-px
          "
          style={{
            background:
              "var(--glass-border)",
          }}
        />

        {/* HEADER */}
        <div
          className="
            mb-8

            flex
            flex-col
            items-center
          "
        >

          {/* LOGO */}
          <img
            src={LemonLogo}

            alt="Lemon Square"

            className="
              mb-6

              h-auto
              w-full
              max-w-[220px]

              object-contain
            "
          />

          {/* TITLE */}
          <h1
            className="
              text-3xl
              font-bold
            "
            style={{
              color:
                "var(--text-primary)",
            }}
          >
            Admin Access
          </h1>

          {/* SUBTITLE */}
          <p
            className="
              mt-2

              text-sm
            "
            style={{
              color:
                "var(--text-secondary)",
            }}
          >
            Enter your credentials
          </p>

        </div>

        {/* USERNAME */}
        <div className="mb-4">

          <label
            className="
              mb-2
              block

              text-sm
              font-medium
            "
            style={{
              color:
                "var(--text-primary)",
            }}
          >
            Username
          </label>

          <input
            type="text"

            value={username}

            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }

            className="
              input-base
            "
          />

        </div>

        {/* PASSWORD */}
        <div className="mb-6">

          <label
            className="
              mb-2
              block

              text-sm
              font-medium
            "
            style={{
              color:
                "var(--text-primary)",
            }}
          >
            Password
          </label>

          <input
            type="password"

            value={password}

            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }

            className="
              input-base
            "
          />

          {error && (
            <p
              className="
                mt-3

                text-sm
              "
              style={{
                color:
                  "#ef4444",
              }}
            >
              {error}
            </p>
          )}

        </div>

        {/* SUBMIT */}
        <button
          type="submit"

          disabled={loading}

          className="
            flex
            w-full
            items-center
            justify-center
            gap-2

            rounded-2xl

            px-4
            py-3

            text-sm
            font-semibold

            transition-all
            duration-200

            hover:opacity-90

            disabled:opacity-50
            disabled:cursor-not-allowed
          "
          style={{
            background:
              "var(--accent)",

            color:
              "var(--background)",
          }}
        >

          {loading ? (
            <>

              <Loader2
                className="
                  h-4
                  w-4
                  animate-spin
                "
              />

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