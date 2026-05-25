import { LogOut }
  from "lucide-react"

import {
  navigationItems,
} from "../constants/navigation"

import LemonLogo
  from "../../assets/Lemon_logo_With_CatchPhrase.jpg"

const SidebarMenu = ({
  activeView,
  setActiveView,
  onLogout,
  adminUser,
  isMobile = false,
}) => {

  /* ========================================
     USER INFO
  ======================================== */

  const displayName =
    adminUser?.name ||
    "Authenticated User"

  const displayRole =
    adminUser?.role ||
    "Administrator"

  /* ========================================
     CLASS HELPERS
  ======================================== */

  const headerLayout =
    isMobile
      ? `
        flex
        flex-col
        items-stretch
        gap-4
        p-4
      `
      : `
        flex
        flex-col
        gap-4
        px-5
        py-5
      `

  const logoutLayout =
    isMobile
      ? "w-full px-4 py-3 rounded-xl"
      : "h-11 w-11 rounded-xl"

  return (
    <aside
      className={`
        flex
        h-full
        min-h-0
        w-full
        flex-col
        overflow-hidden

        border-r

        shadow-[0_10px_40px_rgba(0,0,0,0.12)]

        select-none

        ${isMobile ? "rounded-r-3xl" : ""}
      `}
      style={{
        borderColor:
          "var(--border)",

        background:
          "var(--panel)",
      }}
    >

      {/* HEADER */}
      <div
        className={`
          mb-5
          shrink-0

          border-b

          ${headerLayout}
        `}
        style={{
          borderColor:
            "var(--border)",

          background:
            "var(--panel-light)",
        }}
      >

        {/* LOGO */}
        <div
          className="
            flex
            items-center
            justify-center
          "
        >

          <img
            src={LemonLogo}

            alt="Lemon Square"

            className="
              h-auto

              w-full
              max-w-[150px]

              object-contain
            "
          />

        </div>

        {/* USER */}
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >

          {/* NAME */}
          <div
            className="
              min-w-0
              flex-1

              rounded-xl

              px-3
              py-2

              transition-all
              duration-200

              hover:bg-white/[0.04]
            "
          >

            <h2
              className="
                truncate

                text-[15px]
                font-semibold
              "
              style={{
                color:
                  "var(--text-primary)",
              }}
            >
              {displayName}
            </h2>

            <p
              className="
                mt-0.5

                truncate

                text-xs
              "
              style={{
                color:
                  "var(--text-secondary)",
              }}
            >
              {displayRole}
            </p>

          </div>

          {/* LOGOUT */}
          <button
            type="button"

            onClick={onLogout}

            className={`
              flex
              shrink-0
              items-center
              justify-center
              gap-2

              transition-all
              duration-200

              hover:bg-red-500/10
              hover:text-red-300

              ${logoutLayout}
            `}
            style={{
              border:
                "1px solid var(--border)",

              background:
                "var(--panel)",

              color:
                "var(--text-secondary)",
            }}
          >

            <LogOut
              className="
                h-4
                w-4
              "
            />

            {isMobile && (
              <span
                className="
                  text-sm
                  font-medium
                "
              >
                Logout
              </span>
            )}

          </button>

        </div>

      </div>

      {/* NAV LABEL */}
      <div
        className="
          mb-3
          shrink-0

          px-4
        "
      >

        <p
          className="
            text-[11px]
            font-semibold
            uppercase

            tracking-[0.22em]
          "
          style={{
            color:
              "var(--text-secondary)",
          }}
        >
          Navigation
        </p>

      </div>

      {/* MENU */}
      <div
        className="
          flex-1
          min-h-0

          overflow-y-auto
          overflow-x-hidden

          px-3
          pb-3

          [scrollbar-width:none]

          [&::-webkit-scrollbar]:hidden
        "
      >

        <div
          className="
            flex
            flex-col
            gap-1
          "
        >

          {navigationItems.map(
            ({
              id,
              label,
              icon: Icon,
            }) => {

              const active =
                activeView === id

              return (
                <button
                  key={id}

                  type="button"

                  onClick={() =>
                    setActiveView(id)
                  }

                  className="
                    group

                    flex
                    w-full
                    min-w-0
                    items-center
                    gap-3

                    rounded-xl

                    px-3
                    py-3

                    text-left

                    transition-all
                    duration-200

                    hover:bg-white/[0.03]
                  "
                  style={{
                    border:
                      active
                        ? `
                          1px solid
                          var(--border)
                        `
                        : `
                          1px solid
                          transparent
                        `,

                    background:
                      active
                        ? "var(--panel-light)"
                        : "transparent",

                    color:
                      "var(--text-primary)",
                  }}
                >

                  {/* ICON */}
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center

                      rounded-lg

                      transition-all
                      duration-200
                    "
                    style={{
                      background:
                        active
                          ? "var(--accent)"
                          : "var(--panel-light)",

                      color:
                        active
                          ? "#111917"
                          : "var(--text-secondary)",
                    }}
                  >

                    <Icon
                      className="
                        h-4.5
                        w-4.5
                        shrink-0
                      "
                    />

                  </div>

                  {/* LABEL */}
                  <span
                    className="
                      min-w-0
                      flex-1

                      truncate

                      text-sm
                      font-medium
                    "
                  >
                    {label}
                  </span>

                </button>
              )
            }
          )}

        </div>

      </div>

    </aside>
  )
}

export default SidebarMenu