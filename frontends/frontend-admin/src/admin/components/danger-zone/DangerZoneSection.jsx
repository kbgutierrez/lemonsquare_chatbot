import { useState } from "react"

import {
  AlertTriangle,
  Skull,
  ShieldAlert,
} from "lucide-react"

import FactoryResetModal from "./modals/FactoryResetModal"

const DangerZoneSection = () => {
  const [
    showFactoryReset,
    setShowFactoryReset,
  ] = useState(false)

  return (
    <div
      className="
        mx-auto
        flex
        h-full
        w-full
        max-w-[1400px]
        flex-col
        gap-6
        overflow-auto
        px-2
      "
    >
      {/* HEADER */}

      <div>
        <h1
          className="
            text-2xl
            font-bold
            text-[var(--text-primary)]
          "
        >
          Danger Zone
        </h1>

        <p
          className="
            mt-2
            text-sm
            text-[var(--text-secondary)]
          "
        >
          High risk maintenance operations.
          These actions can permanently
          destroy AI knowledge and cannot
          be undone.
        </p>
      </div>

      {/* WARNING */}

      <div
        className="
          rounded-3xl
          border
          border-red-500/20

          bg-red-500/[0.04]

          p-6
        "
      >
        <div
          className="
            flex
            items-start
            gap-4
          "
        >
          <div
            className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center

              rounded-2xl

              bg-red-500/10
            "
          >
            <ShieldAlert
              className="
                h-7
                w-7
                text-red-500
              "
            />
          </div>

          <div>
            <h2
              className="
                text-lg
                font-semibold
                text-red-400
              "
            >
              Factory Reset AI Knowledge
            </h2>

            <p
              className="
                mt-2
                max-w-3xl
                text-sm
                leading-relaxed
                text-[var(--text-secondary)]
              "
            >
              This operation permanently
              deletes all AI knowledge,
              embeddings, manual entries,
              uploaded documents, vector
              data and generated AI memory.

              <br />
              <br />

              Tickets will be preserved.

              <br />
              <br />

              This action is irreversible.
            </p>
          </div>
        </div>

        <div
          className="
            mt-8
            flex
            justify-end
          "
        >
          <button
            onClick={() =>
              setShowFactoryReset(
                true
              )
            }
            className="
              flex
              items-center
              gap-2

              rounded-2xl

              bg-gradient-to-r
              from-red-600
              to-red-700

              px-6
              py-3

              font-semibold
              text-white

              transition-all
              duration-200

              hover:scale-[1.02]
              active:scale-[0.98]
            "
          >
            <Skull
              className="
                h-4
                w-4
              "
            />

            Factory Reset AI Knowledge
          </button>
        </div>
      </div>

      <FactoryResetModal
        open={showFactoryReset}
        onClose={() =>
          setShowFactoryReset(
            false
          )
        }
      />
    </div>
  )
}

export default DangerZoneSection