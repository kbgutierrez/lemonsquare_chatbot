import { useEffect, useState } from "react"
import {
  Phone,
  X,
  LoaderCircle,
  Headphones,
  CircleCheckBig,
} from "lucide-react"

const CallAgentModal = ({ onClose }) => {
  const [closing, setClosing] = useState(false)
  const [connecting, setConnecting] = useState(true)
  const [connected, setConnected] = useState(false)
  const [queuePosition, setQueuePosition] = useState(4)
  const [waitTime, setWaitTime] = useState(3)

  const close = () => {
    setClosing(true)
    setTimeout(onClose, 200)
  }

  /* MOCK CONNECTION FLOW */
  useEffect(() => {
    const interval = setInterval(() => {
      setQueuePosition((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setConnecting(false)
          setConnected(true)
          return 1
        }

        return prev - 1
      })

      setWaitTime((prev) => (prev > 1 ? prev - 1 : 1))
    }, 1800)

    return () => clearInterval(interval)
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
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 backdrop-blur-[4px] transition-all duration-200 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Modal */}
      <div
        className={`w-full max-w-sm overflow-hidden rounded-[30px] border border-violet-100 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.18)] transition-all duration-300 ${
          closing
            ? "translate-y-4 scale-95 opacity-0"
            : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100">
              <Phone className="h-5 w-5 text-violet-700" />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-500">
                Live Assistance
              </p>

              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                Call Agent
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-100 bg-white transition hover:bg-violet-50"
          >
            <X className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-6">
          {/* Connecting */}
          {connecting && (
            <div className="animate-in fade-in">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100">
                  <LoaderCircle className="h-9 w-9 animate-spin text-violet-700" />
                </div>

                <h3 className="text-lg font-semibold text-slate-900">
                  Finding available agent...
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Please wait while we connect you to support.
                </p>
              </div>

              {/* Queue Info */}
              <div className="mt-6 space-y-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3"
                  >
                    <span className="text-sm text-slate-600">
                      {item.label}
                    </span>

                    <span className="text-sm font-semibold text-violet-700">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connected */}
          {connected && (
            <div className="animate-in fade-in text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <CircleCheckBig className="h-9 w-9 text-emerald-600" />
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Agent Connected
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                A support representative is now available.
              </p>

              {/* Agent Card */}
              <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
                    <Headphones className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">
                      Agent Placeholder
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Future live support integration
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={close}
              className={`rounded-2xl px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 ${
                connected
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              {connected ? "Done" : "Cancel Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CallAgentModal