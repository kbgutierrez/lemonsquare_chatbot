import {
  useEffect,
  useState,
} from "react"

import {
  Phone,
  LoaderCircle,
  Headphones,
  CircleCheckBig,
} from "lucide-react"

import ModalShell from "../components/ModalShell.jsx"

const CallAgentModal = ({
  onClose,
}) => {

  const [connecting, setConnecting] =
    useState(true)

  const [connected, setConnected] =
    useState(false)

  const [queuePosition, setQueuePosition] =
    useState(4)

  const [waitTime, setWaitTime] =
    useState(3)

  /* ========================================
     MOCK CONNECTION FLOW
  ======================================== */

  useEffect(() => {

    const interval =
      setInterval(() => {

        setQueuePosition((prev) => {

          if (prev <= 1) {

            clearInterval(interval)

            setConnecting(false)

            setConnected(true)

            return 1
          }

          return prev - 1
        })

        setWaitTime((prev) =>
          prev > 1
            ? prev - 1
            : 1
        )

      }, 1800)

    return () =>
      clearInterval(interval)

  }, [])

  const stats = [
    {
      label: "Queue Position",
      value: `#${queuePosition}`,
    },
    {
      label: "Estimated Wait",
      value: `${waitTime} min`,
    },
  ]

  return (
    <ModalShell
      onClose={onClose}
      title="Call Agent"
      subtitle="Live Assistance"
      size="sm"
      scrollable={false}
      icon={
        <Phone
          className="
            h-5
            w-5
          "
        />
      }
    >
      <div
        className="
          px-5
          py-6
        "
      >
        {/* CONNECTING */}
        {connecting && (
          <div
            className="
              text-center
            "
          >
            <div
              className="
                flex
                flex-col
                items-center
              "
            >
              <div
                className="
                  mb-4

                  flex
                  h-20
                  w-20
                  items-center
                  justify-center

                  rounded-full

                  bg-violet-100
                "
              >
                <LoaderCircle
                  className="
                    h-9
                    w-9

                    animate-spin

                    text-violet-700
                  "
                />
              </div>

              <h3
                className="
                  text-lg
                  font-semibold

                  text-slate-900
                "
              >
                Finding available agent...
              </h3>

              <p
                className="
                  mt-2

                  text-sm

                  text-slate-500
                "
              >
                Please wait while we connect you to support.
              </p>
            </div>

            {/* QUEUE INFO */}
            <div
              className="
                mt-6
                space-y-3
              "
            >
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="
                    flex
                    items-center
                    justify-between

                    rounded-2xl

                    border
                    border-violet-100

                    bg-violet-50/60

                    px-4
                    py-3
                  "
                >
                  <span
                    className="
                      text-sm

                      text-slate-600
                    "
                  >
                    {item.label}
                  </span>

                  <span
                    className="
                      text-sm
                      font-semibold

                      text-violet-700
                    "
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONNECTED */}
        {connected && (
          <div
            className="
              text-center
            "
          >
            <div
              className="
                mx-auto
                mb-4

                flex
                h-20
                w-20
                items-center
                justify-center

                rounded-full

                bg-emerald-100
              "
            >
              <CircleCheckBig
                className="
                  h-9
                  w-9

                  text-emerald-600
                "
              />
            </div>

            <h3
              className="
                text-lg
                font-semibold

                text-slate-900
              "
            >
              Agent Connected
            </h3>

            <p
              className="
                mt-2

                text-sm

                text-slate-500
              "
            >
              A support representative is now available.
            </p>

            {/* AGENT CARD */}
            <div
              className="
                mt-6

                rounded-3xl

                border
                border-emerald-100

                bg-emerald-50

                p-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center

                    rounded-2xl

                    bg-white
                  "
                >
                  <Headphones
                    className="
                      h-5
                      w-5

                      text-emerald-600
                    "
                  />
                </div>

                <div
                  className="
                    text-left
                  "
                >
                  <p
                    className="
                      text-sm
                      font-semibold

                      text-slate-900
                    "
                  >
                    Agent Placeholder
                  </p>

                  <p
                    className="
                      mt-1

                      text-xs

                      text-slate-500
                    "
                  >
                    Future live support integration
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div
          className="
            mt-6

            flex
            justify-end
          "
        >
          <button
            type="button"
            onClick={onClose}
            className={`
              rounded-2xl

              px-5
              py-2.5

              text-sm
              font-medium

              text-white

              transition-all
              duration-200

              ${
                connected
                  ? `
                    bg-emerald-600
                    hover:bg-emerald-700
                  `
                  : `
                    bg-slate-900
                    hover:bg-slate-800
                  `
              }
            `}
          >
            {connected
              ? "Done"
              : "Cancel Request"}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

export default CallAgentModal