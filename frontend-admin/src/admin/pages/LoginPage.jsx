import {
  useState,
} from "react"

import {
  ShieldCheck,
  Loader2,
} from "lucide-react"

const LoginPage = ({
  onLogin,
}) => {

  const [
    userToken,
    setUserToken,
  ] = useState("")

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState("")

  /* ========================================
     LOGIN
  ======================================== */

  const handleLogin =
    async (e) => {

      e.preventDefault()

      const trimmedToken =
        userToken.trim()

      if (!trimmedToken) {

        setError(
          "User ID is required."
        )

        return
      }

      try {

        setLoading(true)

        setError("")

        /*
          SIMPLE TOKEN SESSION

          No authentication.
          No backend validation.

          Only persist the
          user_token locally.
        */

        localStorage.setItem(
          "admin_auth",
          "true"
        )

        localStorage.setItem(
          "admin_user_token",
          trimmedToken
        )

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              400
            )
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
            Admin Access
          </h1>

          <p
            className="
              mt-2

              text-sm

              text-[#8ea59b]
            "
          >
            Enter your User ID
          </p>
        </div>

        {/* USER TOKEN */}
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
            User ID
          </label>

          <input
            type="text"
            value={userToken}
            onChange={(e) =>
              setUserToken(
                e.target.value
              )
            }
            placeholder="Enter User ID"
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

          {error && (
            <p
              className="
                mt-2

                text-sm

                text-red-400
              "
            >
              {error}
            </p>
          )}
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

              Entering...
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