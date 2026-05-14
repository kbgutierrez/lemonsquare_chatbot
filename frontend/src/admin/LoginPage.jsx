import {
  useState,
} from "react"

import {
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
} from "lucide-react"

const LoginPage = ({
  onLogin,
}) => {

  const [username, setUsername] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [showPassword,
    setShowPassword] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  /* ========================================
     LOGIN
  ======================================== */

  const handleLogin =
    async (e) => {

      e.preventDefault()

      try {

        setLoading(true)

        /*
          BACKEND READY

          FUTURE:
          await authService.login({
            username,
            password,
          })
        */

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              700
            )
        )

        localStorage.setItem(
          "admin_auth",
          "true"
        )

        onLogin()

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

        bg-[#0b1311]

        p-4
      "
    >
      {/* GLOW */}
      <div
        className="
          absolute
          left-[-120px]
          top-[-120px]

          h-[420px]
          w-[420px]

          rounded-full

          bg-[#f5d547]/[0.05]

          blur-3xl
        "
      />

      <div
        className="
          absolute
          bottom-[-180px]
          right-[-140px]

          h-[420px]
          w-[420px]

          rounded-full

          bg-[#95c11f]/[0.06]

          blur-3xl
        "
      />

      {/* CARD */}
      <form
        onSubmit={handleLogin}
        className="
          relative
          z-10

          w-full
          max-w-md

          rounded-[32px]

          border
          border-[#25332d]

          bg-[#101816]/95

          p-8

          shadow-[0_20px_80px_rgba(0,0,0,0.45)]

          backdrop-blur-xl
        "
      >
        {/* LOGO */}
        <div
          className="
            mb-8

            flex
            flex-col
            items-center
          "
        >
          <div
            className="
              mb-4

              flex
              h-16
              w-16
              items-center
              justify-center

              rounded-3xl

              bg-[#f5d547]
            "
          >
            <ShieldCheck
              className="
                h-8
                w-8

                text-[#111917]
              "
            />
          </div>

          <h1
            className="
              text-3xl
              font-bold

              text-white
            "
          >
            Admin Login
          </h1>

          <p
            className="
              mt-2

              text-sm

              text-[#8ea59b]
            "
          >
            Lemon Square AI Dashboard
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

              text-[#d1d5db]
            "
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
            placeholder="Enter username"
            className="
              w-full

              rounded-2xl

              border
              border-[#2a3a33]

              bg-[#151d1b]

              px-4
              py-3

              text-sm
              text-white

              outline-none

              transition-all

              focus:border-[#f5d547]
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

              text-[#d1d5db]
            "
          >
            Password
          </label>

          <div className="relative">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Enter password"
              className="
                w-full

                rounded-2xl

                border
                border-[#2a3a33]

                bg-[#151d1b]

                px-4
                py-3
                pr-12

                text-sm
                text-white

                outline-none

                transition-all

                focus:border-[#f5d547]
              "
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="
                absolute
                right-4
                top-1/2

                -translate-y-1/2

                text-[#8ea59b]
              "
            >
              {showPassword ? (
                <EyeOff
                  className="
                    h-5
                    w-5
                  "
                />
              ) : (
                <Eye
                  className="
                    h-5
                    w-5
                  "
                />
              )}
            </button>
          </div>
        </div>

        {/* LOGIN BUTTON */}
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

            bg-[#f5d547]

            px-4
            py-3

            text-sm
            font-semibold

            text-[#111917]

            transition-all

            hover:opacity-90

            disabled:opacity-50
          "
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

              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </section>
  )
}

export default LoginPage